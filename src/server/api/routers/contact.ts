import { TRPCError } from "@trpc/server";

import { contactSchema, inquiryTitles } from "@/lib/contact";
import { createContactFormMessage, sendDiscordWebhook } from "@/lib/discord";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const contactRouter = createTRPCRouter({
  contactGeneric: publicProcedure
    .input(contactSchema)
    .mutation(async ({ input }) => {
      const fields = [
        { name: "Name", value: input.name },
        { name: "Email", value: input.email },
      ];
      if (input.organization) {
        fields.push({ name: "Organization", value: input.organization });
      }
      const result = await sendDiscordWebhook(
        createContactFormMessage(
          inquiryTitles[input.inquiryType],
          fields,
          input.message,
        ),
      );
      if (!result.success) {
        console.error("Contact submission failed:", result.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Your message could not be sent. Please try again or email goldrushrobotics@charlotte.edu.",
        });
      }
      return { success: true };
    }),
});
