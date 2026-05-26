import { Typography } from "@/app/_components/typography";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PhotoWithMetadata } from "@/lib/exif";
import { ChevronDownIcon, PlusIcon, UploadIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

export interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: PhotoWithMetadata[];
  setFiles: (files: PhotoWithMetadata[]) => void;
  setSelectedFiles: (files: File[]) => Promise<void>;
  enqueueRaw: (
    files: {
      file: File;
      description?: string;
      location?: string | { lat: number; lon: number };
      takenAt?: Date;
    }[],
  ) => void;
}

export default function UploadDialog({
  open,
  onOpenChange,
  files,
  setFiles,
  setSelectedFiles,
  enqueueRaw,
}: UploadDialogProps) {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [usePhotoLocation, setUsePhotoLocation] = useState(true);

  const countWithoutLocation = files.filter(
    ({ metadata }) => metadata.location === undefined,
  ).length;

  const validFiles = files.filter(({ file }) => isFileValid(file));

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (validFiles.length === 0) {
      return;
    }
    const trimmedDesc = description.trim();
    const trimmedLocation = location.trim();
    const fallbackLocation =
      trimmedLocation === "" ? undefined : trimmedLocation;
    enqueueRaw(
      validFiles.map(({ file, metadata }) => {
        const resolvedLocation:
          | string
          | { lat: number; lon: number }
          | undefined = usePhotoLocation
          ? (metadata.location ?? fallbackLocation)
          : fallbackLocation;

        return {
          file,
          description: trimmedDesc === "" ? undefined : trimmedDesc,
          location: resolvedLocation,
          takenAt: metadata.takenAt ?? new Date(file.lastModified),
        };
      }),
    );
    setDescription("");
    setLocation("");
    onOpenChange(false);
  }

  const fileCompoents = files.map(({ file }) => {
    const valid = isFileValid(file);
    const invalidColor = valid ? "" : "text-destructive";
    return (
      <FilePreviewTooltip key={file.name} file={file} valid={valid}>
        <div>
          <div className="flex items-center justify-between">
            <Typography className={invalidColor}>{file.name}</Typography>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setFiles(files.filter((f) => f.file.name !== file.name))
              }
            >
              <XIcon />
            </Button>
          </div>
          {!valid && (
            <Typography className="text-destructive mt-[-8] text-xs">
              Invalid file type
            </Typography>
          )}
        </div>
      </FilePreviewTooltip>
    );
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
        </DialogHeader>
        <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <Input
              id="upload-files"
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                void setSelectedFiles(files);
              }}
            />
            <div className="flex items-center">
              <Button asChild type="button" variant="outline">
                <Label htmlFor="upload-files" className="w-full cursor-pointer">
                  Browse files.... (or drag and drop)
                  <PlusIcon className="ml-auto size-4" />
                </Label>
              </Button>
            </div>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="group w-full">
                  Selected files ({files.length}){" "}
                  <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="max-h-[50vh] overflow-y-auto pt-1 pr-1 pl-3">
                  {fileCompoents}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo-description">
              Description (applies to all photos in this upload)
            </Label>
            <Input
              type="text"
              id="photo-description"
              placeholder="Enter a description (optional)"
              className="w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            {/* Change labels based on toggle */}
            {!usePhotoLocation && (
              <div className="space-y-2">
                <Label htmlFor="photo-location">
                  Location (applies to all photos in this upload)
                </Label>
                <Input
                  type="text"
                  id="photo-location"
                  placeholder="Enter a location (optional)"
                  className="w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}
            {usePhotoLocation && countWithoutLocation > 0 && (
              <div className="space-y-2">
                <Label htmlFor="photo-location">
                  Location fallback (applies to {countWithoutLocation} photo(s)
                  without location metadata)
                </Label>
                <Input
                  type="text"
                  id="photo-location"
                  placeholder="Enter a location fallback (optional)"
                  className="w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="use-photo-location"
                className="border-input text-primary focus-visible:ring-ring/50 size-4 rounded border shadow-xs focus-visible:ring-[3px]"
                checked={usePhotoLocation}
                onChange={(e) => setUsePhotoLocation(e.target.checked)}
              />
              <Label htmlFor="use-photo-location" className="leading-none">
                Use GPS coordinates in photo metadata as locations?
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-3 w-full"
            disabled={validFiles.length === 0}
          >
            <UploadIcon /> Upload {validFiles.length} file
            {validFiles.length === 1 ? "" : "s"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function isFileValid(file: File) {
  return (file.type.split("/")[0] ?? "") === "image";
}

interface FilePreviewTooltipProps {
  file: File;
  valid: boolean;
  children: ReactNode;
}

function FilePreviewTooltip({
  file,
  valid,
  children,
}: FilePreviewTooltipProps) {
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    if (!valid) {
      setPreviewUrl(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, valid]);

  if (!valid || !previewUrl) {
    return children;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={10}
        className="bg-popover p-1"
        arrowClassName="bg-popover fill-popover"
      >
        <img
          src={previewUrl}
          alt={`Preview of ${file.name}`}
          className="relative z-10 max-h-56 max-w-56"
        />
      </TooltipContent>
    </Tooltip>
  );
}
