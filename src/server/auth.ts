import "server-only";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { isApprovedEmail } from "@/server/approved-email";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !(await isApprovedEmail(session.user.email))) {
    return null;
  }

  return session;
}
