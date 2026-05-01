import { cn } from "@/app/_lib/utils";

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-md bg-secondary/70 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.07] before:to-transparent before:animate-shimmer",
      className
    )}
    {...props}
  />
);

export { Skeleton };
