import { Container } from "@/app/_components/container";
import { Typography } from "@/app/_components/typography";
import { OfficerCard } from "./_components/officer-card";

export default function OfficersAdminPage() {
  return (
    <Container className="space-y-6">
      <Typography variant="h1">Manage Officers</Typography>
      <OfficerCard />
    </Container>
  );
}
