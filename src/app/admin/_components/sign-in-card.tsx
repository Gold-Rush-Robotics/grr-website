"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogIn } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignInCard() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function readErrorMessage(response: Response) {
    try {
      const data = (await response.json()) as { message?: string };
      return data.message ?? "Unable to sign in.";
    } catch {
      return "Unable to sign in.";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsPending(true);

    const normalizedIdentifier = identifier.trim().toLowerCase();

    // Admin is special
    if (normalizedIdentifier === "admin") {
      await handleAdminLogin(normalizedIdentifier, password);
      return;
    }

    const { error } = await authClient.signIn.email({
      email: normalizedIdentifier,
      password,
      callbackURL: "/admin",
      rememberMe: true,
    });

    setIsPending(false);

    if (error) {
      const message = error.message ?? "Unable to sign in.";
      setErrorMessage(message);
      return;
    }
  }

  async function handleAdminLogin(identifier: string, password: string) {
    const response = await fetch("/api/auth/bootstrap-admin/sign-in", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    setIsPending(false);

    if (!response.ok) {
      const message = await readErrorMessage(response);
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    router.refresh();
  }

  return (
    <Card className="bg-card/50">
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="admin-identifier">
                Email or Username
              </FieldLabel>
              <Input
                id="admin-identifier"
                autoComplete="username"
                placeholder="name@example.com"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
              <FieldDescription>
                Enter the email address or username associated with your
                account.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-password">Password</FieldLabel>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <FieldDescription>
                Enter the password for your account.
              </FieldDescription>
            </Field>
            <FieldError>{errorMessage}</FieldError>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <LogIn />
              )}
              Sign In
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
