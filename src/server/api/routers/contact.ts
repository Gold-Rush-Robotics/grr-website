import { TRPCError } from "@trpc/server";

import { env } from "@/env";
import { contactSchema, getInquiryDetails, inquiryTitles } from "@/lib/contact";
import { createContactFormMessages, sendDiscordWebhook } from "@/lib/discord";
import {
  createInquiryEmail,
  createConfirmationEmail,
  sendEmail,
} from "@/lib/email";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const contactRouter = createTRPCRouter({
  contactGeneric: publicProcedure
    .input(contactSchema)
    .mutation(async ({ input }) => {
      const result = await sendEmail(createInquiryEmail(input));
      if (!result.success) {
        console.error("Contact email failed:", result.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Your message could not be sent. Please try again or email goldrushrobotics@charlotte.edu.",
        });
      }
      const confirmation = await sendEmail(createConfirmationEmail(input));
      if (!confirmation.success) {
        // The club email was accepted. A retry would duplicate the inquiry.
        console.error("Contact confirmation email failed:", confirmation.error);
      }
      if (env.DISCORD_WEBHOOK_URL) {
        const { fields, answers } = getInquiryDetails(input);
        for (const message of createContactFormMessages(
          inquiryTitles[input.inquiryType],
          fields,
          answers,
        )) {
          const discord = await sendDiscordWebhook(message);
          if (!discord.success) {
            console.error(
              "Contact Discord notification failed:",
              discord.error,
            );
            break;
          }
        }
      }
      return { success: true };
    }),
});
