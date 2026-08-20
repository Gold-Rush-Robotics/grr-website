"use client";

import { revalidateLogic } from "@tanstack/react-form";
import { TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { useAppForm } from "@/app/_components/form/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { socialRedirectUriSchema } from "@/lib/social-redirect";

type RedirectValues = {
  uri: string;
  redirectUri: string;
};

interface SocialRedirectDialogProps {
  open: boolean;
  initialValues?: RedirectValues;
  isPending: boolean;
  uriError?: string;
  redirectUriError?: string;
  onOpenChange: (open: boolean) => void;
  onValuesChange: () => void;
  onSubmit: (values: RedirectValues) => Promise<void>;
}

const redirectSchema = z.object({
  uri: socialRedirectUriSchema,
  redirectUri: z.string().trim().url("Enter a valid URL."),
});

export function SocialRedirectDialog({
  open,
  initialValues,
  isPending,
  uriError,
  redirectUriError,
  onOpenChange,
  onValuesChange,
  onSubmit,
}: SocialRedirectDialogProps) {
  const [pathExists, setPathExists] = useState(false);
  const collisionCheckVersion = useRef(0);
  const isEditing = Boolean(initialValues);
  const form = useAppForm({
    defaultValues: initialValues ?? { uri: "", redirectUri: "" },
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "blur",
    }),
    validators: { onDynamic: redirectSchema },
    onSubmit: async ({ value }) => {
      setPathExists(await pathConflicts(value.uri));

      try {
        await onSubmit(value);
      } catch {
        // The mutation error remains visible in the open dialog.
      }
    },
  });

  const checkPathCollision = useCallback(async (uri: string) => {
    const version = ++collisionCheckVersion.current;
    const exists = await pathConflicts(uri);

    if (version === collisionCheckVersion.current) {
      setPathExists(exists);
    }
  }, []);

  const clearPathCollision = useCallback(() => {
    collisionCheckVersion.current += 1;
    setPathExists(false);
  }, []);

  useEffect(() => {
    if (open) {
      const values = initialValues ?? { uri: "", redirectUri: "" };
      form.reset(values);
      clearPathCollision();
      void checkPathCollision(values.uri);
    } else {
      clearPathCollision();
    }
  }, [checkPathCollision, clearPathCollision, form, initialValues, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <form
          className="space-y-6"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit social redirect" : "New social redirect"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the short path or the URL it sends visitors to."
                : "Create a short path that sends visitors to a social account."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <form.AppField name="uri">
              {(field) => (
                <field.TextField
                  label="Path"
                  autoComplete="off"
                  placeholder="/instagram"
                  disabled={isPending}
                  required
                  onValueChange={() => {
                    clearPathCollision();
                    onValuesChange();
                  }}
                  onFieldBlur={(value) => {
                    void checkPathCollision(value);
                  }}
                  externalError={
                    pathExists ? (
                      <span className="flex items-center gap-2">
                        <TriangleAlert />A page already exists at this path, so
                        it cannot redirect.
                      </span>
                    ) : (
                      uriError
                    )
                  }
                />
              )}
            </form.AppField>

            <form.AppField name="redirectUri">
              {(field) => (
                <field.TextField
                  label="Redirect URL"
                  type="url"
                  autoComplete="off"
                  placeholder="https://instagram.com/49er_robotics"
                  disabled={isPending}
                  required
                  onValueChange={onValuesChange}
                  externalError={redirectUriError}
                />
              )}
            </form.AppField>
          </div>

          <form.AppForm>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <form.SubmitButton disabled={isPending}>
                {isEditing ? "Save changes" : "Create redirect"}
              </form.SubmitButton>
            </DialogFooter>
          </form.AppForm>
        </form>
      </DialogContent>
    </Dialog>
  );
}

async function pathConflicts(uri: string) {
  const path = uri.trim().replace(/^\/+/, "");
  if (!path) return false;

  try {
    const response = await fetch(`/${path}`, {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
