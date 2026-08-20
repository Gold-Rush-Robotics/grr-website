"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { SocialRedirectDialog } from "./social-redirect-dialog";
import { SocialRedirectListItem } from "./social-redirect-list-item";

type SocialRedirect = RouterOutputs["socialRedirect"]["getAll"][number];

export function SocialRedirectCard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<SocialRedirect | null>(
    null,
  );
  const utils = api.useUtils();
  const socialRedirects = api.socialRedirect.getAll.useQuery();

  const createSocialRedirect = api.socialRedirect.create.useMutation({
    onSuccess: async (socialRedirect) => {
      setDialogOpen(false);
      toast.success(`${socialRedirect.uri} now redirects.`);
      await utils.socialRedirect.getAll.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const updateSocialRedirect = api.socialRedirect.update.useMutation({
    onSuccess: async (socialRedirect) => {
      setDialogOpen(false);
      toast.success(`${socialRedirect.uri} was updated.`);
      await utils.socialRedirect.getAll.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const removeSocialRedirect = api.socialRedirect.remove.useMutation({
    onSuccess: async () => {
      toast.success("Social redirect removed.");
      await utils.socialRedirect.getAll.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const activeMutation = editingRedirect
    ? updateSocialRedirect
    : createSocialRedirect;

  function openCreateDialog() {
    setEditingRedirect(null);
    createSocialRedirect.reset();
    setDialogOpen(true);
  }

  function openEditDialog(socialRedirect: SocialRedirect) {
    setEditingRedirect(socialRedirect);
    updateSocialRedirect.reset();
    setDialogOpen(true);
  }

  async function handleSubmit(values: { uri: string; redirectUri: string }) {
    if (editingRedirect) {
      await updateSocialRedirect.mutateAsync({
        originalUri: editingRedirect.uri,
        ...values,
      });
    } else {
      await createSocialRedirect.mutateAsync(values);
    }
  }

  return (
    <>
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Manage Redirects</CardTitle>
          <CardDescription>
            Short paths that send visitors to the matching social account. They
            won&apos;t work if a page already exists at that path.
          </CardDescription>
          <CardAction>
            <Button type="button" onClick={openCreateDialog}>
              <Plus />
              New redirect
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {socialRedirects.isLoading ? (
            <Typography variant="muted" className="flex items-center gap-2">
              <Spinner />
              Loading redirects...
            </Typography>
          ) : socialRedirects.error ? (
            <FieldError>Unable to load redirects.</FieldError>
          ) : socialRedirects.data?.length ? (
            <ul className="divide-y rounded-md border">
              {socialRedirects.data.map((socialRedirect) => (
                <SocialRedirectListItem
                  key={socialRedirect.uri}
                  socialRedirect={socialRedirect}
                  isRemoving={removeSocialRedirect.isPending}
                  onEdit={openEditDialog}
                  onRemove={(uri) => removeSocialRedirect.mutate({ uri })}
                />
              ))}
            </ul>
          ) : (
            <Typography variant="muted">
              No social redirects have been added.
            </Typography>
          )}
        </CardContent>
      </Card>

      <SocialRedirectDialog
        open={dialogOpen}
        initialValues={editingRedirect ?? undefined}
        isPending={activeMutation.isPending}
        uriError={
          activeMutation.error?.data?.zodError?.fieldErrors.uri?.[0] ??
          activeMutation.error?.message
        }
        redirectUriError={
          activeMutation.error?.data?.zodError?.fieldErrors.redirectUri?.[0]
        }
        onOpenChange={setDialogOpen}
        onValuesChange={() => activeMutation.reset()}
        onSubmit={handleSubmit}
      />
    </>
  );
}
