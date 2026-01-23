import { Typography } from "@/app/_components/typography";
import { Card } from "@/components/ui/card";
import clsx from "clsx";
import { Brain, Calendar, MapPin, Trophy, Wrench } from "lucide-react";
import Image from "next/image";
import BlobContainer from "./_components/blob-container";
import { Container } from "./_components/container";
import Hero from "./_components/hero";
import { Link } from "./_components/link";
import { LinkButton } from "./_components/link-button";
import { SponsorButton } from "./_components/sponsor-button";

export default function Home() {
  return (
    <>
      <Hero backgroundUrl="/backgrounds/tyler.png">
        <div className="flex flex-col items-center justify-center space-y-8 pt-2">
          <Image
            src="/logo/png/49er-robotics/49er Robotics (Gold White).png"
            alt="49er Robotics Logo"
            width={600}
            height={100}
          />
          <Typography
            variant="h6"
            className="text-muted-foreground max-w-lg text-center font-mono text-xl leading-relaxed font-bold"
          >
            UNC Charlotte&apos;s Premier Robotics Club for students of all skill
            levels
          </Typography>
          <div className="flex flex-row gap-4">
            <LinkButton href="https://discord.gg/QzhdcbnSzd">
              Discord
            </LinkButton>
            <SponsorButton action="redirect" />
          </div>
        </div>
      </Hero>
      <BlobContainer
        className={clsx(
          "grid grid-cols-1 items-center justify-items-center gap-4 p-8 sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        <Card className="bg-accent-foreground/7 flex h-full w-full flex-col items-center justify-baseline px-6 text-center">
          <Wrench />
          <Typography variant="h3" className="mt-0!">
            Hands-on Experience
          </Typography>
          <Typography variant="muted" className="text-bold">
            Get real experience—whether it&apos;s making CAD models, designing PCBs,
            or programming.
          </Typography>
        </Card>
        <Card className="bg-accent-foreground/7 flex h-full w-full flex-col items-center justify-baseline px-6 text-center">
          <Trophy />
          <Typography variant="h3" className="mt-0!">
            Compete in Competitions
          </Typography>
          <Typography variant="muted" className="text-bold">
            We participate in various competitions, including IEEE SoutheastCon,
            Vex Robotics, and more.
          </Typography>
        </Card>
        <Card className="bg-accent-foreground/7 flex h-full w-full flex-col items-center justify-baseline px-6 text-center">
          <Brain />
          <Typography variant="h3" className="mt-0!">
            Beginner Friendly
          </Typography>
          <Typography variant="muted" className="text-bold">
            No experience needed—we host workshops throughout the semester, and
            our members are always happy to help out.
          </Typography>
        </Card>
        <Card className="bg-accent-foreground/7 flex h-full w-full flex-col items-center justify-baseline px-6 text-center">
          <Calendar />
          <Typography variant="h3" className="mt-0!">
            Meeting Times
          </Typography>
          <Typography variant="muted" className="text-bold">
            We meet every Tuesday and Thursday from 6:00 PM–8:00 PM in the Super
            Fab Lab.
          </Typography>
          <Link
            href="https://maps.app.goo.gl/VS7po9CE51VFgmLs7"
            className="flex flex-row items-center gap-2"
          >
            <MapPin size={16} />
            <Typography className="text-small m-0!">Super Fab Lab</Typography>
          </Link>
        </Card>
      </BlobContainer>
      <Container className="mt-4 space-y-4">
        <Typography variant="h1">Who We Are</Typography>
        <Typography>
          49er Robotics is a student-led club at UNC Charlotte for students of
          all skill levels who share a passion for robotics. We provide a
          collaborative space for students to learn, grow, and network, all
          while gaining valuable hands-on experience that will lead to future
          success in industry.
        </Typography>
        <Typography>
          In previous years, UNC Charlotte had a number of separate robotics
          clubs working on different projects and competitions. These
          subdivisions still exist, but now we have consolidated into one brand,
          49er Robotics, making it easier than ever to get involved in robotics
          on campus.
        </Typography>
        <Typography variant="h1">Our Mission</Typography>
        <Typography>
          Inspiring STEM education, fostering teamwork, by making access to
          robotics beginner-friendly and accessible.
        </Typography>
        <Typography variant="h1">What We Do</Typography>
        <Typography>
          In addition to building robots, Gold Rush Robotics focuses on
          fostering teamwork and skill development, hosting workshops for our
          broader community, and participating in various interclub and external
          competitions.
        </Typography>
      </Container>
    </>
  );
}
