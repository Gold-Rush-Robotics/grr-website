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
import { ChevronDownIcon, PlusIcon, UploadIcon, XIcon } from "lucide-react";

export interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  enqueueRaw: (files: File[]) => void;
}

export default function UploadDialog({
  open,
  onOpenChange,
  files,
  setFiles,
  enqueueRaw,
}: UploadDialogProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const filesToUpload = files.filter(
      (file) => (file.type.split("/")[0] ?? "") === "image",
    );
    if (filesToUpload.length === 0) {
      return;
    }
    enqueueRaw(filesToUpload);
    onOpenChange(false);
  }

  const fileCompoents = files.map((file) => {
    const valid = isFileValid(file);
    const invalidColor = valid ? "" : "text-destructive";
    return (
      <div key={file.name}>
        <div className="flex items-center justify-between">
          <Typography className={invalidColor}>{file.name}</Typography>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setFiles(files.filter((f) => f.name !== file.name))}
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

            <Button type="submit" className="mt-3 w-full">
              <UploadIcon /> Upload {files.length} files
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
