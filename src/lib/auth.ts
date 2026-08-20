import "server-only";

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/env";
import { isApprovedEmail } from "@/server/approved-email";
import { db } from "@/server/db";

export const auth = betterAuth({
  appName: "49er Robotics Admin",
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  account: {
    storeStateStrategy: "cookie",
    accountLinking: {
      // Google verifies the matching email as part of OAuth.
      requireLocalEmailVerified: false,
      updateUserInfoOnLink: true,
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      overrideUserInfoOnSignIn: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.emailVerified || !(await isApprovedEmail(user.email))) {
            return false;
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { email: true, emailVerified: true },
          });

          if (!user?.emailVerified || !(await isApprovedEmail(user.email))) {
            return false;
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});
