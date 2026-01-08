import "@/styles/globals.css";
import "@fontsource/cascadia-code";

import { type Metadata } from "next";
import { Nunito_Sans, Outfit, Space_Grotesk } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";
import Navbar from "./_components/navbar";
import { Typography } from "./_components/typography";

export const metadata: Metadata = {
  title: "Gold Rush Robotics",
  description: "Gold Rush Robotics", // TODO: Add description
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-outfit-bold",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} ${outfit.variable} ${spaceGrotesk.variable} dark h-full min-h-screen`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="flex h-full flex-col">
        <Navbar />
        <main className="mb-16 w-full pt-18">
          <TRPCReactProvider>
            <Toaster position="top-center" theme="dark" />
            {children}
          </TRPCReactProvider>
        </main>
        <footer className="bg-card/10 border-border mt-auto w-full border-t px-4 py-6 text-center text-sm">
          <Typography variant="muted">
            &copy; {new Date().getFullYear()} 49er Robotics. All rights
            reserved.
          </Typography>
        </footer>
      </body>
    </html>
  );
}
