import PageHeadingSkeleton from "@/app/_components/skeletons/PageHeadingSkeleton";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const BlocksLoading = () => (
  <main>
    <PageHeadingSkeleton withAction />
    <section className="px-5 flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-7 w-7 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </section>
  </main>
);

export default BlocksLoading;
