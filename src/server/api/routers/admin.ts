import { randomBytes } from "node:crypto";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

function generateTemporaryPassword() {
  return `GRR-${randomBytes(9).toString("base64url")}`;
}

export const adminRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        passwordNeedsReset: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The signed-in user no longer exists.",
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordNeedsReset: user.passwordNeedsReset,
      },
      session: {
        id: ctx.session.session.id,
        expiresAt: ctx.session.session.expiresAt,
      },
    };
  }),

  createUser: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1, "Name is required."),
        email: z.string().trim().email("Enter a valid email address."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { passwordNeedsReset: true },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The signed-in user no longer exists.",
        });
      }

      if (currentUser.passwordNeedsReset) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Change your password before creating other users.",
        });
      }

      const temporaryPassword = generateTemporaryPassword();

      try {
        const createdUser = await auth.api.signUpEmail({
          body: {
            email: input.email,
            name: input.name,
            password: temporaryPassword,
          },
        });

        await db.user.update({
          where: { id: createdUser.user.id },
          data: { passwordNeedsReset: true },
        });

        return {
          user: {
            id: createdUser.user.id,
            email: createdUser.user.email,
            name: createdUser.user.name,
          },
          temporaryPassword,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to create the user.",
        });
      }
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required."),
        newPassword: z
          .string()
          .min(8, "New password must be at least 8 characters long."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await auth.api.changePassword({
          body: {
            currentPassword: input.currentPassword,
            newPassword: input.newPassword,
            revokeOtherSessions: true,
          },
          headers: ctx.headers,
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to update the password.",
        });
      }

      await db.user.update({
        where: { id: ctx.session.user.id },
        data: { passwordNeedsReset: false },
      });

      return { success: true };
    }),
});
