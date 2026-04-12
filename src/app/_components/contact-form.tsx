"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useForm } from "@tanstack/react-form";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name required")
    .max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  message: z
    .string()
    .min(1, "Message required")
    .max(1000, "Message cannot exceed 1000 characters"),
});

export function ContactForm() {
  const contactMutation = api.contact.contactGeneric.useMutation({
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Message sent successfully!");
      } else {
        toast.error("Failed to send message");
      }
    },
    onError: (error) => {
      console.error("Form submission error:", error);
      toast.error("Failed to send message");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      contactMutation.mutate({
        name: value.name,
        email: value.email,
        message: value.message,
      });
      form.reset();
    },
  });

  return (
    <Card className="bg-card/50 h-full">
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldSet>
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Your Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="text"
                        placeholder="John Doe"
                        aria-invalid={isInvalid}
                      />
                      <FieldDescription>
                        Enter your name so we can address you properly.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Your Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="email"
                        placeholder="john.doe@example.com"
                        aria-invalid={isInvalid}
                      />
                      <FieldDescription>
                        Enter an email address that we can contact you back at.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="message"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Message</FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter your message here."
                        rows={8}
                        aria-invalid={isInvalid}
                      />
                      <FieldDescription>
                        Enter your message here.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <Button
                type="submit"
                disabled={form.state.isSubmitting || contactMutation.isPending}
              >
                {form.state.isSubmitting || contactMutation.isPending ? (
                  <>
                    Sending... <Loader2 className="animate-spin" />
                  </>
                ) : (
                  <>
                    Send <Send />
                  </>
                )}
              </Button>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </Card>
  );
}
