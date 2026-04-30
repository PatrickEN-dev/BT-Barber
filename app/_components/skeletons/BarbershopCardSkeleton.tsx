import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const BarbershopCardSkeleton = () => (
  <Card className="min-w-[167px] max-w-[167px] rounded-2xl pb-3">
    <CardContent className="px-1 py-0">
      <Skeleton className="h-[159px] w-full rounded-2xl" />
      <div className="px-2 pt-2 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </CardContent>
  </Card>
);

export default BarbershopCardSkeleton;
