import { Skeleton } from "@/app/_components/ui/skeleton";

const PageHeadingSkeleton = ({ withAction = false }: { withAction?: boolean }) => (
  <header className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
    <div className="flex flex-col gap-2 min-w-0 flex-1">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-3 w-20" />
    </div>
    {withAction && <Skeleton className="h-9 w-20" />}
  </header>
);

export default PageHeadingSkeleton;
