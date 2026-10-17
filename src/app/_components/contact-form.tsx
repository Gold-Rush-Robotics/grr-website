"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { FieldError, FieldGroup, FieldSet } from "@/components/ui/field";
import {
  contactSchema,
  contactFormSchemas,
  sponsorshipQuestions,
  type InquiryType,
} from "@/lib/contact";
import { api } from "@/trpc/react";
import { useAppForm } from "./form/form";

export function ContactForm({
  inquiryType = "contact",
  embedded = false,
  onSent,
  onPendingChange,
}: {
  inquiryType?: InquiryType;
  embedded?: boolean;
  onSent?: () => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const formSchema = z.object({
    message: z.string(),
    donationAmount: z.string(),
    sponsorshipOffer: z.string(),
    sponsorshipGoals: z.string(),
    ...contactFormSchemas[inquiryType].shape,
  });
  const [submissionError, setSubmissionError] = useState<string>();
  const contactMutation = api.contact.contactGeneric.useMutation();
  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      organization: "",
      message: "",
      donationAmount: "",
      sponsorshipOffer: "",
      sponsorshipGoals: "",
    },
    validators: { onDynamic: formSchema },
    onSubmit: async ({ value }) => {
      setSubmissionError(undefined);
      try {
        onPendingChange?.(true);
        await contactMutation.mutateAsync(
          contactSchema.parse({ ...value, inquiryType }),
        );
        form.reset();
        toast.success(
          "Message sent successfully. You should receive a confirmation via email shortly.",
        );
        onSent?.();
      } catch {
        setSubmissionError(
          "Your message could not be sent. Please try again or email goldrushrobotics@charlotte.edu.",
        );
      } finally {
        onPendingChange?.(false);
      }
    },
  });

  const content = (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldSet disabled={contactMutation.isPending}>
        <FieldGroup>
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Your Name"
                autoComplete="name"
                required
                maxLength={100}
              />
            )}
          </form.AppField>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Your Email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            )}
          </form.AppField>
          {inquiryType !== "contact" && (
            <form.AppField name="organization">
              {(field) => (
                <field.TextField
                  label="Organization (optional)"
                  autoComplete="organization"
                  maxLength={100}
                />
              )}
            </form.AppField>
          )}
          {inquiryType === "donate" && (
            <form.AppField name="donationAmount">
              {(field) => (
                <field.TextField
                  label="Donation Amount (USD)"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  placeholder="100.00"
                  required
                />
              )}
            </form.AppField>
          )}
          {inquiryType === "sponsor" ? (
            <>
              <form.AppField name="sponsorshipOffer">
                {(field) => (
                  <field.TextareaField
                    label={sponsorshipQuestions.offer}
                    placeholder="Financial support, products, services, equipment, mentorship, or other support. Please include details."
                    required
                    maxLength={1000}
                    rows={5}
                  />
                )}
              </form.AppField>
              <form.AppField name="sponsorshipGoals">
                {(field) => (
                  <field.TextareaField
                    label={sponsorshipQuestions.goals}
                    placeholder="Tell us about your goals and what you would like from the partnership."
                    required
                    maxLength={1000}
                    rows={5}
                  />
                )}
              </form.AppField>
            </>
          ) : (
            <form.AppField name="message">
              {(field) => (
                <field.TextareaField
                  label="Message"
                  placeholder={
                    inquiryType === "contact"
                      ? "How can we help?"
                      : "Tell us about your donation."
                  }
                  required
                  maxLength={1000}
                  rows={embedded ? 5 : 8}
                />
              )}
            </form.AppField>
          )}
          {submissionError && (
            <FieldError role="alert">{submissionError}</FieldError>
          )}
          <form.AppForm>
            <form.SubmitButton disabled={contactMutation.isPending}>
              {contactMutation.isPending
                ? "Sending..."
                : inquiryType === "contact"
                  ? "Send"
                  : "Send inquiry"}
              <Send />
            </form.SubmitButton>
          </form.AppForm>
        </FieldGroup>
      </FieldSet>
    </form>
  );

  return embedded ? (
    content
  ) : (
    <Card className="bg-card/50 h-full">
      <CardContent>{content}</CardContent>
    </Card>
  );
}
