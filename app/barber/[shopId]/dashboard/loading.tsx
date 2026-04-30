import StatCardSkeleton from "@/app/_components/skeletons/StatCardSkeleton";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const DashboardLoading = () => (
  <main>
    <section className="px-5 pt-5 pb-4 flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </section>

    <section className="px-5 grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </section>

    <section className="px-5 mt-7 flex flex-col gap-2">
      <Skeleton className="h-4 w-32" />
      <Card>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-3/4" />
        </CardContent>
      </Card>
    </section>

    <section className="px-5 mt-7 flex flex-col gap-2">
      <Skeleton className="h-4 w-28" />
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-3 flex items-baseline justify-between border-b border-secondary/50">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
          <ul className="divide-y divide-secondary/40">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="px-4 py-2.5 flex items-center gap-3">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-2/5" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  </main>
);

export default DashboardLoading;
