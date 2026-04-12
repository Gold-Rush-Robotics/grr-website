import { createContactFormMessage, sendDiscordWebhook } from "@/lib/discord";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import z from "zod";

export const contactRouter = createTRPCRouter({
  contactGeneric: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, email, message } = input;

      const webhookPayload = createContactFormMessage(
        "New Contact Form Submission",
        [
          { name: "Name", value: name },
          { name: "Email", value: email },
        ],
        message,
      );

      const webhookResult = await sendDiscordWebhook(webhookPayload);

      if (!webhookResult.success) {
        console.error("Discord webhook failed:", webhookResult.error);
        return { success: false, error: webhookResult.error };
      }

      return { success: true, error: null };
    }),
});
