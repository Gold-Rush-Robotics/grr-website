import { DateTime, Duration } from "luxon";

export const FULL_RES_WEBP_QUALITY = 0.85;
export const THUMBNAIL_WEBP_QUALITY = 0.5;
export const THUMBNAIL_MAX_DIMENSION = 640;
export const REFETCH_DEBOUNCE_MS = 750;
export const SLOW_PROGRESS_UI_MS = 5000;
export const ETA_ROUND_SECONDS = 15;

export function getConcurrency() {
  const cores =
    typeof navigator !== "undefined" && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 4;
  return {
    compression: Math.max(2, Math.min(cores - 1, 6)),
    upload: Math.max(3, Math.min(cores, 8)),
  };
}

export function formatMB(bytes: number) {
  return (Math.round((bytes / 1024 / 1024) * 10) / 10).toFixed(1);
}

export function estimateTotalUploadBytes(
  totalUploadBytes: number,
  sourceBytesCompressed: number,
  originalBytesPendingCompression: number,
) {
  if (sourceBytesCompressed <= 0) return totalUploadBytes;
  const ratio = totalUploadBytes / sourceBytesCompressed;
  return totalUploadBytes + originalBytesPendingCompression * ratio;
}

export function combinedRingFraction(
  compressionDone: number,
  compressionPeak: number,
  uploadedBytes: number,
  estimatedTotalBytes: number,
) {
  const compressionFraction =
    compressionPeak > 0 ? compressionDone / compressionPeak : 1;
  const uploadFraction =
    estimatedTotalBytes > 0
      ? Math.min(1, uploadedBytes / estimatedTotalBytes)
      : 0;
  return 0.5 * compressionFraction + 0.5 * uploadFraction;
}

export function computeRoundedEtaSecondsRemaining(
  sessionStartMs: number,
  progress01: number,
) {
  if (!sessionStartMs) return null;
  const start = DateTime.fromMillis(sessionStartMs);
  const elapsedSec = DateTime.now().diff(start).as("seconds");
  if (progress01 <= 1e-6) return null;
  const remainingRaw = (elapsedSec / progress01) * (1 - progress01);
  return Math.max(
    0,
    Math.round(remainingRaw / ETA_ROUND_SECONDS) * ETA_ROUND_SECONDS,
  );
}

export function formatEtaRemaining(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s < ETA_ROUND_SECONDS) {
    return "Under 15s remaining";
  }
  if (s >= 60) {
    const minutesRounded = Math.round(
      Duration.fromObject({ seconds: s }).as("minutes"),
    );
    const m = Math.max(1, minutesRounded);
    return `${m} minute${m === 1 ? "" : "s"} remaining`;
  }
  return `${s} second${s === 1 ? "" : "s"} remaining`;
}

export function putWithUploadProgress(
  file: File,
  uploadUrl: string,
  mimeType: string,
  onChunk: (delta: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let lastLoaded = 0;
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const delta = event.loaded - lastLoaded;
      lastLoaded = event.loaded;
      if (delta > 0) onChunk(delta);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", mimeType);
    xhr.send(file);
  });
}
