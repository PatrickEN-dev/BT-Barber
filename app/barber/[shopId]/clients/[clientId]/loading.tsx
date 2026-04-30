import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const ClientDetailLoading = () => (
  <main className="pb-12">
    <div className="px-5 py-4">
      <Skeleton className="h-4 w-16" />
    </div>

    <section className="px-5 flex flex-col items-center gap-2">
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="h-5 w-2/5 mt-2" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-3 w-2/5" />
    </section>

    <section className="px-5 mt-7 flex flex-col gap-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-20 w-full rounded-md" />
    </section>

    <section className="px-5 mt-7 flex flex-col gap-2">
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 flex items-center justify-between gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </section>
  </main>
);

export default ClientDetailLoading;
