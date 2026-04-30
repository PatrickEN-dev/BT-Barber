import PageHeadingSkeleton from "@/app/_components/skeletons/PageHeadingSkeleton";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const BookingsLoading = () => (
  <main>
    <PageHeadingSkeleton />
    <div className="px-5 flex gap-2 pb-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>
    <div className="px-5 mt-3">
      <Skeleton className="h-9 w-full" />
    </div>
    <section className="px-5 mt-4 flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 flex flex-col gap-1.5">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-secondary pt-2">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
            </div>
            <Skeleton className="h-3 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </section>
  </main>
);

export default BookingsLoading;
