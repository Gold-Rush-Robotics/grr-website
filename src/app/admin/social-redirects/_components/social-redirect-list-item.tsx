"use client";

import { ExternalLink, Pencil, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { Typography } from "@/app/_components/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type RouterOutputs } from "@/trpc/react";
import Link from "next/link";

type SocialRedirect = RouterOutputs["socialRedirect"]["getAll"][number];

interface SocialRedirectListItemProps {
  socialRedirect: SocialRedirect;
  isRemoving: boolean;
  onEdit: (socialRedirect: SocialRedirect) => void;
  onRemove: (uri: string) => void;
}

export function SocialRedirectListItem({
  socialRedirect,
  isRemoving,
  onEdit,
  onRemove,
}: SocialRedirectListItemProps) {
  const [pathExists, setPathExists] = useState(false);

  useEffect(() => {
    const path = socialRedirect.uri.trim().replace(/^\/+/, "");
    const controller = new AbortController();

    async function checkPath() {
      try {
        const response = await fetch(`/${path}`, {
          method: "HEAD",
          redirect: "manual",
          cache: "no-store",
          signal: controller.signal,
        });

        setPathExists(response.ok);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setPathExists(false);
        }
      }
    }

    void checkPath();

    return () => controller.abort();
  }, [socialRedirect.uri]);

  return (
    <li
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3",
        pathExists && "bg-destructive/10 text-destructive",
      )}
    >
      <div className="min-w-0">
        <Typography
          variant="small"
          className="flex items-center gap-2 truncate"
        >
          {pathExists && (
            <TriangleAlert className="size-4" aria-hidden="true" />
          )}
          <span>{socialRedirect.uri}</span>
        </Typography>
        <Typography
          variant="muted"
          className={cn("truncate", pathExists && "text-destructive")}
        >
          {pathExists
            ? "Conflicts with an existing page and will not redirect"
            : socialRedirect.redirectUri}
        </Typography>
      </div>
      <div className="flex items-center gap-1">
        <Button
          asChild
          size="icon-sm"
          variant="ghost"
          aria-label="Test redirect"
        >
          <Link
            href={socialRedirect.uri}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink />
          </Link>
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={`Edit ${socialRedirect.uri}`}
          onClick={() => onEdit(socialRedirect)}
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={`Remove ${socialRedirect.uri}`}
          disabled={isRemoving}
          onClick={() => onRemove(socialRedirect.uri)}
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}
