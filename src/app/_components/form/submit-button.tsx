"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFormContext } from "./contexts";

export function SubmitButton({
  children,
  ...props
}: ComponentProps<typeof Button>) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) =>
        [state.canSubmit, state.isSubmitting, state.submissionAttempts] as const
      }
    >
      {([canSubmit, isSubmitting, submissionAttempts]) => (
        <Button
          {...props}
          type="submit"
          formNoValidate
          disabled={
            isSubmitting ||
            (submissionAttempts > 0 && !canSubmit) ||
            props.disabled
          }
        >
          {isSubmitting && <Spinner />}
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}
