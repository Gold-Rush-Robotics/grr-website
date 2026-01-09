import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { Link } from "./link";
import { Typography } from "./typography";

interface SponsorLogoProps {
  src: string;
  darkSrc?: string | undefined;
  name: string;
  href: string;
}
export default function SponsorLogo({
  src,
  darkSrc,
  name,
  href,
}: SponsorLogoProps) {
  return (
    <Link
      href={href}
      noArrow
      className="flex w-full flex-none items-center justify-center md:w-[calc(50%-20px)] xl:w-[calc(33.333%-27px)]"
    >
      <Tooltip>
        <TooltipTrigger>
          <Image
            src={src}
            alt={`${name} Logo`}
            className="h-60 w-auto dark:hidden"
            width={400}
            height={240}
          />
          <Image
            src={darkSrc ?? src}
            alt={`${name} Logo`}
            className="hidden h-60 w-auto dark:block"
            width={400}
            height={240}
          />
        </TooltipTrigger>
        <TooltipContent>
          <Typography variant="h6">
            {name} ·{" "}
            <Link href={href} className="text-background">
              {href}
            </Link>
          </Typography>
        </TooltipContent>
      </Tooltip>
    </Link>
  );
}
