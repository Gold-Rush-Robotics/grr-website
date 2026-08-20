import { z } from "zod";

export function normalizeSocialRedirectUri(uri: string): string {
  const path = uri.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  return path ? `/${path}` : "";
}

export const socialRedirectUriSchema = z
  .string()
  .trim()
  .min(2, "Enter a path.")
  .startsWith("/", "Path must start with a slash.")
  .transform(normalizeSocialRedirectUri)
  .pipe(z.string().min(2, "Enter a path."));
