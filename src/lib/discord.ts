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
): Promise<DiscordWebhookResult> {
  if (!env.DISCORD_WEBHOOK_URL) {
    return { success: false, error: "Webhook is not configured." };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
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

export function createContactFormMessages(
  title: string,
  fields: Array<{ name: string; value: string }>,
  answers: Array<{ name: string; value: string }>,
): DiscordWebhookPayload[] {
  const header: TextDisplay[] = [
    { type: 10, content: `## ${title}` },
    ...fields.map(
      ({ name, value }): TextDisplay => ({
        type: 10,
        content: `**${escapeMarkdown(name)}:** ${escapeMarkdown(value)}`,
      }),
    ),
  ];
  const answerBlocks = answers.map(({ name, value }) =>
    name
      ? `**${escapeMarkdown(name)}**\n${escapeMarkdown(value)}`
      : escapeMarkdown(value),
  );
  const combined = answerBlocks.join("\n\n");
  const headerLength = header.reduce(
    (length, item) => length + item.content.length,
    0,
  );
  // Escaping long answers can exceed Discord's text limit. Keep all answers by
  // sending separate copies with the same identifying fields when necessary.
  const bodies =
    headerLength + combined.length <= 4000 ? [combined] : answerBlocks;
  return bodies.map((content) => ({
    components: [
      {
        type: 17,
        components: [
          ...header,
          { type: 14, divider: true, spacing: 2 },
          { type: 10, content },
        ],
      },
    ],
  }));
}
