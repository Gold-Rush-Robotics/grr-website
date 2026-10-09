import { z } from "zod";

export const contactSchema = z.object({
  inquiryType: z.enum(["contact", "sponsor", "donate"]).default("contact"),
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  organization: z.string().trim().max(100).default(""),
  message: z.string().trim().min(1, "Enter a message.").max(1000),
});

export type InquiryType = z.infer<typeof contactSchema>["inquiryType"];

export const inquiryTitles: Record<InquiryType, string> = {
  contact: "New contact form submission",
  sponsor: "New sponsorship inquiry",
  donate: "New donation inquiry",
};
