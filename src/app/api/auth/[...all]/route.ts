import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

const INVALID_CREDENTIALS_CODE = "INVALID_EMAIL_OR_PASSWORD";
const INVALID_CREDENTIALS_MESSAGE = "Invalid username or password";

const authHandler = toNextJsHandler(auth);

export const runtime = "nodejs";

function isCredentialSignInRequest(request: Request) {
  const pathname = new URL(request.url).pathname;
  return pathname.endsWith("/sign-in/email");
}

async function normalizeInvalidCredentialsError(
  request: Request,
  response: Response,
) {
  if (!isCredentialSignInRequest(request)) {
    return response;
  }

  if (!response.headers.get("content-type")?.includes("application/json")) {
    return response;
  }

  let body: unknown;

  try {
    body = await response.clone().json();
  } catch {
    return response;
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("code" in body) ||
    body.code !== INVALID_CREDENTIALS_CODE
  ) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("content-type", "application/json");
  headers.delete("content-length");

  return new Response(
    JSON.stringify({
      ...body,
      message: INVALID_CREDENTIALS_MESSAGE,
    }),
    {
      status: response.status,
      statusText: response.statusText,
      headers,
    },
  );
}

export const GET = authHandler.GET;

export async function POST(request: Request) {
  const response = await authHandler.POST(request);
  return normalizeInvalidCredentialsError(request, response);
}
