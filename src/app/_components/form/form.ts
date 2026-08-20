import { createFormHook } from "@tanstack/react-form";

import { fieldContext, formContext } from "./contexts";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";

export const { useAppForm } = createFormHook({
  fieldComponents: { TextField },
  formComponents: { SubmitButton },
  fieldContext,
  formContext,
});
