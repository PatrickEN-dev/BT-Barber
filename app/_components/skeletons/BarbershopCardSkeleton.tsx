import { Skeleton } from "@/app/_components/ui/skeleton";

const BarbershopCardSkeleton = () => (
  <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card">
    <Skeleton className="aspect-[3/4] w-full rounded-none" />
    <div className="flex flex-1 flex-col gap-3 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="mt-auto h-9 w-full" />
    </div>
  </div>
);

export default BarbershopCardSkeleton;
