import { FieldError } from "@/components/ui/field";

function getErrorMessages(errors: readonly unknown[]): string[] {
  return errors.flatMap((error) => {
    if (Array.isArray(error)) return getErrorMessages(error);
    if (typeof error === "string") return error;
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }
    return [];
  });
}

export function FormFieldErrors({
  id,
  errors,
}: {
  id: string;
  errors: readonly unknown[];
}) {
  const messages = getErrorMessages(errors);
  return messages.length ? (
    <FieldError id={id}>{messages[0]}</FieldError>
  ) : null;
}
