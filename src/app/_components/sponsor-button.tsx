"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { toast } from "sonner";
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
  if (!children) {
    if (actionType === "sponsor" && action === "redirect") {
      children = "Sponsor Us";
    } else if (actionType === "donate" && action === "redirect") {
      children = "Donate";
    } else if (actionType === "sponsor" && action === "form") {
      children = "Become a Sponsor";
    } else if (actionType === "donate" && action === "form") {
      children = "Make a Donation";
    }
  }

  if (action === "redirect") {
    return (
      <LinkButton href="/donate#sponsor" variant={variant} {...props}>
        {children}
      </LinkButton>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={() =>
        toast.success(
          "This functionality is coming soon! For now, please contact us directly at goldrushrobotics@charlotte.edu",
        )
      }
      {...props}
    >
      {children}
    </Button>
  );
}
