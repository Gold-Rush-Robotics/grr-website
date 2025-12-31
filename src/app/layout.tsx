import "@/styles/globals.css";

import { type Metadata } from "next";
import { Nunito_Sans, Outfit } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import Navbar from "./_components/navbar";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} ${outfit.variable} dark`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <TRPCReactProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-7xl p-4">{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
