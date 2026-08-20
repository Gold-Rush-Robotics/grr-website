"use client";

import { Trash2, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { type RouterOutputs } from "@/trpc/react";

type ApprovedEmail = RouterOutputs["approvedEmail"]["approvedEmails"][number];

interface ApprovedEmailListItemProps {
  approvedEmail: ApprovedEmail;
  currentUserEmail: string;
  isRemoving: boolean;
  onRemove: (id: string) => void;
}

export function ApprovedEmailListItem({
  approvedEmail,
  currentUserEmail,
  isRemoving,
  onRemove,
}: ApprovedEmailListItemProps) {
  const isCurrentUser =
    approvedEmail.email === currentUserEmail.trim().toLowerCase();

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar size="lg">
          <AvatarImage src={approvedEmail.user?.image ?? undefined} alt="" />
          <AvatarFallback>
            <UserRound className="size-5" />
          </AvatarFallback>
        </Avatar>
        {approvedEmail.user ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {approvedEmail.user.name}
              {isCurrentUser ? (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  (you)
                </span>
              ) : null}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {approvedEmail.email}
            </p>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="truncate text-sm">{approvedEmail.email}</p>
            <p className="text-muted-foreground text-xs italic">
              User has never logged in
            </p>
          </div>
        )}
      </div>

      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={`Remove ${approvedEmail.email}`}
        disabled={isCurrentUser || isRemoving}
        onClick={() => onRemove(approvedEmail.id)}
      >
        <Trash2 />
      </Button>
    </li>
  );
}
