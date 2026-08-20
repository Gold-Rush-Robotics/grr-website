"use client";

import { Typography } from "@/app/_components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { LoaderCircle, LogIn } from "lucide-react";
import { useEffect, useState } from "react";

export function SignInCard() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");

    if (error) {
      setErrorMessage(
        error === "unauthorized"
          ? "This Google account is not approved for admin access."
          : "Google sign-in failed. Please try again.",
      );
    }
  }, []);

  async function handleSignIn() {
    setErrorMessage(null);
    setIsPending(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin",
        errorCallbackURL: "/admin?error=unauthorized",
      });

      if (error) {
        setErrorMessage(error.message ?? "Unable to sign in with Google.");
      }
    } catch {
      setErrorMessage("Unable to reach the sign-in service. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="bg-card/50">
      <CardContent>
        <FieldGroup>
          <Field className="space-y-4">
            <Typography variant="h2">Admin Sign In</Typography>
            <Typography variant="small">
              Sign in using an approved Google account.
            </Typography>
          </Field>
          <FieldError>{errorMessage}</FieldError>
          <Button type="button" onClick={handleSignIn} disabled={isPending}>
            {isPending ? <LoaderCircle className="animate-spin" /> : <LogIn />}
            Continue with Google
          </Button>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
