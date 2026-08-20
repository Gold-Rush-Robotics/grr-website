import { normalizeSocialRedirectUri } from "@/lib/social-redirect";
import { db } from "@/server/db";
import { notFound, redirect } from "next/navigation";

type SocialRedirectRouteProps = {
  params: Promise<{ uri: string[] }>;
};

export async function GET(
  _request: Request,
  { params }: SocialRedirectRouteProps,
) {
  const { uri } = await params;
  const path = normalizeSocialRedirectUri(uri.join("/"));

  const socialRedirect = await db.socialRedirect.findUnique({
    where: { uri: path },
    select: { redirectUri: true },
  });

  if (!socialRedirect) {
    notFound();
  }

  redirect(socialRedirect.redirectUri);
}
