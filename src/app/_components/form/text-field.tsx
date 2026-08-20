"use client";

import type { ComponentProps, ReactNode } from "react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "./contexts";
import { FormFieldErrors } from "./field-errors";

type TextFieldProps = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "onBlur"
> & {
  label: string;
  externalError?: ReactNode;
  trailing?: ReactNode;
  onFieldBlur?: (value: string) => void;
  onValueChange?: (value: string) => void;
};

export function TextField({
  label,
  externalError,
  trailing,
  onFieldBlur,
  onValueChange,
  required,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const errorId = `${field.name}-error`;
  const showFieldErrors =
    field.state.meta.isBlurred && !field.state.meta.isValid;
  const isInvalid = Boolean(externalError) || showFieldErrors;

  return (
    <Field data-invalid={isInvalid || undefined}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <div className="flex gap-2">
        <Input
          {...props}
          id={field.name}
          name={field.name}
          required={required}
          value={field.state.value}
          aria-describedby={isInvalid ? errorId : undefined}
          aria-invalid={isInvalid || undefined}
          onBlur={() => {
            field.handleBlur();
            onFieldBlur?.(field.state.value);
          }}
          onChange={(event) => {
            const value = event.target.value;
            const hasBeenBlurred = field.state.meta.isBlurred;
            field.handleChange(value);
            onValueChange?.(value);

            if (hasBeenBlurred) {
              queueMicrotask(() => void field.validate("blur"));
            }
          }}
        />
        {trailing}
      </div>
      {externalError ? (
        <FieldError id={errorId}>{externalError}</FieldError>
      ) : (
        showFieldErrors && (
          <FormFieldErrors id={errorId} errors={field.state.meta.errors} />
        )
      )}
    </Field>
  );
}
