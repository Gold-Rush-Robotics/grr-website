"use client";

import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import NextLink from "next/link";
import * as React from "react";

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export interface LinkButtonProps extends Omit<ButtonProps, "asChild"> {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}

export function LinkButton({
  href,
  external,
  children,
  className,
  ...buttonProps
}: LinkButtonProps) {
  external ??= !href.startsWith("/");

  if (external) {
    return (
      <Button asChild {...buttonProps}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("group flex items-center gap-1", className)}
        >
          {children}{" "}
          <ArrowUpRight className="transition-transform duration-350 ease-in-out group-hover:translate-x-0.25 group-hover:-translate-y-0.25" />
        </a>
      </Button>
    );
  }

  return (
    <Button asChild {...buttonProps}>
      <NextLink href={href} className={className}>
        {children}
      </NextLink>
    </Button>
  );
}
