import PageHeadingSkeleton from "@/app/_components/skeletons/PageHeadingSkeleton";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const ServicesLoading = () => (
  <main>
    <PageHeadingSkeleton />
    <section className="px-5 flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 flex gap-3 items-center">
            <Skeleton className="h-14 w-14 rounded-md shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full shrink-0" />
          </CardContent>
        </Card>
      ))}
    </section>
  </main>
);

export default ServicesLoading;
