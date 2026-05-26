"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

import { api } from "@/trpc/react";
import { CircularProgress } from "@/app/_components/circular-progress";

import {
  combinedRingFraction,
  computeRoundedEtaSecondsRemaining,
  estimateTotalUploadBytes,
  formatEtaRemaining,
  formatMB,
  FULL_RES_WEBP_QUALITY,
  getConcurrency,
  putWithUploadProgress,
  REFETCH_DEBOUNCE_MS,
  SLOW_PROGRESS_UI_MS,
  THUMBNAIL_MAX_DIMENSION,
  THUMBNAIL_WEBP_QUALITY,
} from "./upload-photo-helpers";

export interface UploadQueueItem {
  id: string;
  sourceFile: File;
  thumbnailFile: File;
  fullResFile: File;
  thumbnailUploadUrl: string;
  fullResUploadUrl: string;
  thumbnailKey: string;
  fullResKey: string;
  mimeType: string;
  description: string | null;
  location: string | { lat: number; lon: number } | null;
  takenAt: Date;
}

interface CompressionItem {
  id: string;
  sourceFile: File;
  description?: string;
  location?: string | { lat: number; lon: number };
  takenAt?: Date;
}

interface FrozenUploadEstimate {
  estimatedUploadTotalBytes: number;
  originalBytesPendingCompression: number;
}

// --- toast copy (depends on React; lives here so the hook reads top-to-bottom) ---

function progressToastTitle(
  uploadDone: number,
  photoTotal: number,
  etaSeconds: number | null,
) {
  const base = `Uploading photos (${uploadDone} / ${photoTotal})`;
  if (etaSeconds === null) return base;
  return `${base} · ${formatEtaRemaining(etaSeconds)}`;
}

function progressToastDescriptionLines(
  compStillRunning: boolean,
  compressionDone: number,
  compressionPeak: number,
  frozen: FrozenUploadEstimate,
  uploadedBytes: number,
  originalBytesPendingCompression: number,
): ReactNode[] {
  const lines: ReactNode[] = [];
  if (compStillRunning) {
    lines.push(
      <span className="block" key="compress">
        {`Compressing (${compressionDone} / ${compressionPeak})`}
      </span>,
    );
  }
  if (compressionDone > 0 && frozen.estimatedUploadTotalBytes > 0) {
    const displayTotal = Math.max(
      frozen.estimatedUploadTotalBytes,
      uploadedBytes,
    );
    const estimatedSuffix =
      compStillRunning || originalBytesPendingCompression > 0
        ? " estimated"
        : "";
    lines.push(
      <span className="block" key="bytes">
        {`Uploading (${formatMB(uploadedBytes)} MB / ${formatMB(displayTotal)} MB${estimatedSuffix})`}
      </span>,
    );
  }
  return lines;
}

/**
 * Batch compress → presign → upload pipeline with one Sonner progress toast.
 *
 * Two queues: compression (CPU-bound workers) then upload (network workers).
 * `runCompressionFromQueue` / `runUploadsFromQueue` dequeue until concurrency is
 * full; each job’s `finally` calls the same runner again (worker pool).
 */
export function useUploadManager() {
  const presignUploads = api.photos.presignUploads.useMutation();
  const uploadFinished = api.photos.uploadFinished.useMutation();
  const utils = api.useUtils();

  const compressionQueueRef = useRef<CompressionItem[]>([]);
  const compressionActiveRef = useRef(0);
  const uploadQueueRef = useRef<UploadQueueItem[]>([]);
  const uploadActiveRef = useRef(0);
  const concurrencyRef = useRef(getConcurrency());

  const [compressionDone, setCompressionDone] = useState(0);
  const [compressionPeak, setCompressionPeak] = useState(0);
  const [uploadDone, setUploadDone] = useState(0);
  const [uploadPeak, setUploadPeak] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalUploadBytes, setTotalUploadBytes] = useState(0);
  const [sourceBytesCompressed, setSourceBytesCompressed] = useState(0);
  const [originalBytesPendingCompression, setOriginalBytesPendingCompression] =
    useState(0);

  const sessionActiveRef = useRef(false);
  const sessionStartMsRef = useRef(0);
  const progressToastIdRef = useRef<string | number | null>(null);
  const slowUiIntervalRef = useRef<number | null>(null);

  // Throttled toast snapshot (byte estimate + ETA)
  const [slowUiTick, setSlowUiTick] = useState(0);
  const lastFrozenSlowTickRef = useRef(-1);
  const frozenUploadEstimateRef = useRef({
    estimatedUploadTotalBytes: 0,
    originalBytesPendingCompression: 0,
  });
  const displayedEtaSecondsRef = useRef<number | null>(null);
  const frozenEstimateBootstrapDoneRef = useRef(false);

  const refetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearSlowUiInterval() {
    const id = slowUiIntervalRef.current;
    if (id != null) {
      window.clearInterval(id);
      slowUiIntervalRef.current = null;
    }
  }

  function ensureSlowUiInterval() {
    if (slowUiIntervalRef.current != null) return;
    slowUiIntervalRef.current = window.setInterval(() => {
      setSlowUiTick((n) => n + 1);
    }, SLOW_PROGRESS_UI_MS);
  }

  const scheduleGalleryRefetch = useCallback(() => {
    if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    refetchTimerRef.current = setTimeout(() => {
      refetchTimerRef.current = null;
      void utils.photos.getCountsByMonth.invalidate();
      void utils.photos.getMonthPhotos.invalidate();
    }, REFETCH_DEBOUNCE_MS);
  }, [utils]);

  const refetchOnDrain = useCallback(() => {
    if (refetchTimerRef.current) {
      clearTimeout(refetchTimerRef.current);
      refetchTimerRef.current = null;
    }
    void utils.photos.getCountsByMonth.invalidate();
    void utils.photos.getMonthPhotos.invalidate();
    void utils.photos.getStorageData.invalidate();
  }, [utils]);

  const uploadFile = useCallback(
    (args: {
      file: File;
      uploadUrl: string;
      mimeType: string;
      onChunk: (delta: number) => void;
    }) =>
      putWithUploadProgress(
        args.file,
        args.uploadUrl,
        args.mimeType,
        args.onChunk,
      ),
    [],
  );

  const runCompressionFromQueueRef = useRef<(() => void) | null>(null);
  const runUploadsFromQueueRef = useRef<(() => void) | null>(null);

  const compressOne = useCallback(
    async (item: CompressionItem) => {
      try {
        const fullResFile = await imageCompression(item.sourceFile, {
          initialQuality: FULL_RES_WEBP_QUALITY,
          useWebWorker: true,
          fileType: "image/webp",
        });
        const thumbnailFile = await imageCompression(item.sourceFile, {
          maxWidthOrHeight: THUMBNAIL_MAX_DIMENSION,
          initialQuality: THUMBNAIL_WEBP_QUALITY,
          useWebWorker: true,
          fileType: "image/webp",
        });

        const presigned = await presignUploads.mutateAsync([
          {
            fileName: `${item.sourceFile.name}-thumbnail.webp`,
            fileSize: thumbnailFile.size,
            fileType: thumbnailFile.type,
          },
          {
            fileName: `${item.sourceFile.name}-full.webp`,
            fileSize: fullResFile.size,
            fileType: fullResFile.type,
          },
        ]);

        const thumb = presigned[0];
        const full = presigned[1];
        if (!thumb || !full) {
          throw new Error("Missing presigned URLs");
        }

        const upload: UploadQueueItem = {
          id: item.id,
          sourceFile: item.sourceFile,
          thumbnailFile,
          fullResFile,
          thumbnailUploadUrl: thumb.uploadUrl,
          fullResUploadUrl: full.uploadUrl,
          thumbnailKey: thumb.key,
          fullResKey: full.key,
          mimeType: fullResFile.type,
          description: item.description ?? null,
          location: item.location ?? null,
          takenAt: item.takenAt ?? new Date(item.sourceFile.lastModified),
        };

        uploadQueueRef.current.push(upload);
        setUploadPeak((p) => p + 1);
        setTotalUploadBytes((t) => t + thumbnailFile.size + fullResFile.size);
        setSourceBytesCompressed((s) => s + item.sourceFile.size);
        setCompressionDone((d) => d + 1);

        runUploadsFromQueueRef.current?.();
      } catch (err) {
        toast.error(
          `Failed to compress ${item.sourceFile.name}: ${
            (err as Error)?.message ?? "Unknown error"
          }`,
          { position: "bottom-right", className: "mb-16" },
        );
        setCompressionPeak((p) => Math.max(0, p - 1));
      } finally {
        setOriginalBytesPendingCompression((b) =>
          Math.max(0, b - item.sourceFile.size),
        );
      }
    },
    [presignUploads],
  );

  const uploadOne = useCallback(
    async (item: UploadQueueItem) => {
      try {
        await uploadFile({
          file: item.thumbnailFile,
          uploadUrl: item.thumbnailUploadUrl,
          mimeType: item.thumbnailFile.type,
          onChunk: (delta) => setUploadedBytes((b) => b + delta),
        });
        await uploadFile({
          file: item.fullResFile,
          uploadUrl: item.fullResUploadUrl,
          mimeType: item.fullResFile.type,
          onChunk: (delta) => setUploadedBytes((b) => b + delta),
        });
        await uploadFinished.mutateAsync({
          thumbnailKey: item.thumbnailKey,
          fullResKey: item.fullResKey,
          mimeType: item.mimeType,
          description: item.description ?? undefined,
          location:
            typeof item.location === "string" ? item.location : undefined,
          gpsLat:
            typeof item.location === "object" ? item.location?.lat : undefined,
          gpsLon:
            typeof item.location === "object" ? item.location?.lon : undefined,
          takenAt: item.takenAt,
        });
        setUploadDone((d) => d + 1);
        scheduleGalleryRefetch();
      } catch (err) {
        toast.error(
          `Failed to upload ${item.sourceFile.name}: ${
            (err as Error)?.message ?? "Unknown error"
          }`,
          { position: "bottom-right", className: "mb-16" },
        );
        setUploadPeak((p) => Math.max(0, p - 1));
        setTotalUploadBytes((t) =>
          Math.max(0, t - item.thumbnailFile.size - item.fullResFile.size),
        );
        setSourceBytesCompressed((s) => Math.max(0, s - item.sourceFile.size));
      }
    },
    [uploadFile, uploadFinished, scheduleGalleryRefetch],
  );

  const runCompressionFromQueue = useCallback(() => {
    while (
      compressionActiveRef.current < concurrencyRef.current.compression &&
      compressionQueueRef.current.length > 0
    ) {
      const item = compressionQueueRef.current.shift();
      if (!item) break;
      compressionActiveRef.current += 1;
      void compressOne(item).finally(() => {
        compressionActiveRef.current = Math.max(
          0,
          compressionActiveRef.current - 1,
        );
        runCompressionFromQueueRef.current?.();
      });
    }
  }, [compressOne]);

  const runUploadsFromQueue = useCallback(() => {
    while (
      uploadActiveRef.current < concurrencyRef.current.upload &&
      uploadQueueRef.current.length > 0
    ) {
      const item = uploadQueueRef.current.shift();
      if (!item) break;
      uploadActiveRef.current += 1;
      void uploadOne(item).finally(() => {
        uploadActiveRef.current = Math.max(0, uploadActiveRef.current - 1);
        runUploadsFromQueueRef.current?.();
      });
    }
  }, [uploadOne]);

  useEffect(() => {
    runCompressionFromQueueRef.current = runCompressionFromQueue;
  }, [runCompressionFromQueue]);

  useEffect(() => {
    runUploadsFromQueueRef.current = runUploadsFromQueue;
  }, [runUploadsFromQueue]);

  const enqueue = useCallback(
    (
      files: {
        file: File;
        description?: string;
        location?: string | { lat: number; lon: number };
        takenAt?: Date;
      }[],
    ) => {
      const valid = files.filter(
        (f) => (f.file.type.split("/")[0] ?? "") === "image",
      );
      if (valid.length === 0) return;
      const items: CompressionItem[] = valid.map((entry) => ({
        id: crypto.randomUUID(),
        sourceFile: entry.file,
        description: entry.description,
        location: entry.location,
        takenAt: entry.takenAt,
      }));
      compressionQueueRef.current.push(...items);
      const wasNewSession = !sessionActiveRef.current;
      sessionActiveRef.current = true;
      if (wasNewSession) {
        sessionStartMsRef.current = Date.now();
      }
      setCompressionPeak((p) => p + items.length);
      setOriginalBytesPendingCompression(
        (b) => b + items.reduce((sum, i) => sum + i.sourceFile.size, 0),
      );
      runCompressionFromQueue();
    },
    [runCompressionFromQueue],
  );

  useEffect(() => {
    if (
      !sessionActiveRef.current &&
      compressionPeak === 0 &&
      uploadPeak === 0
    ) {
      return;
    }

    const idle =
      compressionQueueRef.current.length === 0 &&
      compressionActiveRef.current === 0 &&
      uploadQueueRef.current.length === 0 &&
      uploadActiveRef.current === 0;

    const compStillRunning =
      compressionActiveRef.current > 0 ||
      compressionQueueRef.current.length > 0;

    function resetSessionState() {
      setCompressionDone(0);
      setCompressionPeak(0);
      setSourceBytesCompressed(0);
      setOriginalBytesPendingCompression(0);
      setUploadDone(0);
      setUploadPeak(0);
      setUploadedBytes(0);
      setTotalUploadBytes(0);
      setSlowUiTick(0);
      lastFrozenSlowTickRef.current = -1;
      displayedEtaSecondsRef.current = null;
      sessionStartMsRef.current = 0;
      frozenEstimateBootstrapDoneRef.current = false;
      clearSlowUiInterval();
    }

    if (
      sessionActiveRef.current &&
      idle &&
      compressionPeak === 0 &&
      uploadPeak === 0
    ) {
      if (progressToastIdRef.current) {
        toast.dismiss(progressToastIdRef.current);
        progressToastIdRef.current = null;
      }
      sessionActiveRef.current = false;
      resetSessionState();
      return;
    }

    const finishedSuccess =
      uploadPeak > 0 && uploadDone >= uploadPeak && idle && !compStillRunning;

    if (finishedSuccess) {
      if (progressToastIdRef.current) {
        toast.dismiss(progressToastIdRef.current);
        progressToastIdRef.current = null;
      }
      sessionActiveRef.current = false;
      refetchOnDrain();
      resetSessionState();
      return;
    }

    ensureSlowUiInterval();

    const estimatedTotalBytes = estimateTotalUploadBytes(
      totalUploadBytes,
      sourceBytesCompressed,
      originalBytesPendingCompression,
    );
    const ringFraction = combinedRingFraction(
      compressionDone,
      compressionPeak,
      uploadedBytes,
      estimatedTotalBytes,
    );

    if (lastFrozenSlowTickRef.current !== slowUiTick) {
      lastFrozenSlowTickRef.current = slowUiTick;
      frozenUploadEstimateRef.current = {
        estimatedUploadTotalBytes: estimatedTotalBytes,
        originalBytesPendingCompression,
      };
      displayedEtaSecondsRef.current =
        uploadDone >= 1
          ? computeRoundedEtaSecondsRemaining(
              sessionStartMsRef.current,
              ringFraction,
            )
          : null;
    } else if (
      compressionDone > 0 &&
      estimatedTotalBytes > 0 &&
      !frozenEstimateBootstrapDoneRef.current
    ) {
      frozenEstimateBootstrapDoneRef.current = true;
      frozenUploadEstimateRef.current = {
        estimatedUploadTotalBytes: estimatedTotalBytes,
        originalBytesPendingCompression,
      };
    } else if (
      uploadDone >= 1 &&
      sessionStartMsRef.current > 0 &&
      displayedEtaSecondsRef.current === null &&
      ringFraction > 1e-6
    ) {
      displayedEtaSecondsRef.current = computeRoundedEtaSecondsRemaining(
        sessionStartMsRef.current,
        ringFraction,
      );
    }

    const frozen = frozenUploadEstimateRef.current;
    const etaSec = displayedEtaSecondsRef.current;

    const id = progressToastIdRef.current ?? "photo-upload-progress-toast";
    progressToastIdRef.current = id;

    const photoTotal = Math.max(compressionPeak, uploadPeak);
    const title = progressToastTitle(uploadDone, photoTotal, etaSec);
    const descriptionLines = progressToastDescriptionLines(
      compStillRunning,
      compressionDone,
      compressionPeak,
      frozen,
      uploadedBytes,
      originalBytesPendingCompression,
    );

    toast.message(title, {
      id,
      duration: Infinity,
      position: "bottom-right",
      className: "mb-16",
      description:
        descriptionLines.length > 0 ? <>{descriptionLines}</> : undefined,
      icon: <CircularProgress fraction={ringFraction} />,
    });
  }, [
    uploadDone,
    uploadPeak,
    uploadedBytes,
    totalUploadBytes,
    compressionDone,
    compressionPeak,
    sourceBytesCompressed,
    originalBytesPendingCompression,
    refetchOnDrain,
    slowUiTick,
  ]);

  return { enqueue };
}
