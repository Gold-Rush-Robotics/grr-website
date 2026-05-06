import { getServerSession } from "@/server/auth";
import { Typography } from "../_components/typography";
import { Container } from "../_components/container";
import { SignInCard } from "./_components/sign-in-card";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession();
  if (!session) {
    return (
      <Container className="space-y-6">
        <Typography variant="h1">Admin Sign In</Typography>
        <SignInCard />
      </Container>
    );
  }

  return <>{children}</>;
}
