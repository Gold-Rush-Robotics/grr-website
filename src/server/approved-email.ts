import "server-only";

import { db } from "@/server/db";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function isApprovedEmail(email: string) {
  return Boolean(
    await db.approvedEmail.findUnique({
      where: { email: normalizeEmail(email) },
      select: { id: true },
    }),
  );
}
