"use client";

import { LoaderCircle } from "lucide-react";

import { api } from "@/trpc/react";
import { CreateUserCard } from "./create-user-card";
import { AdminPasswordChangeCard } from "./admin-password-change-card";
import { AdminSessionPanel } from "./admin-session-panel";

export function AdminDashboardPanels() {
  const { data, isLoading, error } = api.admin.me.useQuery();

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <LoaderCircle className="size-4 animate-spin" />
        Loading admin tools...
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-sm">{error.message}</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {data.user.passwordNeedsReset ? (
        <AdminPasswordChangeCard />
      ) : (
        <CreateUserCard />
      )}
      <AdminSessionPanel />
    </div>
  );
}
