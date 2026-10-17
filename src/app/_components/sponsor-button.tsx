"use client";

import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ContactForm } from "./contact-form";
import { LinkButton } from "./link-button";

type SponsorButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    action?: "redirect" | "form";
    actionType?: "sponsor" | "donate";
  };

export function SponsorButton({
  variant = "outline",
  action = "form",
  actionType = "sponsor",
  children,
  ...props
}: SponsorButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  children ??= actionType === "donate" ? "Donate" : "Sponsor Us";

  if (action === "redirect") {
    return (
      <LinkButton href="/donate#sponsor" variant={variant} {...props}>
        {children}
      </LinkButton>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) setOpen(nextOpen);
      }}
    >
      <DialogPrimitive.Trigger asChild>
        <Button variant={variant} {...props}>
          {children}
        </Button>
      </DialogPrimitive.Trigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {actionType === "donate" ? "Make a Donation" : "Become a Sponsor"}
          </DialogTitle>
          <DialogDescription>
            Tell us how you would like to support 49er Robotics. We will contact
            you by email to discuss your{" "}
            {actionType === "donate" ? "donation" : "sponsorship"}.
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          inquiryType={actionType}
          embedded
          onPendingChange={setIsSubmitting}
          onSent={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
