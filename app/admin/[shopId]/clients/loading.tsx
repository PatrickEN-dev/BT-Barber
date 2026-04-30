import PageHeadingSkeleton from "@/app/_components/skeletons/PageHeadingSkeleton";
import ClientRowSkeleton from "@/app/_components/skeletons/ClientRowSkeleton";
import { Skeleton } from "@/app/_components/ui/skeleton";

const ClientsLoading = () => (
  <main>
    <PageHeadingSkeleton />
    <div className="px-5">
      <Skeleton className="h-10 w-full" />
    </div>
    <section className="px-5 mt-4 flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <ClientRowSkeleton key={i} />
      ))}
    </section>
  </main>
);

export default ClientsLoading;
