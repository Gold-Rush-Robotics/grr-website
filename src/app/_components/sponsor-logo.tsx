import Image from "next/image";
import Link from "next/link";

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
    <Link href={href}>
      <div>
        <Image
          src={src}
          alt={`${name} Logo`}
          className="dark:hidden"
          width={100}
          height={100}
        />
        <Image
          src={darkSrc ?? src}
          alt={`${name} Logo`}
          className="hidden dark:block"
          width={100}
          height={100}
        />
      </div>
    </Link>
  );
}
