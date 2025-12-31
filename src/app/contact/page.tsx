import { Separator } from "@/components/ui/separator";

export default async function Contact() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Contact</h1>
      <h2 className="text-xl font-bold">Email</h2>
      <p>
        <a href="mailto:goldrushrobotics@charlotte.edu">
          goldrushrobotics@charlotte.edu
        </a>
      </p>
      <p>
        President: Tyler Eisenbraun,{" "}
        <a href="mailto:teisenbr@charlotte.edu">teisenbr@charlotte.edu</a>
      </p>
      <p>
        Vice President: Sylvester Pudelko,{" "}
        <a href="mailto:spudelko@charlotte.edu">spudelko@charlotte.edu</a>
      </p>
      <p>
        Treasurer: Justin Chen,{" "}
        <a href="mailto:jchen89@charlotte.edu">jchen89@charlotte.edu</a>
      </p>
      <p>
        Outreach Manager: Gabrielle Jones,{" "}
        <a href="mailto:gjones97@charlotte.edu">gjones97@charlotte.edu</a>
      </p>
      <Separator />
      <p>...add IG + ninerengage</p>
    </div>
  );
}
