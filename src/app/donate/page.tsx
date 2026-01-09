import { Link } from "@/app/_components/link";
import { Typography } from "@/app/_components/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart } from "lucide-react";
import { Container } from "../_components/container";
import Hero from "../_components/hero";
import { SponsorButton } from "../_components/sponsor-button";
import SponsorLogo from "../_components/sponsor-logo";

export default function Donate() {
  return (
    <>
      <Hero backgroundUrl="/backgrounds/tyler.png">
        <div className="flex flex-col items-center justify-center space-y-8 pt-2">
          <Heart className="h-16 w-16" />
          <Typography variant="h1">Support 49er Robotics</Typography>
          <Typography
            variant="h6"
            className="text-muted-foreground max-w-lg text-center font-mono text-xl leading-relaxed font-bold"
          >
            Your contributions help us compete, learn, and grow
          </Typography>
          {/* <div className="flex flex-row gap-4">
            <LinkButton href="#donate">Donate</LinkButton>
            <LinkButton href="#sponsor" variant="outline">
              Become a Sponsor
            </LinkButton>
          </div> */}
        </div>
      </Hero>
      <Container className="mt-20 space-y-4">
        <Typography variant="h2">Donate</Typography>
        <Typography variant="p">
          There are many ways to support our club—from becoming a sponsor to
          making a one-time donation.
        </Typography>
        <Separator />
        <Typography variant="h3" id="amazon-affiliate">
          Amazon Affiliate Program
        </Typography>
        <Typography variant="p">
          As an Amazon Associate, we can receive a small commission from Amazon
          at no additional cost to you when you use our Amazon affiliate link
          and then make a normal purchase on Amazon. This can be an easy way to
          support our club without making any direct donations or purchases.
        </Typography>
        <Typography variant="p">
          Access Amazon through{" "}
          <Link href="https://amzn.to/4140ZTV">this link</Link> to support us.
        </Typography>
        <Typography variant="h3" id="sponsor">
          Donate or Sponsor Us
        </Typography>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
          <Typography variant="p">
            As a student branch of a nonprofit 501(c)(3){" "}
            <Link href="https://www.ieee.org/">IEEE</Link>, we can accept
            tax-deductible donations from individuals and organizations who are
            passionate about supporting our mission.
          </Typography>
          <Typography variant="p" className="lg:place-self-center">
            IEEE Employee Identification Number (EIN): 13-1656633 <br />
            <Link href="https://www.ieee.org/content/dam/ieee-org/ieee/web/org/voluntr/tax-management/ieee-irs-tax-exempt-letter-05-24-2019.pdf">
              IEEE IRS 501(c)(3) Information
            </Link>
            <br />
            {/* TODO: Find updated link */}
            <Link>IEEE IRS W9</Link>
          </Typography>
        </div>
        <div className="flex flex-row gap-4">
          <SponsorButton action="form" actionType="sponsor" />
          <SponsorButton action="form" actionType="donate" />
        </div>
        <Separator />
        <Typography variant="h2" className="text-center" id="sponsors">
          We&apos;d like to thank our sponsors!
        </Typography>
        <Typography variant="p" className="text-center">
          Onshape, North Carolina Space Grant
        </Typography>{" "}
        <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-20">
          <SponsorLogo
            src="/logo/svg/onshape/light.svg"
            darkSrc="/logo/svg/onshape/dark.svg"
            name="Onshape"
            href="https://onshape.com/"
          />
          <SponsorLogo
            src="/logo/png/ncspacegrant/logo.png"
            name="NC Space Grant"
            href="https://ncspacegrant.ncsu.edu/"
          />
          <Card className="h-60 max-w-80">
            <CardHeader>
              <CardTitle>Sponsor Us!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Typography variant="p">
                If you are interested in becoming one of our sponsors, click the
                button below or{" "}
                <Link href="mailto:goldrushrobotics@charlotte.edu" noArrow>
                  contact us directly
                </Link>
                .
              </Typography>
              <SponsorButton />
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
