import { Link } from "@/app/_components/link";
import { Typography } from "@/app/_components/typography";
import { Separator } from "@/components/ui/separator";
import { Container } from "../_components/container";

export default async function Contact() {
  return (
    <Container className="space-y-6">
      <Typography variant="h1">Contact</Typography>
      <Typography variant="h2">Email</Typography>
      <Typography variant="p">
        <Link href="mailto:goldrushrobotics@charlotte.edu">
          goldrushrobotics@charlotte.edu
        </Link>
      </Typography>
      <Typography variant="p">
        President: Tyler Eisenbraun,{" "}
        <Link href="mailto:teisenbr@charlotte.edu">teisenbr@charlotte.edu</Link>
      </Typography>
      <Typography variant="p">
        Vice President: Sylvester Pudelko,{" "}
        <Link href="mailto:spudelko@charlotte.edu">spudelko@charlotte.edu</Link>
      </Typography>
      <Typography variant="p">
        Treasurer: Justin Chen,{" "}
        <Link href="mailto:jchen89@charlotte.edu">jchen89@charlotte.edu</Link>
      </Typography>
      <Typography variant="p">
        Outreach Manager: Gabrielle Jones,{" "}
        <Link href="mailto:gjones97@charlotte.edu">gjones97@charlotte.edu</Link>
      </Typography>
      <Separator />
      <Typography variant="p">...add IG + ninerengage</Typography>
    </Container>
  );
}
