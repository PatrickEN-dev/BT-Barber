import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const BarbershopDetailsLoading = () => (
  <div>
    <section>
      <Skeleton className="h-[250px] w-full rounded-none" />
      <div className="px-5 pt-3 pb-6 border-b border-secondary flex flex-col gap-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </section>

    <section className="px-5 py-6 flex flex-col gap-3">
      <Skeleton className="h-3 w-32" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="h-8 w-20 shrink-0" />
          </CardContent>
        </Card>
      ))}
    </section>
  </div>
);

export default BarbershopDetailsLoading;
