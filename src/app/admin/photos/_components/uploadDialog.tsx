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
import { ChevronDownIcon, PlusIcon, UploadIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

export interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  enqueueRaw: (
    files: {
      file: File;
      description?: string;
      location?: string;
      takenAt?: Date;
    }[],
  ) => void;
}

export default function UploadDialog({
  open,
  onOpenChange,
  files,
  setFiles,
  enqueueRaw,
}: UploadDialogProps) {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const validFiles = files.filter(isFileValid);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (validFiles.length === 0) {
      return;
    }
    const trimmedDescription = description.trim();
    const trimmedLocation = location.trim();
    enqueueRaw(
      validFiles.map((file) => ({
        file,
        description: trimmedDescription === "" ? undefined : trimmedDescription,
        location: trimmedLocation === "" ? undefined : trimmedLocation,
        takenAt: new Date(file.lastModified),
      })),
    );
    setDescription("");
    setLocation("");
    onOpenChange(false);
  }

  const fileCompoents = files.map((file) => {
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
                setFiles(files.filter((f) => f.name !== file.name))
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
        <DialogDescription>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              id="upload-files"
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                setFiles(files);
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
                <Button variant="ghost" className="group w-full">
                  Selected files ({files.length}){" "}
                  <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-1 pr-1 pl-3">{fileCompoents}</div>
              </CollapsibleContent>
            </Collapsible>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="strip-location"
                className="border-input text-primary focus-visible:ring-ring/50 size-4 rounded border shadow-xs focus-visible:ring-[3px]"
              />
              <Label htmlFor="strip-location" className="leading-none">
                Remove location from photos?
              </Label>
            </div>
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

            <Button
              type="submit"
              className="mt-3 w-full"
              disabled={validFiles.length === 0}
            >
              <UploadIcon /> Upload {validFiles.length} file
              {validFiles.length === 1 ? "" : "s"}
            </Button>
          </form>
        </DialogDescription>
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
          className="max-h-56 max-w-56"
        />
      </TooltipContent>
    </Tooltip>
  );
}
