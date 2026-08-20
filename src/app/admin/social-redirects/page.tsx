import { Container } from "@/app/_components/container";
import { Typography } from "@/app/_components/typography";
import { SocialRedirectCard } from "./_components/social-redirect-card";

export default function SocialRedirectsPage() {
  return (
    <Container className="space-y-6">
      <Typography variant="h1">Social Redirects</Typography>
      <SocialRedirectCard />
    </Container>
  );
}
