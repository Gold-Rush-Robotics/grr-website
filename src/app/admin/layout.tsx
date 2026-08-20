import { getServerSession } from "@/server/auth";
import { Container } from "../_components/container";
import { SignInCard } from "./_components/sign-in-card";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession();
  if (!session) {
    return (
      <Container className="mt-[20vh] max-w-lg items-center justify-center">
        <SignInCard />
      </Container>
    );
  }

  return <>{children}</>;
}
