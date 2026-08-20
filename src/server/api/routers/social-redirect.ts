import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { socialRedirectUriSchema } from "@/lib/social-redirect";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const socialRedirectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        uri: socialRedirectUriSchema,
        redirectUri: z.string().trim().url("Enter a valid URL."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await db.socialRedirect.create({
          data: {
            uri: input.uri,
            redirectUri: input.redirectUri,
            createdBy: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A redirect for that path already exists.",
          });
        }

        throw error;
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        originalUri: socialRedirectUriSchema,
        uri: socialRedirectUriSchema,
        redirectUri: z.string().trim().url("Enter a valid URL."),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await db.socialRedirect.update({
          where: { uri: input.originalUri },
          data: {
            uri: input.uri,
            redirectUri: input.redirectUri,
          },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A redirect for that path already exists.",
            });
          }

          if (error.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "That social redirect no longer exists.",
            });
          }
        }

        throw error;
      }
    }),

  /**
   * All social redirects for the admin portal, ordered by path.
   */
  getAll: protectedProcedure.query(async () => {
    return db.socialRedirect.findMany({
      orderBy: { uri: "asc" },
    });
  }),

  remove: protectedProcedure
    .input(z.object({ uri: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const socialRedirect = await db.socialRedirect.findUnique({
        where: { uri: input.uri },
        select: { uri: true },
      });

      if (!socialRedirect) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "That social redirect no longer exists.",
        });
      }

      return db.socialRedirect.delete({
        where: { uri: input.uri },
        select: { uri: true },
      });
    }),
});
