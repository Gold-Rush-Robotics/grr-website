"use client";

import { useAppForm } from "@/app/_components/form/form";
import { Typography } from "@/app/_components/typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { api, type RouterOutputs } from "@/trpc/react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { OfficerDialog, type OfficerValues } from "./officer-dialog";
import { OfficerListItem } from "./officer-list-item";

type Officer = RouterOutputs["officers"]["getAll"][number];

/** True when both id lists are the same length and in the same order. */
function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

export function OfficerCard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [orderedOfficers, setOrderedOfficers] = useState<Officer[]>([]);
  const [savedOrderIds, setSavedOrderIds] = useState<string[]>([]);
  const orderedOfficersRef = useRef<Officer[]>([]);
  const savedOrderIdsRef = useRef<string[]>([]);
  const utils = api.useUtils();
  const officers = api.officers.getAll.useQuery();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const createOfficer = api.officers.create.useMutation({
    onSuccess: async () => {
      setDialogOpen(false);
      toast.success("Officer added.");
      await utils.officers.getAll.invalidate();
    },
  });
  const updateOfficer = api.officers.update.useMutation({
    onSuccess: async () => {
      setDialogOpen(false);
      toast.success("Officer updated.");
      await utils.officers.getAll.invalidate();
    },
  });
  const removeOfficer = api.officers.remove.useMutation({
    onSuccess: async () => {
      toast.success("Officer removed.");
      await utils.officers.getAll.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const reorderOfficers = api.officers.reorder.useMutation();
  const orderForm = useAppForm({
    defaultValues: { ids: [] as string[] },
    onSubmit: async ({ value }) => {
      try {
        await reorderOfficers.mutateAsync({ ids: value.ids });
        orderForm.reset({ ids: value.ids });
        setSavedOrderIds(value.ids);
        savedOrderIdsRef.current = value.ids;
        toast.success("Officer order saved.");
        await utils.officers.getAll.invalidate();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to save the order.",
        );
      }
    },
  });

  useEffect(() => {
    if (!officers.data) return;
    const savedIds = officers.data.map(({ id }) => id);
    const currentIds = orderedOfficersRef.current.map(({ id }) => id);
    const wasDirty = !sameOrder(currentIds, savedOrderIdsRef.current);
    const incomingById = new Map(
      officers.data.map((officer) => [officer.id, officer]),
    );
    const nextOfficers = wasDirty
      ? [
          ...orderedOfficersRef.current.flatMap(({ id }) => {
            const officer = incomingById.get(id);
            return officer ? [officer] : [];
          }),
          ...officers.data.filter(({ id }) => !currentIds.includes(id)),
        ]
      : officers.data;
    const nextIds = nextOfficers.map(({ id }) => id);

    orderedOfficersRef.current = nextOfficers;
    savedOrderIdsRef.current = savedIds;
    setOrderedOfficers(nextOfficers);
    setSavedOrderIds(savedIds);
    orderForm.reset({ ids: nextIds });
  }, [officers.data, orderForm]);
  const presignPhoto = api.photos.presignUploads.useMutation();
  const isPending =
    createOfficer.isPending ||
    updateOfficer.isPending ||
    presignPhoto.isPending;
  const listDisabled = removeOfficer.isPending || reorderOfficers.isPending;

  function openCreateDialog() {
    setEditingOfficer(null);
    createOfficer.reset();
    setDialogOpen(true);
  }

  function openEditDialog(officer: Officer) {
    setEditingOfficer(officer);
    updateOfficer.reset();
    setDialogOpen(true);
  }

  async function handleSubmit(
    values: OfficerValues,
    photo?: File,
    onPhotoUploaded?: (photoKey: string) => void,
  ) {
    let photoKey = values.photoKey;
    if (photo) {
      const [upload] = await presignPhoto.mutateAsync([
        {
          fileName: photo.name,
          fileSize: photo.size,
          fileType: photo.type,
          purpose: "officers",
        },
      ]);
      if (!upload) {
        throw new Error("The upload URL was not returned.");
      }

      const response = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": photo.type },
        body: photo,
      });
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
      photoKey = upload.key;
      onPhotoUploaded?.(photoKey);
    }

    const input = {
      name: values.name,
      role: values.role,
      email: values.email,
      photoKey,
    };
    if (editingOfficer) {
      await updateOfficer.mutateAsync({ id: editingOfficer.id, ...input });
    } else {
      await createOfficer.mutateAsync(input);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedOfficers.findIndex(({ id }) => id === active.id);
    const newIndex = orderedOfficers.findIndex(({ id }) => id === over.id);
    const reordered = arrayMove(orderedOfficers, oldIndex, newIndex);
    orderedOfficersRef.current = reordered;
    setOrderedOfficers(reordered);
    orderForm.setFieldValue(
      "ids",
      reordered.map(({ id }) => id),
    );
  }

  return (
    <>
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Officers</CardTitle>
          <CardDescription>
            Drag the handle to set the order used on the Contact page.
          </CardDescription>
          <CardAction>
            <Button type="button" onClick={openCreateDialog}>
              <Plus /> New officer
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void orderForm.handleSubmit();
            }}
          >
            {officers.isLoading ? (
              <Typography variant="muted" className="flex items-center gap-2">
                <Spinner /> Loading officers...
              </Typography>
            ) : officers.error ? (
              <FieldError>Unable to load officers.</FieldError>
            ) : orderedOfficers.length ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderedOfficers.map(({ id }) => id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="divide-y overflow-hidden rounded-md border">
                    {orderedOfficers.map((officer) => (
                      <OfficerListItem
                        key={officer.id}
                        officer={officer}
                        disabled={listDisabled}
                        onEdit={openEditDialog}
                        onRemove={(id) => removeOfficer.mutate({ id })}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            ) : (
              <Typography variant="muted">
                No officers have been added.
              </Typography>
            )}

            <orderForm.Subscribe
              selector={(state) =>
                [state.values.ids, state.canSubmit, state.isSubmitting] as const
              }
            >
              {([ids, canSubmit, isSubmitting]) => {
                const orderChanged = !sameOrder(ids, savedOrderIds);
                return (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!orderChanged || !canSubmit || isSubmitting}
                    >
                      {isSubmitting && <Spinner />}
                      Save order
                    </Button>
                  </div>
                );
              }}
            </orderForm.Subscribe>
          </form>
        </CardContent>
      </Card>

      <OfficerDialog
        open={dialogOpen}
        initialValues={
          editingOfficer
            ? {
                name: editingOfficer.name,
                role: editingOfficer.role,
                email: editingOfficer.email,
                photoKey: editingOfficer.photoKey,
                photoUrl: editingOfficer.photoUrl,
              }
            : undefined
        }
        isPending={isPending}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </>
  );
}
