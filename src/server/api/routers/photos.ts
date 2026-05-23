import { db } from "@/server/db";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "@/lib/zod";
import { Prisma } from "@/generated/prisma/client";
import {
  checkS3KeyExists,
  getS3Bucket,
  getS3Client,
  getS3ObjectUrl,
} from "@/server/s3";
import { reverseGeocode } from "@/server/geocoder";
import {
  ListObjectsV2Command,
  PutObjectCommand,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { extension } from "mime-types";
import type { Photo } from "@/generated/prisma/client";

const PHOTO_GALLERY_TZ = "America/New_York";
const monthDateSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Expected YYYY-MM");

export const photosRouter = createTRPCRouter({
  /**
   * Gets all photos (source URL/metadata) for a given month.
   * @param input.date - The month to get photos for in the format YYYY-MM.
   * @returns The URLs/metadata of photos for the given month.
   */
  getMonthPhotos: publicProcedure
    .input(
      z.object({
        date: monthDateSchema,
      }),
    )
    .query(async ({ input }) => {
      const photos = await db.$queryRaw<Photo[]>(Prisma.sql`
        SELECT
          "id",
          "thumbnailKey",
          "fullResKey",
          "description",
          "location",
          "gpsLat",
          "gpsLon",
          "takenAt",
          "mimeType",
          "createdAt",
          "updatedAt"
        FROM "Photo"
        WHERE to_char(
          date_trunc(
            'month',
            "takenAt" AT TIME ZONE ${PHOTO_GALLERY_TZ}
          ),
          'YYYY-MM'
        ) = ${input.date} /* this isn't sql injectible btw, typescript the goat fr */
        ORDER BY "takenAt" ASC
      `);
      return photos.map((photo) => ({
        ...photo,
        thumbnailUrl: getS3ObjectUrl(photo.thumbnailKey),
        fullResUrl: getS3ObjectUrl(photo.fullResKey),
      }));
    }),

  /**
   * Gets the total overall photo count and the total storage used in the S3 bucket.
   * This is probably not the best way to do query size as it generates a lot of requests
   * to the S3 bucket, but it's *probably* fine..?
   * @returns An object with totalCount and totalBytes fields.
   */
  getStorageData: protectedProcedure.query(async () => {
    const totalCountResult = await db.$queryRaw<{ count: number }[]>(
      Prisma.sql`
        SELECT COUNT(*)::int as count FROM "Photo"
      `,
    );
    const totalCount = totalCountResult[0]?.count ?? 0;

    const s3Client = getS3Client();
    let continuationToken: string | undefined = undefined;
    let totalBytes = 0;

    do {
      const command = new ListObjectsV2Command({
        Bucket: getS3Bucket(),
        ContinuationToken: continuationToken,
      });
      const response: ListObjectsV2CommandOutput = await s3Client.send(command);

      if (response.Contents) {
        for (const obj of response.Contents) {
          totalBytes += obj.Size ?? 0;
        }
      }

      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return {
      totalCount,
      totalBytes,
    };
  }),

  /**
   * Gets the counts of photos by month.
   * @returns The number of photos for each month.
   */
  getCountsByMonth: publicProcedure.query(async () => {
    const countsByMonth = await db.$queryRaw<
      Array<{ month: string; count: number }>
    >(Prisma.sql`
      SELECT month, COUNT(*)::int AS count
      FROM (
        SELECT to_char(
          date_trunc(
            'month',
            "takenAt" AT TIME ZONE ${PHOTO_GALLERY_TZ}
          ),
          'YYYY-MM'
        ) AS month
        FROM "Photo"
      ) sub
      GROUP BY month
      ORDER BY month DESC
    `);
    return countsByMonth;
  }),

  /**
   * Presigns upload URLs for a given array of files to upload to storage bucket.
   * These URLs are used by the client to upload the files to the bucket.
   * @param input.files - The files to presign upload URLs for.
   * @returns The presigned upload URLs for the given files.
   */
  presignUploads: protectedProcedure
    .input(
      z.array(
        z.object({
          fileName: z.string(),
          fileSize: z.number(),
          fileType: z.mimeType({
            allowedTopLevelTypes: ["image", "video"],
            message: "Invalid MIME type in at least one file.",
          }),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      const s3Client = getS3Client();
      const uploads = await Promise.all(
        input.map(async (file) => {
          const key = `${randomUUID()}.${extension(file.fileType)}`;
          const command = new PutObjectCommand({
            Bucket: getS3Bucket(),
            Key: key,
            ContentLength: file.fileSize,
            ContentType: file.fileType,
          });
          const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600, // 1 hour
          });

          return { key, uploadUrl, fileName: file.fileName };
        }),
      );

      return uploads;
    }),

  /**
   * Called after a file has been successfully uploaded to the storage bucket,
   *  so it can be put in the database.
   * @param input.key - The key of the file in the storage bucket.
   * @param input.mimeType - The MIME type of the file.
   * @param input.description - The description of the photo.
   * @param input.location - The location of the photo.
   * @param input.takenAt - The date and time the photo was taken.
   */
  uploadFinished: protectedProcedure
    .input(
      z.object({
        thumbnailKey: z.string(),
        fullResKey: z.string(),
        mimeType: z.mimeType(),
        description: z.string().optional(),
        location: z.string().optional(),
        gpsLat: z.number().optional(),
        gpsLon: z.number().optional(),
        takenAt: z.date(),
      }),
    )
    .mutation(async ({ input }) => {
      const shouldGeocode =
        !input.location &&
        typeof input.gpsLat === "number" &&
        typeof input.gpsLon === "number";

      const [thumbnailExists, fullResExists, geocodedLocation] =
        await Promise.all([
          checkS3KeyExists(input.thumbnailKey),
          checkS3KeyExists(input.fullResKey),
          shouldGeocode &&
          typeof input.gpsLat === "number" &&
          typeof input.gpsLon === "number"
            ? reverseGeocode(input.gpsLat, input.gpsLon)
            : Promise.resolve(null),
        ]);

      if (!thumbnailExists || !fullResExists) {
        throw new Error("One or more keys do not exist in bucket.");
      }

      await db.photo.create({
        data: {
          id: randomUUID(),
          thumbnailKey: input.thumbnailKey,
          fullResKey: input.fullResKey,
          description: input.description,
          location: input.location ?? geocodedLocation ?? undefined,
          gpsLat: input.gpsLat,
          gpsLon: input.gpsLon,
          takenAt: input.takenAt,
          mimeType: input.mimeType,
        },
      });
    }),
});
