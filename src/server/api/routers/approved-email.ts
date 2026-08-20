import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { normalizeEmail } from "@/server/approved-email";
import { db } from "@/server/db";

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .transform(normalizeEmail);

export const approvedEmailRouter = createTRPCRouter({
  approvedEmails: protectedProcedure.query(async () => {
    const approvedEmails = await db.approvedEmail.findMany({
      orderBy: { email: "asc" },
      select: { id: true, email: true, createdAt: true },
    });

    const users = await db.user.findMany({
      where: {
        OR: approvedEmails.map(({ email }) => ({
          email: { equals: email, mode: "insensitive" },
        })),
      },
      select: { email: true, name: true, image: true },
    });
    const usersByEmail = new Map(
      users.map((user) => [normalizeEmail(user.email), user]),
    );

    return approvedEmails.map((approvedEmail) => ({
      ...approvedEmail,
      user: usersByEmail.get(approvedEmail.email) ?? null,
    }));
  }),

  approveEmail: protectedProcedure
    .input(z.object({ email: emailSchema }))
    .mutation(({ input }) =>
      db.approvedEmail.upsert({
        where: { email: input.email },
        update: {},
        create: { email: input.email },
        select: { id: true, email: true, createdAt: true },
      }),
    ),

  removeApprovedEmail: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const approvedEmail = await db.approvedEmail.findUnique({
        where: { id: input.id },
        select: { email: true },
      });

      if (!approvedEmail) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "That approved email no longer exists.",
        });
      }

      if (approvedEmail.email === normalizeEmail(ctx.session.user.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot remove your own email.",
        });
      }

      return db.approvedEmail.delete({
        where: { id: input.id },
        select: { id: true },
      });
    }),
});
