import { z } from "zod";

const commonFields = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  organization: z.string().trim().max(100),
});
const message = z.string().trim().min(1, "Enter a message.").max(1000);

export const contactFormSchemas = {
  contact: commonFields.extend({ message }),
  donate: commonFields.extend({
    donationAmount: z
      .string()
      .trim()
      .max(15)
      .regex(
        /^(?:\d+|\d*\.\d{1,2})$/,
        "Enter a USD amount, for example 100.00.",
      )
      .refine((value) => Number(value) > 0, "Enter an amount greater than $0."),
    message,
  }),
  sponsor: commonFields.extend({
    sponsorshipOffer: z
      .string()
      .trim()
      .min(1, "Describe what you would like to provide.")
      .max(1000),
    sponsorshipGoals: z
      .string()
      .trim()
      .min(1, "Describe what you are looking to get out of the sponsorship.")
      .max(1000),
  }),
};

export const contactSchema = z.discriminatedUnion("inquiryType", [
  contactFormSchemas.contact.extend({ inquiryType: z.literal("contact") }),
  contactFormSchemas.donate.extend({ inquiryType: z.literal("donate") }),
  contactFormSchemas.sponsor.extend({ inquiryType: z.literal("sponsor") }),
]);
export type Inquiry = z.infer<typeof contactSchema>;
export type InquiryType = Inquiry["inquiryType"];

export const sponsorshipQuestions = {
  offer: "What would you like to provide as part of your sponsorship?",
  goals: "What are you looking to get out of this sponsorship?",
};

export const inquiryTitles: Record<InquiryType, string> = {
  contact: "New contact form submission",
  sponsor: "New sponsorship inquiry",
  donate: "New donation inquiry",
};

export function getInquiryDetails(input: Inquiry) {
  const fields = [
    { name: "Name", value: input.name },
    { name: "Email", value: input.email },
  ];
  if (input.organization)
    fields.push({ name: "Organization", value: input.organization });
  if (input.inquiryType === "donate") {
    fields.push({
      name: "Donation Amount",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(input.donationAmount)),
    });
  }
  const answers =
    input.inquiryType === "sponsor"
      ? [
          { name: sponsorshipQuestions.offer, value: input.sponsorshipOffer },
          { name: sponsorshipQuestions.goals, value: input.sponsorshipGoals },
        ]
      : [
          {
            name: "",
            value: input.message,
          },
        ];
  return { fields, answers };
}
