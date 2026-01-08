import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "content-container mx-auto mt-8 w-full max-w-7xl px-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
