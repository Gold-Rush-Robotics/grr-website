"use client";

import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import * as React from "react";

export const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: clsx(
        "scroll-m-20 text-4xl font-bold tracking-wide [&:not(:first-child)]:mt-8",
      ),
      h2: clsx(
        "scroll-m-20 text-3xl font-semibold tracking-wide first:mt-0 [&:not(:first-child)]:mt-8",
      ),
      h3: clsx(
        "scroll-m-20 text-2xl font-semibold tracking-wide [&:not(:first-child)]:mt-8",
      ),
      h4: clsx(
        "scroll-m-20 text-xl font-semibold tracking-wide [&:not(:first-child)]:mt-8",
      ),
      h5: clsx(
        "scroll-m-20 text-lg font-semibold tracking-wide [&:not(:first-child)]:mt-8",
      ),
      h6: clsx(
        "scroll-m-20 text-base font-semibold tracking-wide [&:not(:first-child)]:mt-8",
      ),
      p: clsx("leading-7"),
      lead: clsx("text-muted-foreground text-xl"),
      large: clsx("text-lg font-semibold"),
      small: clsx("text-sm leading-none font-medium"),
      muted: clsx("text-muted-foreground text-sm"),
      blockquote: clsx("mt-6 border-l-2 pl-6 italic"),
      code: clsx(
        "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      ),
      list: clsx("my-6 ml-6 list-disc [&>li]:mt-2"),
      inlineCode:
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

type TypographyElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "blockquote"
  | "code"
  | "pre"
  | "ul"
  | "li";

export interface TypographyProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: TypographyElement;
}

export function Typography({
  className,
  variant,
  as,
  ...props
}: TypographyProps) {
  const Component = as ?? getDefaultElement(variant) ?? "p";
  return (
    <Component
      className={clsx(typographyVariants({ variant }), className)}
      {...props}
    />
  );
}

function getDefaultElement(
  variant: VariantProps<typeof typographyVariants>["variant"],
) {
  let element: TypographyElement;
  if (variant === "inlineCode") {
    element = "code";
  } else if (variant === "list") {
    element = "ul";
  } else if (
    variant === "muted" ||
    variant === "lead" ||
    variant === "large" ||
    variant === "small"
  ) {
    element = "p";
  } else {
    element = (variant ?? "p") as TypographyElement;
  }
  return element;
}
