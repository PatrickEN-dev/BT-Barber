import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-4 flex flex-col gap-2.5">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-2.5 w-12" />
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-3 w-14" />
    </CardContent>
  </Card>
);

export default StatCardSkeleton;
