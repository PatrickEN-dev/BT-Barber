import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const BookingCardSkeleton = () => (
  <Card className="min-w-full">
    <CardContent className="py-0 flex px-0">
      <div className="flex flex-col gap-2 py-5 flex-[3] pl-5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-3/5" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 border-l border-secondary py-5 gap-1.5">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-7 w-10" />
        <Skeleton className="h-3 w-10" />
      </div>
    </CardContent>
  </Card>
);

export default BookingCardSkeleton;
