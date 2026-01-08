import { Link } from "@/app/_components/link";
import { Typography } from "@/app/_components/typography";
import { Separator } from "@/components/ui/separator";
import { Container } from "../_components/container";
import SponsorLogo from "../_components/sponsor-logo";

export default function Donate() {
  return (
    <Container className="space-y-6">
      <Typography variant="h1">Donate</Typography>
      <Typography variant="p">
        There are many ways to support our club—from becoming a sponsor to
        making a one-time donation.
      </Typography>
      <Separator />
      <Typography variant="h2">Amazon Affiliate Program</Typography>
      <Typography variant="p">
        As an Amazon Associate, we can receive a small commission from Amazon at
        no additional cost to you when you use our Amazon affiliate link and
        then make a normal purchase on Amazon. This can be an easy way to
        support our club without making any direct donations or purchases.
      </Typography>
      <Typography variant="p">
        Access Amazon through{" "}
        <Link href="https://amzn.to/4140ZTV">this link</Link> to support us.
      </Typography>
      <Typography variant="h2">Donate or Sponsor Us</Typography>
      <Typography variant="p">
        As a student branch of a nonprofit 501(c)(3) IEEE, we can accept
        tax-deductible donations from individuals and organizations who are
        passionate about supporting our mission.
      </Typography>
      <Typography variant="p">
        IEEE Employee Identification Number (EIN): 13-1656633 <br />
        <Link href="https://www.ieee.org/content/dam/ieee-org/ieee/web/org/voluntr/tax-management/ieee-irs-tax-exempt-letter-05-24-2019.pdf">
          IEEE IRS 501(c)(3) Information
        </Link>
        <br />
        {/* TODO: Find updated link */}
        <Link>IEEE IRS W9</Link>
      </Typography>
      <Separator />
      <Typography variant="h2">
        We&apos;d like to thank our sponsors!
      </Typography>
      <Typography variant="p">Onshape, North Carolina Space Grant</Typography>{" "}
      <div className="mt-4 flex flex-row gap-12 [&_img]:h-60 [&_img]:w-auto">
        <SponsorLogo
          src="/logo/svg/onshape/light.svg"
          darkSrc="/logo/svg/onshape/dark.svg"
          name="Onshape"
          href="https://onshape.com"
        />
        <SponsorLogo
          src="/logo/png/ncspacegrant/logo.png"
          name="NC Space Grant"
          href="https://ncspacegrant.ncsu.edu/"
        />
      </div>
    </Container>
  );
}
