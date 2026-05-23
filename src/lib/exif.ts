import exifr from "exifr";

export interface PhotoMetadata {
  takenAt?: Date;
  location?: { lat: number; lon: number };
}

export interface PhotoWithMetadata {
  file: File;
  metadata: PhotoMetadata;
}

export async function readPhotoMetadata(file: File): Promise<PhotoMetadata> {
  const [dateData, gpsData] = await Promise.all([
    exifr
      .parse(file, {
        pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"],
      })
      .catch(() => undefined),
    exifr.gps(file).catch(() => undefined),
  ]);

  const takenAt: Date | undefined =
    dateData?.DateTimeOriginal ?? dateData?.CreateDate ?? dateData?.ModifyDate;

  const lat = gpsData?.latitude;
  const lon = gpsData?.longitude;

  return {
    takenAt: takenAt instanceof Date ? takenAt : undefined,
    location:
      typeof lat === "number" && typeof lon === "number"
        ? { lat, lon }
        : undefined,
  };
}

export async function readPhotosWithMetadata(
  files: File[],
): Promise<PhotoWithMetadata[]> {
  return Promise.all(
    files.map(async (file) => ({
      file,
      metadata: await readPhotoMetadata(file),
    })),
  );
}
