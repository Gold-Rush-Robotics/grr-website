"use client";

import { useSelector } from "@tanstack/react-form";
import { useId, type ComponentProps } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useFieldContext } from "./contexts";
import { FormFieldErrors } from "./field-errors";

type TextareaFieldProps = Omit<
  ComponentProps<typeof Textarea>,
  "value" | "onChange" | "onBlur"
> & {
  label: string;
};

export function TextareaField({ label, ...props }: TextareaFieldProps) {
  const id = useId();
  const field = useFieldContext<string>();
  const submitAttempted = useSelector(
    field.form.store,
    (state) => state.submissionAttempts > 0,
  );
  const isInvalid = submitAttempted && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        {...props}
        id={id}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={isInvalid || undefined}
        aria-describedby={isInvalid ? `${id}-error` : undefined}
      />
      {isInvalid && (
        <FormFieldErrors id={`${id}-error`} errors={field.state.meta.errors} />
      )}
    </Field>
  );
}
