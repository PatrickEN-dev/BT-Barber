import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const ClientRowSkeleton = () => (
  <Card>
    <CardContent className="p-3 flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <Skeleton className="h-5 w-6" />
        <Skeleton className="h-3 w-14" />
      </div>
    </CardContent>
  </Card>
);

export default ClientRowSkeleton;
