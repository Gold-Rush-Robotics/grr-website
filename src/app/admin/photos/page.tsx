"use client";

import { Container } from "@/app/_components/container";
import { Typography } from "@/app/_components/typography";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import UploadDialog from "./_components/uploadDialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { api } from "@/trpc/react";
import Gallery from "@/app/_components/gallery";
import { useUploadManager } from "./_hooks/useUploadManager";

function hasFiles(event: DragEvent) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

export default function TestPage() {
  const {
    data: storageData,
    isLoading: storageDataLoading,
    error: storageDataError,
  } = api.photos.getStorageData.useQuery();

  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { enqueue } = useUploadManager();

  useEffect(() => {
    if (!dialogOpen && droppedFiles.length > 0) {
      setDroppedFiles([]);
    }
  }, [droppedFiles, dialogOpen]);

  useEffect(() => {
    function clearDragState() {
      dragDepthRef.current = 0;
      setIsDragging(false);
    }

    function handleDragEnter(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      dragDepthRef.current += 1;
      setIsDragging(true);
    }

    function handleDragOver(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      setIsDragging(true);
    }

    function handleDragLeave(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();

      const leftViewport =
        event.clientX <= 0 ||
        event.clientY <= 0 ||
        event.clientX >= window.innerWidth ||
        event.clientY >= window.innerHeight;

      if (leftViewport) {
        clearDragState();
        return;
      }

      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDragging(false);
      }
    }

    function handleDrop(event: DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      clearDragState();
      setDroppedFiles(Array.from(event.dataTransfer?.files ?? []));
      setDialogOpen(true);
    }

    function handleDragEnd() {
      clearDragState();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clearDragState();
      }
    }

    function handleWindowBlur() {
      clearDragState();
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") {
        clearDragState();
      }
    }

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragend", handleDragEnd);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragend", handleDragEnd);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function photoDataString() {
    if (storageDataLoading) {
      return "Loading storage usage data...";
    }

    if (storageDataError) {
      return "Error loading storage usage data";
    }

    const storageUsage = // MB, rounded to 2 decimal places
      Math.round(((storageData?.totalBytes ?? 0) / 1024 / 1024) * 100) / 100;

    return `${storageData?.totalCount ?? 0} photos (${storageUsage} MB used)`;
  }

  return (
    <>
      {isDragging && droppedFiles.length === 0 && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-blue-500/10">
          <div className="flex h-full items-center justify-center p-8">
            <div className="bg-background/95 rounded-xl border-2 border-dashed border-blue-500 px-8 py-6 text-center shadow-lg">
              <Typography variant="h3">Drop photos anywhere</Typography>
              <Typography className="text-muted-foreground">
                Release to handle the files on this page.
              </Typography>
            </div>
          </div>
        </div>
      )}

      <Container
        className={cn(
          "space-y-4 transition-opacity",
          isDragging && "opacity-60",
        )}
      >
        <Typography variant="h1">Manage Photos</Typography>
        <Typography className="text-muted-foreground">
          {photoDataString()} · drag and drop photos to upload
        </Typography>
        {droppedFiles.length > 0 ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Dropped {droppedFiles.length} file
            {droppedFiles.length === 1 ? "" : "s"}:{" "}
            {droppedFiles.map((file) => file.name).join(", ")}
          </div>
        ) : null}

        <Gallery />

        <UploadDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          files={droppedFiles}
          setFiles={setDroppedFiles}
          enqueueRaw={enqueue}
        />

        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            pointerEvents: "auto",
          }}
          className="flex"
        >
          <Button
            variant="default"
            size="icon-lg"
            className="size-14 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700"
            onClick={() => setDialogOpen(true)}
            aria-label="Upload Files"
          >
            <Upload />
          </Button>
        </div>
      </Container>
    </>
  );
}
