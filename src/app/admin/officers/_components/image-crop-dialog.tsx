"use client";

import { useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";

interface ImageCropDialogProps {
  file?: File;
  onCancel: () => void;
  onCrop: (file: File) => void;
}

export function ImageCropDialog({
  file,
  onCancel,
  onCrop,
}: ImageCropDialogProps) {
  const [imageUrl, setImageUrl] = useState<string>();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area>();
  const [isCropping, setIsCropping] = useState(false);
  const [cropError, setCropError] = useState<string>();

  useEffect(() => {
    if (!file) {
      setImageUrl(undefined);
      return;
    }

    const nextImageUrl = URL.createObjectURL(file);
    setImageUrl(nextImageUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(undefined);
    setCropError(undefined);

    return () => URL.revokeObjectURL(nextImageUrl);
  }, [file]);

  async function applyCrop() {
    if (!file || !imageUrl || !croppedArea) return;
    setIsCropping(true);
    setCropError(undefined);
    try {
      onCrop(await createCroppedImage(imageUrl, croppedArea, file.name));
    } catch (error) {
      setCropError(
        error instanceof Error ? error.message : "Unable to crop the image.",
      );
    } finally {
      setIsCropping(false);
    }
  }

  return (
    <Dialog open={Boolean(file)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop officer photo</DialogTitle>
          <DialogDescription>
            Move and zoom the image to choose the square shown on the Contact
            page.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-[50vh] min-h-72 overflow-hidden rounded-md bg-black">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              objectFit="cover"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedArea(pixels)}
            />
          )}
        </div>

        <Field orientation="horizontal">
          <FieldLabel htmlFor="officer-photo-zoom">Zoom</FieldLabel>
          <Slider
            id="officer-photo-zoom"
            min={1}
            max={3}
            step={0.01}
            value={[zoom]}
            disabled={isCropping}
            onValueChange={([value]) => setZoom(value ?? 1)}
          />
        </Field>
        {cropError && <FieldError>{cropError}</FieldError>}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isCropping}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isCropping || !croppedArea}
            onClick={() => void applyCrop()}
          >
            {isCropping && <Spinner />}
            Use crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Draws the selected crop onto a canvas and returns a webp File. Submit uploads
 * this file as-is, so quality is decided here rather than compressed again.
 */
async function createCroppedImage(
  imageUrl: string,
  crop: Area,
  originalName: string,
) {
  const image = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot crop the selected image.");
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result
          ? resolve(result)
          : reject(new Error("Unable to create the cropped image.")),
      "image/webp",
      0.95,
    );
  });
  const baseName = originalName.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}-cropped.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Unable to read the selected image."));
    image.src = source;
  });
}
