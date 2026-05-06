import "server-only";

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/env";
import { bootstrapAdminPlugin } from "@/server/bootstrap-admin";
import { db } from "@/server/db";

export const auth = betterAuth({
  appName: "49er Robotics Admin",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  plugins: [bootstrapAdminPlugin(), nextCookies()],
});
