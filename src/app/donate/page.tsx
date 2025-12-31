import { Separator } from "@/components/ui/separator";

export default function Donate() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Donate</h1>
      <p>
        There are many ways to support our club—from becoming a sponsor to
        making a one-time donation.
      </p>
      <Separator />
      <h2 className="text-xl font-bold">Amazon Affiliate Program</h2>
      <p>
        As an Amazon Associate, we can receive a small commission from Amazon at
        no additional cost to you when you use our Amazon affiliate link and
        then make a normal purchase on Amazon. This can be an easy way to
        support our club without making any direct donations or purchases.
      </p>
      <p>
        Access Amazon through{" "}
        <a
          href="https://amzn.to/4140ZTV"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          this link
        </a>{" "}
        to support us.
      </p>
      <h2 className="text-xl font-bold">Donate or Sponsor Us</h2>
      <p>
        As a student branch of a nonprofit 501(c)(3) IEEE, we can accept
        tax-deductible donations from individuals and organizations who are
        passionate about supporting our mission.
      </p>
      <p>
        IEEE Employee Identification Number (EIN): 13-1656633 <br />
        <a
          href="https://www.ieee.org/content/dam/ieee-org/ieee/web/org/voluntr/tax-management/ieee-irs-tax-exempt-letter-05-24-2019.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          IEEE IRS 501(c)(3) Information
        </a>
        <br />
        <a
          href="" // TODO: Find updated link
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          IEEE IRS W9
        </a>
      </p>
      <Separator />
      <h2 className="text-xl font-bold">We'd like to thank our sponsors!</h2>
      <p>Onshape, North Carolina Space Grant</p> {/* TODO: images */}
    </div>
  );
}
