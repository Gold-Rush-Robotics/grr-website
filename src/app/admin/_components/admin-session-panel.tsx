"use client";

import { LoaderCircle } from "lucide-react";

import { api } from "@/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminSessionPanel() {
  const { data, error, isLoading } = api.admin.me.useQuery();

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle>Authenticated tRPC Check</CardTitle>
        <CardDescription>
          This panel is loaded through the protected admin tRPC router.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <LoaderCircle className="size-4 animate-spin" />
            Loading session details...
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">{error.message}</p>
        ) : (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">User</dt>
              <dd>{data?.user.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{data?.user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-mono text-xs break-all">{data?.user.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Session Expires</dt>
              <dd>{data ? new Date(data.session.expiresAt).toLocaleString() : "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Password Status</dt>
              <dd>{data?.user.passwordNeedsReset ? "Reset required" : "OK"}</dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
