import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";

import { z } from "@/lib/zod";
import { db } from "@/server/db";
import {
  checkS3KeyExists,
  getS3Bucket,
  getS3Client,
  getS3ObjectUrl,
} from "@/server/s3";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const officerFields = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(100),
  role: z.string().trim().min(1, "Enter a role.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  photoKey: z.string().trim().nullable(),
});

/**
 * Confirms the key exists under `officers/`. Missing photos are allowed.
 */
async function verifyPhotoKey(photoKey: string | null) {
  if (!photoKey) return;
  if (
    !photoKey.startsWith("officers/") ||
    !(await checkS3KeyExists(photoKey))
  ) {
    throw new Error("The officer photo could not be found in the bucket.");
  }
}

/**
 * Best-effort delete of an officer photo. Keys outside `officers/` are ignored.
 * S3 failures are logged so they do not fail the officer mutation.
 */
async function deletePhoto(photoKey: string | null) {
  if (!photoKey?.startsWith("officers/")) return;
  try {
    await getS3Client().send(
      new DeleteObjectCommand({ Bucket: getS3Bucket(), Key: photoKey }),
    );
  } catch (error) {
    console.error(`Unable to delete officer photo ${photoKey}.`, error);
  }
}

export const officersRouter = createTRPCRouter({
  /**
   * Officers for the Contact page and admin list, in display order.
   * @returns Officers with a resolved `photoUrl`. Null means the default image.
   */
  getAll: publicProcedure.query(async () => {
    const officers = await db.contactOfficer.findMany({
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        photoKey: true,
        position: true,
      },
    });
    return officers.map((officer) => ({
      ...officer,
      photoUrl: officer.photoKey ? getS3ObjectUrl(officer.photoKey) : null,
    }));
  }),

  /**
   * Creates an officer at the end of the Contact page order.
   * @param input.photoKey - Optional object under `officers/` already in the bucket.
   */
  create: protectedProcedure
    .input(officerFields)
    .mutation(async ({ input }) => {
      await verifyPhotoKey(input.photoKey);
      const lastOfficer = await db.contactOfficer.findFirst({
        orderBy: { position: "desc" },
        select: { position: true },
      });
      return db.contactOfficer.create({
        data: { ...input, position: (lastOfficer?.position ?? -1) + 1 },
      });
    }),

  /**
   * Updates an officer. Deletes the previous photo object when the key changes.
   */
  update: protectedProcedure
    .input(officerFields.extend({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await verifyPhotoKey(input.photoKey);
      const previous = await db.contactOfficer.findUniqueOrThrow({
        where: { id: input.id },
      });
      const updated = await db.contactOfficer.update({
        where: { id: input.id },
        data: {
          name: input.name,
          role: input.role,
          email: input.email,
          photoKey: input.photoKey,
        },
      });
      if (previous.photoKey && previous.photoKey !== input.photoKey) {
        await deletePhoto(previous.photoKey);
      }
      return updated;
    }),

  /**
   * Deletes an officer and its photo object, if any.
   */
  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const removed = await db.contactOfficer.delete({ where: { id: input.id } });
      await deletePhoto(removed.photoKey);
      return removed;
    }),

  /**
   * Sets Contact page order from a complete list of officer ids.
   * @param input.ids - Every current officer id, in the new order.
   * @throws CONFLICT if the id set does not match the database.
   */
  reorder: protectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .mutation(async ({ input }) => {
      const currentIds = await db.contactOfficer.findMany({
        select: { id: true },
      });
      if (
        input.ids.length !== currentIds.length ||
        new Set(input.ids).size !== input.ids.length ||
        currentIds.some(({ id }) => !input.ids.includes(id))
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "The officer list changed. Refresh and try again.",
        });
      }
      await db.$transaction(
        input.ids.map((id, position) =>
          db.contactOfficer.update({ where: { id }, data: { position } }),
        ),
      );
    }),
});
