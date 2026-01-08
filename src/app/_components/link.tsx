"use client";

import { cn } from "@/lib/utils";
import NextLink from "next/link";
import type React from "react";
import { toast } from "sonner";

export interface LinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  href?: string;
  onClick?: () => void;
}

export function Link({
  href,
  onClick,
  className,
  children,
  ...props
}: LinkProps) {
  const isExternal = href && !href.startsWith("/");

  const linkClasses = cn(
    "text-secondary underline-offset-4 hover:underline",
    className,
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  if (!href) {
    onClick ??= () => toast.error("Link has no target");
    return (
      <span className={linkClasses} onClick={onClick} {...props}>
        {children}
      </span>
    );
  }

  return (
    <NextLink href={href} className={linkClasses} {...props}>
      {children}
    </NextLink>
  );
}
