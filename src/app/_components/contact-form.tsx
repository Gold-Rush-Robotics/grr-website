"use client";

import { revalidateLogic } from "@tanstack/react-form";
import { Send } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type InquiryType } from "@/lib/contact";
import { api } from "@/trpc/react";
import { FormFieldErrors } from "./form/field-errors";
import { useAppForm } from "./form/form";

const formSchema = contactSchema.omit({ inquiryType: true }).extend({
  organization: contactSchema.shape.organization.removeDefault(),
});

export function ContactForm({
  inquiryType = "contact",
  embedded = false,
  onSent,
}: {
  inquiryType?: InquiryType;
  embedded?: boolean;
  onSent?: () => void;
}) {
  const messageId = useId();
  const [submissionError, setSubmissionError] = useState<string>();
  const contactMutation = api.contact.contactGeneric.useMutation();
  const form = useAppForm({
    defaultValues: { name: "", email: "", organization: "", message: "" },
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "blur",
    }),
    validators: { onDynamic: formSchema },
    onSubmit: async ({ value }) => {
      setSubmissionError(undefined);
      try {
        await contactMutation.mutateAsync({ ...value, inquiryType });
        form.reset();
        toast.success(
          inquiryType === "contact"
            ? "Message sent successfully."
            : "Inquiry sent. We will contact you by email.",
        );
        onSent?.();
      } catch {
        setSubmissionError(
          "Your message could not be sent. Please try again or email goldrushrobotics@charlotte.edu.",
        );
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
          <form.Field name="message">
            {(field) => {
              const isInvalid =
                field.state.meta.isBlurred && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={messageId}>Message</FieldLabel>
                  <Textarea
                    id={messageId}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                      if (field.state.meta.isBlurred) {
                        queueMicrotask(() => void field.validate("blur"));
                      }
                    }}
                    placeholder={
                      inquiryType === "contact"
                        ? "How can we help?"
                        : "Tell us how you would like to support the club."
                    }
                    required
                    maxLength={1000}
                    rows={embedded ? 5 : 8}
                    aria-invalid={isInvalid || undefined}
                    aria-describedby={
                      isInvalid ? `${messageId}-error` : undefined
                    }
                  />
                  {isInvalid && (
                    <FormFieldErrors
                      id={`${messageId}-error`}
                      errors={field.state.meta.errors}
                    />
                  )}
                </Field>
              );
            }}
          </form.Field>
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
