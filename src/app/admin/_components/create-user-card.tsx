"use client";

import { useState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

const PLACEHOLDER_USERS = [
  ["Nitin Chandrasekhar", "nchandr8@charlotte.edu"],
  ["Tyler Eisenbraun", "teisenbr@charlotte.edu"],
  ["Sylvester Pudelko", "spudelko@charlotte.edu"],
  ["Sean Devlin", "sdevlin1@charlotte.edu"],
] as const;

export function CreateUserCard() {
  const [placeholderUser, _setPlaceholderUser] = useState(
    PLACEHOLDER_USERS[Math.floor(Math.random() * PLACEHOLDER_USERS.length)]!,
  );
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    temporaryPassword: string;
  } | null>(null);

  const createUser = api.admin.createUser.useMutation({
    onSuccess: async (result) => {
      setName("");
      setEmail("");
      setErrorMessage(null);
      setCreatedCredentials({
        email: result.user.email,
        temporaryPassword: result.temporaryPassword,
      });
      toast.success("User created.");
      await utils.admin.me.invalidate();
    },
    onError: (error) => {
      setErrorMessage(error.message);
      toast.error(error.message);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    createUser.mutate({
      name,
      email,
    });
  }

  const [placeholderName, placeholderEmail] = placeholderUser;

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle>Create User</CardTitle>
        <CardDescription>
          Create a new account and generate an initial password for the user.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-user-name">Name</FieldLabel>
              <Input
                id="new-user-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={placeholderName}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-user-email">Email</FieldLabel>
              <Input
                id="new-user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={placeholderEmail}
                required
              />
              <FieldDescription>
                The generated password is shown once after creation so it can be
                shared with the user.
              </FieldDescription>
            </Field>
            <FieldError>{errorMessage}</FieldError>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <UserPlus />
              )}
              Create User
            </Button>
          </FieldGroup>
        </form>

        {createdCredentials ? (
          <div className="bg-background/60 space-y-2 rounded-lg border p-4 text-sm">
            <p className="font-medium">New user credentials</p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {createdCredentials.email}
            </p>
            <p className="font-mono break-all">
              <span className="text-muted-foreground font-sans">Password:</span>{" "}
              {createdCredentials.temporaryPassword}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
