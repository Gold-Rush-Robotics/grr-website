"use client";

import { revalidateLogic } from "@tanstack/react-form";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { useAppForm } from "@/app/_components/form/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { z } from "@/lib/zod";
import { ImageCropDialog } from "./image-crop-dialog";

export type OfficerValues = {
  name: string;
  role: string;
  email: string;
  photoKey: string | null;
  photoUrl: string | null;
};

interface OfficerDialogProps {
  open: boolean;
  initialValues?: OfficerValues;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: OfficerValues,
    photo?: File,
    onPhotoUploaded?: (photoKey: string) => void,
  ) => Promise<void>;
}

const emptyOfficer: OfficerValues = {
  name: "",
  role: "",
  email: "",
  photoKey: null,
  photoUrl: null,
};

const officerSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(100),
  role: z.string().trim().min(1, "Enter a role.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  photoKey: z.string().nullable(),
  photoUrl: z.string().nullable(),
});

export function OfficerDialog({
  open,
  initialValues,
  isPending,
  onOpenChange,
  onSubmit,
}: OfficerDialogProps) {
  const [photo, setPhoto] = useState<File>();
  const [cropSource, setCropSource] = useState<File>();
  const [photoToCrop, setPhotoToCrop] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string>();
  const [isLoadingCrop, setIsLoadingCrop] = useState(false);
  const isEditing = Boolean(initialValues);
  const form = useAppForm({
    defaultValues: initialValues ?? emptyOfficer,
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "blur",
    }),
    validators: { onDynamic: officerSchema },
    onSubmit: async ({ value }) => {
      setSubmissionError(undefined);
      try {
        await onSubmit(value, photo, (photoKey) => {
          setPhoto(undefined);
          form.setFieldValue("photoKey", photoKey);
        });
      } catch (submissionError) {
        setSubmissionError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to save the officer.",
        );
      }
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(initialValues ?? emptyOfficer);
    setPhoto(undefined);
    setCropSource(undefined);
    setPhotoToCrop(undefined);
    setPreviewUrl(null);
    setSubmissionError(undefined);
  }, [form, initialValues, open]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function selectPhoto(file?: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhoto(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function editCrop() {
    if (cropSource) {
      setPhotoToCrop(cropSource);
      return;
    }
    const displayedPhoto = previewUrl ?? form.state.values.photoUrl;
    if (!displayedPhoto) return;

    setIsLoadingCrop(true);
    setSubmissionError(undefined);
    try {
      const response = await fetch(displayedPhoto);
      if (!response.ok) throw new Error("Unable to load the officer photo.");
      const blob = await response.blob();
      const source = new File([blob], "officer-photo", {
        type: blob.type,
        lastModified: Date.now(),
      });
      setCropSource(source);
      setPhotoToCrop(source);
    } catch (cropError) {
      setSubmissionError(
        cropError instanceof Error
          ? cropError.message
          : "Unable to load the officer photo.",
      );
    } finally {
      setIsLoadingCrop(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit officer" : "New officer"}
              </DialogTitle>
              <DialogDescription>
                Officer details appear on the public Contact page.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Name"
                    required
                    maxLength={100}
                    disabled={isPending}
                  />
                )}
              </form.AppField>
              <form.AppField name="role">
                {(field) => (
                  <field.TextField
                    label="Role"
                    required
                    maxLength={100}
                    disabled={isPending}
                  />
                )}
              </form.AppField>
              <form.AppField name="email">
                {(field) => (
                  <field.TextField
                    label="Email"
                    type="email"
                    required
                    maxLength={254}
                    disabled={isPending}
                  />
                )}
              </form.AppField>
              <form.Subscribe
                selector={(state) => [
                  state.values.photoKey,
                  state.values.photoUrl,
                ]}
              >
                {([photoKey, photoUrl]) => {
                  const displayedPhoto = previewUrl ?? photoUrl;
                  return (
                    <Field>
                      <FieldLabel htmlFor="officer-photo">Photo</FieldLabel>
                      {displayedPhoto && (
                        <div className="mb-2 flex items-start gap-1">
                          <img
                            src={displayedPhoto}
                            alt="Officer photo preview"
                            className="size-24 object-cover"
                          />
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Edit photo crop"
                            disabled={isPending || isLoadingCrop}
                            onClick={() => void editCrop()}
                          >
                            {isLoadingCrop ? <Spinner /> : <Pencil />}
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          id="officer-photo"
                          type="file"
                          accept="image/*"
                          disabled={isPending}
                          onChange={(event) => {
                            const selectedPhoto = event.target.files?.[0];
                            setCropSource(selectedPhoto);
                            setPhotoToCrop(selectedPhoto);
                            event.currentTarget.value = "";
                          }}
                        />
                        {Boolean(displayedPhoto ?? photoKey) && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => {
                              selectPhoto();
                              setCropSource(undefined);
                              form.setFieldValue("photoKey", null);
                              form.setFieldValue("photoUrl", null);
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Images are cropped to a square before upload. With no
                        photo, the default image is used.
                      </p>
                    </Field>
                  );
                }}
              </form.Subscribe>
              {submissionError && <FieldError>{submissionError}</FieldError>}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <form.AppForm>
                <form.SubmitButton disabled={isPending}>
                  {isEditing ? "Save changes" : "Add officer"}
                </form.SubmitButton>
              </form.AppForm>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ImageCropDialog
        file={photoToCrop}
        onCancel={() => {
          if (photoToCrop !== photo) setCropSource(undefined);
          setPhotoToCrop(undefined);
        }}
        onCrop={(croppedPhoto) => {
          selectPhoto(croppedPhoto);
          setCropSource(croppedPhoto);
          setPhotoToCrop(undefined);
        }}
      />
    </>
  );
}
