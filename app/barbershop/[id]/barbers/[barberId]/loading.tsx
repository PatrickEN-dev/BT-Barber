import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const BarberProfileLoading = () => (
  <main className="pb-24">
    <div className="px-5 py-4">
      <Skeleton className="h-4 w-16" />
    </div>

    <section className="px-5 flex flex-col items-center text-center gap-3">
      <Skeleton className="h-28 w-28 rounded-full" />
      <Skeleton className="h-5 w-2/5" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-3 w-3/4 mt-2" />
    </section>

    <section className="px-5 mt-8 flex flex-col gap-2">
      <Skeleton className="h-3 w-24 mb-1" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </section>

    <div className="fixed bottom-0 inset-x-0 bg-background border-t border-secondary px-5 py-4">
      <Skeleton className="h-10 w-full" />
    </div>
  </main>
);

export default BarberProfileLoading;
