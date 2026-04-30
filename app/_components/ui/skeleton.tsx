import { cn } from "@/app/_lib/utils";

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-pulse rounded-md bg-secondary/70", className)} {...props} />
);

export { Skeleton };
