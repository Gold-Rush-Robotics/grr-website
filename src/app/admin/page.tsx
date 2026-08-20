import { Container } from "@/app/_components/container";
import { Typography } from "@/app/_components/typography";
import { getServerSession } from "@/server/auth";
import { ApprovedEmailCard } from "./_components/approved-email-card";

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session) return;

  return (
    <Container className="space-y-6">
      <Typography variant="h1">Admin Dashboard</Typography>
      <ApprovedEmailCard currentUserEmail={session.user.email} />
    </Container>
  );
}
