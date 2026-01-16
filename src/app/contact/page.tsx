import { Typography } from "@/app/_components/typography";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import BlobContainer from "../_components/blob-container";
import { ContactForm } from "../_components/contact-form";
import { Container } from "../_components/container";
import { Link } from "../_components/link";
import ContactCard from "./_components/contact-card";
import { EmailDisplay } from "./_components/email-display";

export default async function Contact() {
  return (
    <>
      <BlobContainer>
        <Container>
          <div className="grid grid-cols-1 gap-12 pb-12 lg:grid-cols-2">
            <div className="flex h-full flex-col justify-center">
              <Typography variant="h1">Contact Us</Typography>
              {/* Hidden on mobile, shown on desktop */}
              <Typography
                variant="h6"
                className="text-muted-foreground hidden max-w-lg font-mono text-xl leading-relaxed font-bold lg:block"
              >
                Fill out the form to the right to contact us. Alternatively, you
                can email us directly at the addresses listed below.
              </Typography>
              {/* Hidden on desktop, shown on mobile */}
              <Typography
                variant="h6"
                className="text-muted-foreground block max-w-lg font-mono text-xl leading-relaxed font-bold lg:hidden"
              >
                Fill out the form below to contact us. Alternatively, you can
                email us directly at the addresses listed below.
              </Typography>
            </div>
            <ContactForm />
          </div>
        </Container>
      </BlobContainer>

      <Container className="space-y-6">
        <Typography variant="h2">Emails</Typography>
        <EmailDisplay email="goldrushrobotics@charlotte.edu" className="mt-8" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <ContactCard
            name="Tyler Eisenbraun"
            pfpPath="/people/tyler-eisenbraun.jpg"
            title="President"
            email="teisenbr@charlotte.edu"
          />
          <ContactCard
            name="Sylvester Pudelko"
            pfpPath="/people/sylvester-pudelko.jpg"
            title="Vice President"
            email="spudelko@charlotte.edu"
          />
          <ContactCard
            name="Justin Chen"
            pfpPath="/people/justin-chen.jpg"
            title="Treasurer"
            email="jchen89@charlotte.edu"
          />
          <ContactCard
            name="Gabrielle Jones"
            title="Outreach Manager"
            email="gjones97@charlotte.edu"
          />
        </div>
        <Separator />
        <Typography variant="h2">Socials</Typography>
        <div className="flex flex-row gap-4">
          <Link href="https://www.instagram.com/gold_rush_robotics/" noArrow>
            <Image
              src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/instagram.svg"
              alt="Instagram Logo"
              width={60}
              height={60}
            />
          </Link>
          <Link
            href="https://ninerengage.charlotte.edu/organization/goldrushrobotics"
            noArrow
          >
            <Image
              src="/logo/png/niner-engage.png"
              alt="Niner Engage Logo"
              width={60}
              height={60}
            />
          </Link>
        </div>
      </Container>
    </>
  );
}
