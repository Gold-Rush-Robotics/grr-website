"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  return (
    <nav className="bg-background border-border border-b">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between p-4">
        <Link href="/">
          <img
            src="/logo/PNG/Logo_HorizontalMainWhiteText.png"
            alt="Logo"
            width={100}
            height={100}
          />
        </Link>
        <NavLinks />
      </div>
    </nav>
  );
}

function NavLinks() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/donate", label: "Donate" },
    { href: "/history", label: "History" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  isActive && "bg-accent text-accent-foreground",
                )}
              >
                <Link href={link.href}>{link.label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
