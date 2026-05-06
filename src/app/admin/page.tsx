import { Container } from "@/app/_components/container";
import { Typography } from "@/app/_components/typography";
import { getServerSession } from "@/server/auth";
import { AdminDashboardPanels } from "./_components/admin-dashboard-panels";
import { SignOutButton } from "./_components/sign-out-button";

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session) return;

  return (
    <Container className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Typography variant="h1">Admin</Typography>
          <Typography className="text-muted-foreground">
            Signed in as {session.user.email}
          </Typography>
        </div>
        <SignOutButton />
      </div>
      <AdminDashboardPanels />
    </Container>
  );
}
