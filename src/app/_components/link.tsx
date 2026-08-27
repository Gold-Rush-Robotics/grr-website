"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import NextLink from "next/link";
import type React from "react";
import { toast } from "sonner";

export interface LinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  href?: string;
  noArrow?: boolean;
}

export function Link({
  href,
  onClick,
  className,
  children,
  noArrow,
  ...props
}: LinkProps) {
  const isExternal = href && !href.startsWith("/") && !href.startsWith("#");

  const linkClasses = cn(
    "text-secondary underline-offset-4 hover:underline",
    className,
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={cn(linkClasses, "group")}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
        {!noArrow && (
          <ArrowUpRight className="ml-0.5 inline size-4 transition-transform duration-350 ease-in-out group-hover:translate-x-0.25 group-hover:-translate-y-0.25" />
        )}
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
    <NextLink
      href={href}
      className={linkClasses}
      {...props}
      onClick={onClick}
    >
      {children}
    </NextLink>
  );
}
