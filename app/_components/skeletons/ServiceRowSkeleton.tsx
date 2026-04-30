import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const ServiceRowSkeleton = () => (
  <Card>
    <CardContent className="p-3 flex gap-3">
      <Skeleton className="h-16 w-16 rounded-md shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex items-center justify-between mt-auto pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ServiceRowSkeleton;
