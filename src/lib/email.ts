import "server-only";

import { env } from "@/env";
import { getInquiryDetails, inquiryTitles, type Inquiry } from "@/lib/contact";

const bodyFont = "'Nunito Sans',Arial,Helvetica,sans-serif";
const headingFont = "'Space Grotesk',Arial,Helvetica,sans-serif";

type EmailPayload = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
};
type EmailResult = { success: true } | { success: false; error: string };

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (!env.RESEND_API_KEY) {
    return { success: false, error: "Resend sending is not configured." };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: payload.from,
        to: [payload.to],
        reply_to: payload.replyTo,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      return {
        success: false,
        error: `Resend returned HTTP ${response.status}.`,
      };
    }
    const result: unknown = await response.json();
    if (
      !result ||
      typeof result !== "object" ||
      !("id" in result) ||
      typeof result.id !== "string" ||
      !result.id
    ) {
      return { success: false, error: "Resend did not confirm acceptance." };
    }
    return { success: true };
  } catch {
    // Never expose provider responses, credentials, or submitted content.
    return {
      success: false,
      error: controller.signal.aborted
        ? "Resend request timed out."
        : "Resend request failed.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createSubmissionContent(input: Inquiry) {
  const { fields, answers } = getInquiryDetails(input);
  return {
    text: [
      ...fields.map(({ name, value }) => `${name}: ${value}`),
      "",
      answers
        .map(({ name, value }) => (name ? `${name}:\n${value}` : value))
        .join("\n\n"),
    ].join("\n"),
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;font-family:${bodyFont};">
      ${fields
        .map(
          ({ name, value }) => `<tr>
        <td width="104" valign="top" style="padding:4px 12px 4px 0;font-size:14px;line-height:22px;color:#55635d;">${escapeHtml(name)}</td>
        <td valign="top" style="padding:4px 0;font-size:14px;line-height:22px;color:#20312c;word-break:break-word;overflow-wrap:anywhere;">${escapeHtml(value)}</td>
      </tr>`,
        )
        .join("")}
    </table>
    ${answers
      .map(
        ({ name, value }) => `
      <div style="margin-top:20px;">
        ${!name ? "" : `<h2 style="font-family:${headingFont};margin:0 0 8px;font-size:14px;line-height:22px;color:#20312c;">${escapeHtml(name)}</h2>`}
        <div style="font-size:15px;line-height:24px;color:#20312c;word-break:break-word;overflow-wrap:anywhere;">${escapeHtml(value).replace(/\r\n|\r|\n/g, "<br />")}</div>
      </div>
    `,
      )
      .join("")}`,
  };
}

function createEmailContent(input: Inquiry, confirmation: boolean) {
  const heading = confirmation
    ? "We received your inquiry"
    : inquiryTitles[input.inquiryType];
  const introduction = confirmation
    ? "Thank you for contacting 49er Robotics. A copy of your submission is below. Our team will follow up by email."
    : "A new inquiry was submitted through the 49er Robotics website.";
  const replyHint = confirmation
    ? "Reply to this email to add details or contact our team."
    : "Reply to this email to contact the person who submitted this inquiry.";
  const submission = createSubmissionContent(input);
  return {
    text: [
      heading,
      "",
      introduction,
      "",
      submission.text,
      "",
      replyHint,
      "",
      "49er Robotics",
    ].join("\n"),
    // Keep layout and fallback fonts inline for email clients that ignore web fonts.
    html: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${heading}</title>
<!--[if !mso]><!-->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700&amp;family=Space+Grotesk:wght@700&amp;display=swap" />
<!--<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:${bodyFont};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-collapse:collapse;font-family:${bodyFont};">
    <tr><td align="center" style="padding:24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-collapse:collapse;background-color:#ffffff;font-family:${bodyFont};">
        <tr><td style="padding:0 0 16px;border-bottom:2px solid #005035;">
          <p style="font-family:${headingFont};margin:0;font-size:18px;line-height:26px;font-weight:700;color:#005035;">49er Robotics</p>
        </td></tr>
        <tr><td style="padding:20px 0;">
          <h1 style="font-family:${headingFont};margin:0 0 8px;font-size:18px;line-height:26px;color:#20312c;">${heading}</h1>
          <p style="margin:0 0 20px;font-size:14px;line-height:22px;color:#55635d;">${introduction}</p>
          <h2 style="font-family:${headingFont};margin:0 0 8px;font-size:14px;line-height:22px;color:#20312c;">Submission details</h2>
          ${submission.html}
        </td></tr>
        <tr><td style="padding:16px 0 0;border-top:1px solid #dce4df;">
          <p style="margin:0;font-size:13px;line-height:21px;color:#55635d;">${replyHint}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

function getEmailAddresses() {
  const senderEmail = env.CONTACT_EMAIL_FROM;
  const clubEmail = env.CONTACT_EMAIL_TO;
  if (!senderEmail || !clubEmail) {
    throw new Error("Contact email sender or recipient is not configured.");
  }
  return { senderEmail, clubEmail };
}

export function createInquiryEmail(input: Inquiry): EmailPayload {
  const { senderEmail, clubEmail } = getEmailAddresses();
  return {
    from: `49er Robotics <${senderEmail}>`,
    to: clubEmail,
    replyTo: input.email,
    subject: `49er Robotics: ${inquiryTitles[input.inquiryType]}`,
    ...createEmailContent(input, false),
  };
}

export function createConfirmationEmail(input: Inquiry): EmailPayload {
  const { senderEmail, clubEmail } = getEmailAddresses();
  const topic =
    input.inquiryType === "contact"
      ? "message"
      : input.inquiryType === "sponsor"
        ? "sponsorship inquiry"
        : "donation inquiry";
  return {
    from: `49er Robotics <${senderEmail}>`,
    to: input.email,
    replyTo: clubEmail,
    subject: `49er Robotics: We received your ${topic}`,
    ...createEmailContent(input, true),
  };
}
