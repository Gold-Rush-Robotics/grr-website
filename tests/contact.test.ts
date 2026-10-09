import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import { contactSchema } from "../src/lib/contact";

process.env.SKIP_ENV_VALIDATION = "1";
Object.assign(process.env, { NODE_ENV: "production" });
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.BETTER_AUTH_SECRET = "test-only-secret-with-at-least-32-characters";
process.env.GOOGLE_CLIENT_ID = "test";
process.env.GOOGLE_CLIENT_SECRET = "test";
process.env.DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/123/test-token";

const { createContactFormMessage, sendDiscordWebhook } =
  await import("../src/lib/discord");
const { contactRouter } = await import("../src/server/api/routers/contact");
const caller = contactRouter.createCaller({
  headers: new Headers(),
  session: null,
});

const submission = {
  name: "Test Visitor",
  email: "visitor@example.com",
  message: "Hello",
};

afterEach(() => mock.restoreAll());

void test("validates and trims contact, sponsorship, and donation inquiries", () => {
  for (const inquiryType of ["contact", "sponsor", "donate"] as const) {
    const result = contactSchema.parse({
      ...submission,
      inquiryType,
      name: "  Visitor  ",
      organization: " Club ",
    });
    assert.equal(result.name, "Visitor");
    assert.equal(result.organization, "Club");
    assert.equal(result.inquiryType, inquiryType);
  }
  assert.equal(contactSchema.parse(submission).inquiryType, "contact");
});

void test("rejects empty, invalid, and oversized input on the server", async () => {
  const fetchMock = mock.method(
    globalThis,
    "fetch",
    async () => new Response("{}"),
  );
  for (const input of [
    { ...submission, name: " " },
    { ...submission, email: "invalid" },
    { ...submission, message: " " },
    { ...submission, message: "x".repeat(1001) },
    { ...submission, organization: "x".repeat(101) },
    { ...submission, inquiryType: "payment" },
  ]) {
    await assert.rejects(caller.contactGeneric(input as typeof submission), {
      code: "BAD_REQUEST",
    });
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

void test("delivers each inquiry type with a distinct title and reply address", async () => {
  const payloads: string[] = [];
  mock.method(
    globalThis,
    "fetch",
    async (_url: unknown, options?: RequestInit) => {
      assert.ok(typeof options?.body === "string");
      payloads.push(options.body);
      return new Response("{}", { status: 200 });
    },
  );
  for (const inquiryType of ["contact", "sponsor", "donate"] as const) {
    assert.deepEqual(
      await caller.contactGeneric({
        ...submission,
        inquiryType,
        organization: "Example club",
      }),
      { success: true },
    );
  }
  for (const [index, title] of [
    "New contact form submission",
    "New sponsorship inquiry",
    "New donation inquiry",
  ].entries()) {
    assert.ok(payloads[index]?.includes(title));
    assert.ok(payloads[index]?.includes(submission.email));
    assert.ok(payloads[index]?.includes("Example club"));
  }
});

void test("uses Components v2, disables mentions, and waits for delivery confirmation", async () => {
  mock.method(
    globalThis,
    "fetch",
    async (target: URL, options?: RequestInit) => {
      assert.equal(target.searchParams.get("with_components"), "true");
      assert.equal(target.searchParams.get("wait"), "true");
      assert.ok(typeof options?.body === "string");
      const body = JSON.parse(options.body) as {
        flags: number;
        allowed_mentions: { parse: string[] };
        components: unknown[];
      };
      assert.equal(body.flags, 32768);
      assert.deepEqual(body.allowed_mentions, { parse: [] });
      assert.equal(body.components.length, 1);
      return new Response("{}", { status: 200 });
    },
  );
  assert.deepEqual(
    await sendDiscordWebhook(
      createContactFormMessage("Contact", [], "@everyone **hello**"),
    ),
    { success: true },
  );
});

void test("escapes submitted Markdown in messages and fields", () => {
  const message = createContactFormMessage(
    "Contact",
    [{ name: "Name", value: "[fake](https://example.com)" }],
    "**message**",
  );
  const serialized = JSON.stringify(message);
  assert.ok(!serialized.includes("[fake](https://example.com)"));
  assert.ok(!serialized.includes("**message**"));
});

void test("reports delivery failure without returning Discord secrets or response bodies", async () => {
  mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response("secret-token-and-internal-details", { status: 429 }),
  );
  const result = await sendDiscordWebhook(
    createContactFormMessage("Contact", [], "Hello"),
  );
  assert.deepEqual(result, {
    success: false,
    error: "Webhook returned HTTP 429.",
  });
  await assert.rejects(caller.contactGeneric(submission), (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.ok(error.message.includes("could not be sent"));
    assert.ok(!error.message.includes("secret-token"));
    return true;
  });
});

void test("handles a network failure without exposing the webhook token", async () => {
  mock.method(globalThis, "fetch", async () => {
    throw new Error("test-token");
  });
  assert.deepEqual(
    await sendDiscordWebhook(createContactFormMessage("Contact", [], "Hello")),
    { success: false, error: "Webhook request failed." },
  );
});

void test("aborts a stalled delivery", async () => {
  mock.method(
    globalThis,
    "fetch",
    (_url: unknown, options?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        options?.signal?.addEventListener(
          "abort",
          () => reject(new Error("Aborted")),
          { once: true },
        );
      }),
  );
  assert.deepEqual(
    await sendDiscordWebhook(
      createContactFormMessage("Contact", [], "Hello"),
      5,
    ),
    { success: false, error: "Webhook request timed out." },
  );
});
