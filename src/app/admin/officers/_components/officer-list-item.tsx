"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { Typography } from "@/app/_components/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";

type Officer = RouterOutputs["officers"]["getAll"][number];

interface OfficerListItemProps {
  officer: Officer;
  disabled: boolean;
  onEdit: (officer: Officer) => void;
  onRemove: (id: string) => void;
}

export function OfficerListItem({
  officer,
  disabled,
  onEdit,
  onRemove,
}: OfficerListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: officer.id, disabled });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "bg-card flex items-center gap-3 px-4 py-3",
        isDragging && "relative z-10 opacity-60 shadow-lg",
      )}
    >
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={`Reorder ${officer.name}`}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical />
      </Button>
      <img
        src={officer.photoUrl ?? "/people/placeholder.png"}
        alt=""
        className="size-12 shrink-0 object-cover"
      />
      <div className="min-w-0 flex-1">
        <Typography variant="small" className="truncate">
          {officer.name}
        </Typography>
        <Typography variant="muted" className="truncate">
          {officer.role} · {officer.email}
        </Typography>
      </div>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={`Edit ${officer.name}`}
        disabled={disabled}
        onClick={() => onEdit(officer)}
      >
        <Pencil />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={`Remove ${officer.name}`}
        disabled={disabled}
        onClick={() => onRemove(officer.id)}
      >
        <Trash2 />
      </Button>
    </li>
  );
}
