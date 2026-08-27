import exifr from "exifr";

export interface PhotoMetadata {
  takenAt?: Date;
  location?: { lat: number; lon: number };
}

export interface PhotoWithMetadata {
  file: File;
  metadata: PhotoMetadata;
}

interface ExifDateData {
  DateTimeOriginal?: unknown;
  CreateDate?: unknown;
  ModifyDate?: unknown;
}

export async function readPhotoMetadata(file: File): Promise<PhotoMetadata> {
  const [rawDateData, gpsData] = await Promise.all([
    exifr
      .parse(file, {
        pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"],
      })
      .then((value: unknown) => value)
      .catch(() => undefined),
    exifr.gps(file).catch(() => undefined),
  ]);

  const dateData =
    typeof rawDateData === "object" && rawDateData !== null
      ? (rawDateData as ExifDateData)
      : undefined;
  const rawTakenAt =
    dateData?.DateTimeOriginal ?? dateData?.CreateDate ?? dateData?.ModifyDate;
  const takenAt = rawTakenAt instanceof Date ? rawTakenAt : undefined;

  const lat = gpsData?.latitude;
  const lon = gpsData?.longitude;

  return {
    takenAt,
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
