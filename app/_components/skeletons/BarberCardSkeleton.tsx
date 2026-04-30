import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const BarberCardSkeleton = () => (
  <Card>
    <CardContent className="p-3 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 flex flex-col gap-1.5">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-secondary pt-2">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2.5 w-10" />
          <Skeleton className="h-4 w-6" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2.5 w-10" />
          <Skeleton className="h-4 w-6" />
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default BarberCardSkeleton;
