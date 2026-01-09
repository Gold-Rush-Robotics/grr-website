"use client";

import { Link } from "@/app/_components/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EmailDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  email: string;
}

export function EmailDisplay({
  email,
  className,
  ...props
}: EmailDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success("Email address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy email address");
    }
  };

  return (
    <Card className={cn("bg-card/50 p-0", className)} {...props}>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Mail className="text-secondary size-5 shrink-0" />
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Primary Email
            </span>
            <Link
              href={`mailto:${email}`}
              noArrow
              className="text-secondary text-lg font-medium hover:underline"
            >
              {email}
            </Link>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="shrink-0"
          aria-label="Copy email address"
        >
          {copied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
