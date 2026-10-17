import { createFormHook, revalidateLogic } from "@tanstack/react-form";

import { fieldContext, formContext } from "./contexts";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";
import { TextareaField } from "./textarea-field";

const { useAppForm: useBaseAppForm } = createFormHook({
  fieldComponents: { TextField, TextareaField },
  formComponents: { SubmitButton },
  fieldContext,
  formContext,
});

export const useAppForm: typeof useBaseAppForm = (options) =>
  useBaseAppForm({ validationLogic: revalidateLogic(), ...options });
