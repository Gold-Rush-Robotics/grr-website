"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [transparency, setTransparency] = useState(0.3);
  const [blurAmount, setBlurAmount] = useState(0.1);

  const blurRoutes = ["/"];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      const alpha = Math.max(0.1, Math.min(1, scrollY / 500));
      setTransparency(alpha);
      const blurIntensity = Math.max(0.3, Math.min(1, scrollY / 200));
      setBlurAmount(blurIntensity * 8); // 0 to 8px blur (backdrop-blur-sm is ~4px, we'll go up to 8px for subtlety)
    };

    // Set initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Background opacity: starts at 0.05 (95% transparent), goes to 1 (opaque)
  const bgOpacity = blurRoutes.includes(usePathname())
    ? 0.05 + transparency * 0.5
    : 0.5;

  return (
    <nav
      className="border-border fixed top-0 right-0 left-0 z-50 border-b"
      style={{
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
      }}
    >
      <div
        className="bg-background absolute inset-0 -z-10"
        style={{ opacity: bgOpacity }}
      />
      <div className="relative mx-auto flex w-full items-center justify-between p-4">
        <Link href="/">
          <Image
            src="/logo/png/49er-robotics/49er Robotics (Color White).png"
            alt="49er Robotics Logo"
            width={100}
            height={100}
            className="drop-shadow-[-10px_4px_15px_rgba(0,0,0,1)]" // Drop shadow to make the logo more readable over hero background
          />
        </Link>
        <NavLinks bgOpacity={bgOpacity} />
      </div>
    </nav>
  );
}

function NavLinks({ bgOpacity }: { bgOpacity: number }) {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/donate", label: "Donate" },
    { href: "/history", label: "History" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

  const opacityBasedStyle =
    bgOpacity < 0.4
      ? clsx("border-accent-foreground/14 backdrop-blur-sm")
      : clsx("border-transparent");

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
                  "hover:bg-accent-foreground/14 active:bg-accent-foreground/14 focus:bg-accent-foreground/14 border bg-clip-padding px-4 transition-[border] duration-300 ease-linear text-shadow-lg/30",
                  opacityBasedStyle,
                  isActive &&
                    "bg-accent-foreground/14 border-accent-foreground/14",
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
