"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Profile } from "@/app/admin/_components/profile";
import { MenuAlt } from "./menu-alt";
import { Typography } from "./typography";

type NavLink = {
  href: string;
  label: string;
};

type NavConfig = {
  links: NavLink[];
  actions?: ReactNode;
};

/**
 * Navigation config for the navbar.
 * The key is the root path it will try to match. If no match is found, the
 * default config will be used. Actions, when provided, render to the right of
 * the links on desktop and at the bottom of the mobile menu.
 */
const NAV_LINKS = {
  "/admin": {
    links: [
      { href: "/admin", label: "Admin Home" },
      { href: "/admin/photos", label: "Photos" },
      { href: "/admin/officers", label: "Officers" },
      { href: "/admin/social-redirects", label: "Social Redirects" },
    ],
    actions: <Profile />,
  },
  default: {
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/donate", label: "Donate" },
      { href: "/history", label: "History" },
      { href: "/gallery", label: "Gallery" },
      { href: "/contact", label: "Contact" },
    ],
  },
} satisfies Record<string, NavConfig>;

/**
 * Get the navigation config for the given pathname.
 * The key is the root path it will try to match. If no match is found, the
 * default config will be used.
 *
 * Config defined in NAV_LINKS.
 */
function getNavConfig(pathname: string): NavConfig {
  for (const [rootPath, config] of Object.entries(NAV_LINKS)) {
    if (rootPath === "default") continue;
    if (pathname.startsWith(rootPath)) {
      return config;
    }
  }

  return NAV_LINKS.default;
}

export default function Navbar() {
  const [transparency, setTransparency] = useState(0.3);
  const [blurAmount, setBlurAmount] = useState(0.1);

  /**
   * Routes that have a hero background at the top of the page.
   * Routes in this list will get a different navbar style that
   * makes the hero content pop out more.
   */
  const heroRoutes = ["/", "/donate"];

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
  const bgOpacity = heroRoutes.includes(usePathname())
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
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <NavLinks bgOpacity={bgOpacity} />
        </div>
        {/* Mobile Hamburger Menu */}
        <div className="flex md:hidden">
          <MobileNavMenu bgOpacity={bgOpacity} blurAmount={blurAmount} />
        </div>
      </div>
    </nav>
  );
}

function NavLinks({ bgOpacity }: { bgOpacity: number }) {
  const pathname = usePathname();
  const { links, actions } = getNavConfig(pathname);

  const opacityBasedStyle =
    bgOpacity < 0.4
      ? clsx("border-accent-foreground/14 backdrop-blur-sm")
      : clsx("border-transparent");

  return (
    <div className="flex items-center gap-2">
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
      {actions}
    </div>
  );
}

function MobileNavMenu({
  bgOpacity,
  blurAmount,
}: {
  bgOpacity: number;
  blurAmount: number;
}) {
  const pathname = usePathname();
  const { links, actions } = getNavConfig(pathname);

  const opacityBasedStyle =
    bgOpacity < 0.4
      ? clsx("border-accent-foreground/14 backdrop-blur-sm")
      : clsx("border-transparent");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "hover:bg-accent-foreground/14 dark:hover:bg-accent-foreground/14 active:bg-accent-foreground/14 focus-visible:bg-accent-foreground/14 border bg-clip-padding px-4 transition-[border] duration-300 ease-linear text-shadow-lg/30",
            opacityBasedStyle,
          )}
          aria-label="Open menu"
        >
          Menu <MenuAlt className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-background/35 supports-backdrop-filter:bg-background/35 w-80 border-l p-0 backdrop-blur-xl"
        showCloseButton={false}
        style={{
          backdropFilter: `blur(${Math.max(11, blurAmount)}px)`,
          WebkitBackdropFilter: `blur(${Math.max(12, blurAmount)}px)`,
        }}
      >
        <div className="flex h-full flex-col">
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <SheetTitle asChild>
                <Typography variant="h4" as="h2" className="mt-0">
                  Menu
                </Typography>
              </SheetTitle>
              <SheetClose asChild>
                <button
                  className="hover:bg-accent rounded-md p-1.5 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </button>
              </SheetClose>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "hover:bg-accent-foreground/14 active:bg-accent-foreground/14 focus:bg-accent-foreground/14 border border-transparent bg-clip-padding px-4 py-2 transition-[border,background-color] text-shadow-lg/30",
                        isActive &&
                          "bg-accent-foreground/14 border-accent-foreground/14",
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
          </nav>
          {actions ? (
            <SheetFooter className="border-t">{actions}</SheetFooter>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
