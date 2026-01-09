import { cn } from "@/lib/utils";

interface HeroProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  backgroundUrl: string;
}
export default function Hero({
  className,
  children,
  backgroundUrl,
}: HeroProps) {
  return (
    <div
      className={cn(
        "border-border -mt-18 flex min-h-148 items-center justify-center border-b bg-cover bg-center bg-no-repeat px-4",
        className,
      )}
      style={{ backgroundImage: `url('${backgroundUrl}')` }} // tailwind can't resolve this dynamically
    >
      {children}
    </div>
  );
}
