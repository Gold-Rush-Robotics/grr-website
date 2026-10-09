import "server-only";

import { env } from "@/env";

// Keep the Components v2 format used by the original contact-form prototype.
type TextDisplay = { type: 10; content: string };
type DiscordWebhookPayload = {
  components: Array<{
    type: 17;
    components: Array<TextDisplay | { type: 14; divider: true; spacing: 2 }>;
  }>;
};

type DiscordWebhookResult =
  | { success: true }
  | { success: false; error: string };

export async function sendDiscordWebhook(
  payload: DiscordWebhookPayload,
  timeout = 5000,
): Promise<DiscordWebhookResult> {
  if (!env.DISCORD_WEBHOOK_URL) {
    return { success: false, error: "Webhook is not configured." };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const url = new URL(env.DISCORD_WEBHOOK_URL);
    url.searchParams.set("with_components", "true");
    // Wait for confirmation rather than accepting a potentially unsaved message.
    url.searchParams.set("wait", "true");
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        flags: 1 << 15,
        allowed_mentions: { parse: [] },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Do not expose Discord response bodies or the secret webhook URL.
      return {
        success: false,
        error: `Webhook returned HTTP ${response.status}.`,
      };
    }
    return { success: true };
  } catch {
    return {
      success: false,
      error: controller.signal.aborted
        ? "Webhook request timed out."
        : "Webhook request failed.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function escapeMarkdown(value: string) {
  return value.replace(/[\\`*_{}\[\]()<>#|~]/g, "\\$&");
}

export function createContactFormMessage(
  title: string,
  fields: Array<{ name: string; value: string }>,
  message: string,
): DiscordWebhookPayload {
  return {
    components: [
      {
        type: 17,
        components: [
          { type: 10, content: `## ${title}` },
          ...fields.map(
            ({ name, value }): TextDisplay => ({
              type: 10,
              content: `**${name}:** ${escapeMarkdown(value)}`,
            }),
          ),
          { type: 14, divider: true, spacing: 2 },
          { type: 10, content: escapeMarkdown(message) },
        ],
      },
    ],
  };
}
