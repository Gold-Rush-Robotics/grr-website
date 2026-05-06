import "server-only";

import { randomUUID, timingSafeEqual } from "node:crypto";

import { type BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { z } from "zod";

import { env } from "@/env";
import { db } from "@/server/db";

const BOOTSTRAP_ADMIN_USERNAME = "admin";
const BOOTSTRAP_ADMIN_EMAIL = "admin";

export function isBootstrapAdminIdentifier(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  return normalized === BOOTSTRAP_ADMIN_USERNAME;
}

function passwordsMatch(input: string, expected: string) {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export const bootstrapAdminPlugin = () =>
  ({
    id: "bootstrap-admin",
    endpoints: {
      bootstrapAdminSignIn: createAuthEndpoint(
        "/bootstrap-admin/sign-in",
        {
          method: "POST",
          body: z.object({
            identifier: z.string().trim().min(1),
            password: z.string().min(1),
          }),
        },
        async (ctx) => {
          if (!isBootstrapAdminIdentifier(ctx.body.identifier)) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid username or password.",
            });
          }

          if (!env.ADMIN_PASSWORD) {
            throw new APIError("BAD_REQUEST", {
              message: "Admin account is not enabled.",
            });
          }

          if (!passwordsMatch(ctx.body.password, env.ADMIN_PASSWORD ?? "")) {
            throw new APIError("UNAUTHORIZED", {
              message: "Invalid username or password.",
            });
          }

          let user = await db.user.findUnique({
            where: { email: BOOTSTRAP_ADMIN_EMAIL },
          });

          if (!user) {
            user = await db.user.create({
              data: {
                id: randomUUID(),
                name: "Admin",
                email: BOOTSTRAP_ADMIN_EMAIL,
                emailVerified: true,
              },
            });
          }

          const session = await ctx.context.internalAdapter.createSession(
            user.id,
            false,
          );

          await setSessionCookie(ctx, {
            session,
            user,
          });

          return ctx.json({
            success: true,
          });
        },
      ),
    },
  }) satisfies BetterAuthPlugin;
