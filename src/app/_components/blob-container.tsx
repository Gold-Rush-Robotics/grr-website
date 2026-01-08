import { cn } from "@/lib/utils";
import React from "react";

interface BlobContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  containerClassName?: React.ComponentProps<"div">["className"];
}

export default function BlobContainer({
  children,
  className,
  containerClassName,
}: BlobContainerProps) {
  return (
    // The wrapper itself stays in the flow
    <section
      className={cn(
        "relative -my-16 w-full py-16", // this is slightly cursed but it makes the blobs bleed into the other content
        containerClassName,
      )}
    >
      {/* LAYER 1: The Blobs (The "Bleed" Layer) */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
          // This mask ensures the blobs don't have hard edges at the section boundaries
          "mask-[linear-gradient(to_bottom,transparent,var(--background)_20%,var(--background)_80%,transparent)]",
        )}
      >
        <div className="absolute -top-[10%] -left-[10%] h-96 w-96 rounded-full bg-purple-600 opacity-40 mix-blend-screen blur-[80px] filter" />
        <div className="absolute top-[10%] -right-[10%] h-80 w-80 rounded-full bg-cyan-600 opacity-40 mix-blend-screen blur-[80px] filter" />
        <div className="absolute -bottom-[20%] left-[20%] h-80 w-80 rounded-full bg-pink-600 opacity-40 mix-blend-screen blur-[80px] filter" />
        <div className="absolute -right-[10%] -bottom-[10%] h-96 w-96 rounded-full bg-blue-600 opacity-40 mix-blend-screen blur-[80px] filter" />
      </div>

      {/* LAYER 2: The Content (Always clickable) */}
      <div className={cn("relative z-0", className)}>{children}</div>
    </section>
  );
}
