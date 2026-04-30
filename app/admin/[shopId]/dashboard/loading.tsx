import StatCardSkeleton from "@/app/_components/skeletons/StatCardSkeleton";
import ChartCardSkeleton from "@/app/_components/skeletons/ChartCardSkeleton";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const DashboardLoading = () => (
  <main>
    <section className="px-5 pt-5 pb-4 flex items-center gap-3">
      <Skeleton className="h-11 w-11 rounded-full" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-36" />
      </div>
    </section>

    <section className="px-5 grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </section>

    <section className="px-5 mt-7 flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      <ChartCardSkeleton height={160} />
    </section>

    <section className="px-5 mt-7 flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-12" />
      </div>
      <ChartCardSkeleton height={140} />
    </section>

    <section className="px-5 mt-7 grid grid-cols-2 gap-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
    </section>

    <section className="px-5 mt-7 flex flex-col gap-2">
      <Skeleton className="h-4 w-44 mb-1" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-3 w-16 shrink-0" />
          </CardContent>
        </Card>
      ))}
    </section>
  </main>
);

export default DashboardLoading;
