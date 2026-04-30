import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const AdminLoading = () => (
  <main className="px-5 py-8 max-w-md mx-auto pb-20 flex flex-col gap-3">
    <div className="flex flex-col gap-2 mb-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-56" />
    </div>
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-3 flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-md shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-4 shrink-0" />
        </CardContent>
      </Card>
    ))}
  </main>
);

export default AdminLoading;
