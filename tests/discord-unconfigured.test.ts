import assert from "node:assert/strict";
import { mock, test } from "node:test";

process.env.SKIP_ENV_VALIDATION = "1";
delete process.env.DISCORD_WEBHOOK_URL;
const { createContactFormMessage, sendDiscordWebhook } =
  await import("../src/lib/discord");

void test("missing webhook configuration fails without making a request", async () => {
  const fetchMock = mock.method(
    globalThis,
    "fetch",
    async () => new Response("{}"),
  );
  assert.deepEqual(
    await sendDiscordWebhook(createContactFormMessage("Contact", [], "Hello")),
    { success: false, error: "Webhook is not configured." },
  );
  assert.equal(fetchMock.mock.callCount(), 0);
  mock.restoreAll();
});
