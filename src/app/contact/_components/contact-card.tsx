import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";
import Image from "next/image";
import { Link } from "../../_components/link";
import { Typography } from "../../_components/typography";

interface ContactCardProps extends React.HTMLAttributes<HTMLDivElement> {
  pfpPath?: string;
  name: string;
  title: string;
  email: string;
}

export default function ContactCard({
  pfpPath,
  name,
  title,
  email,
  className,
  ...props
}: ContactCardProps) {
  pfpPath ??= "/people/placeholder.png";
  return (
    <>
      <Card
        className={cn("bg-card/50", className, "hidden xl:block")}
        {...props}
      >
        <CardContent>
          <Image src={pfpPath} alt={name} width={100} height={100} />
          <Typography variant="h6">{name}</Typography>
          <Typography variant="muted">{title}</Typography>
        </CardContent>
        <CardFooter>
          <Link href={`mailto:${email}`} noArrow>
            <Mail className="mr-2 inline-block size-4" />
            {email}
          </Link>
        </CardFooter>
      </Card>
      <Card
        className={cn("bg-card/50", className, "block xl:hidden")}
        {...props}
      >
        <CardContent className="flex items-center gap-6">
          <Image src={pfpPath} alt={name} width={100} height={100} />
          <div className="flex flex-col gap-1">
            <Typography variant="h6">{name}</Typography>
            <Typography variant="muted">{title}</Typography>
            <Link href={`mailto:${email}`} noArrow>
              <Mail className="mr-2 inline-block size-4" />
              {email}
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
