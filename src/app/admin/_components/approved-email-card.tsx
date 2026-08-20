"use client";

import { useAppForm } from "@/app/_components/form/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { revalidateLogic } from "@tanstack/react-form";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ApprovedEmailListItem } from "./approved-email-list-item";

interface ApprovedEmailCardProps {
  currentUserEmail: string;
}

const OFFICER_EMAILS = [
  "teisenbr@charlotte.edu",
  "sdevlin1@charlotte.edu",
  "rdasari2@charlotte.edu",
  "lcain8@charlotte.edu",
  "mmai4@charlotte.edu",
  "gjones97@charlotte.edu",
  "psmit145@charlotte.edu",
] as const;

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((email) => email.toLowerCase()),
});

export function ApprovedEmailCard({
  currentUserEmail,
}: ApprovedEmailCardProps) {
  const [placeholderEmail, setPlaceholderEmail] = useState("name@example.com");
  const utils = api.useUtils();
  const approvedEmails = api.approvedEmail.approvedEmails.useQuery();
  const approveEmail = api.approvedEmail.approveEmail.useMutation({
    onSuccess: async (approvedEmail) => {
      toast.success(`${approvedEmail.email} is approved.`);
      await utils.approvedEmail.approvedEmails.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const removeApprovedEmail = api.approvedEmail.removeApprovedEmail.useMutation(
    {
      onSuccess: async () => {
        toast.success("Approved email removed.");
        await utils.approvedEmail.approvedEmails.invalidate();
      },
      onError: (error) => toast.error(error.message),
    },
  );
  const form = useAppForm({
    defaultValues: { email: "" },
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "blur",
    }),
    validators: { onDynamic: emailSchema },
    onSubmit: async ({ value }) => {
      try {
        await approveEmail.mutateAsync(value);
        form.reset();
      } catch {
        // The mutation displays its error in a toast.
      }
    },
  });

  useEffect(() => {
    setPlaceholderEmail(
      OFFICER_EMAILS[Math.floor(Math.random() * OFFICER_EMAILS.length)]!,
    );
  }, []);

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle>Approved Accounts</CardTitle>
        <CardDescription>
          Emails to Google Accounts on this list can sign in to the admin
          dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Email"
                type="email"
                autoComplete="email"
                placeholder={placeholderEmail}
                disabled={approveEmail.isPending}
                required
                externalError={
                  approveEmail.error?.data?.zodError?.fieldErrors.email?.[0]
                }
                trailing={
                  <form.AppForm>
                    <form.SubmitButton disabled={approveEmail.isPending}>
                      <UserPlus />
                      Add
                    </form.SubmitButton>
                  </form.AppForm>
                }
              />
            )}
          </form.AppField>
        </form>

        {approvedEmails.isLoading ? (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Spinner />
            Loading accounts...
          </p>
        ) : approvedEmails.error ? (
          <p className="text-destructive text-sm">Unable to load accounts.</p>
        ) : approvedEmails.data?.length ? (
          <ul className="divide-y rounded-md border">
            {approvedEmails.data.map((approvedEmail) => (
              <ApprovedEmailListItem
                key={approvedEmail.id}
                approvedEmail={approvedEmail}
                currentUserEmail={currentUserEmail}
                isRemoving={removeApprovedEmail.isPending}
                onRemove={(id) => removeApprovedEmail.mutate({ id })}
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No accounts have been approved.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
