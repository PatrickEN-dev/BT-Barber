import { Skeleton } from "@/app/_components/ui/skeleton";

const HeaderSkeleton = () => (
  <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
    </div>
  </header>
);

export default HeaderSkeleton;
