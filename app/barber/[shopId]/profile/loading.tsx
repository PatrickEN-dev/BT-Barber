import PageHeadingSkeleton from "@/app/_components/skeletons/PageHeadingSkeleton";
import { Skeleton } from "@/app/_components/ui/skeleton";

const ProfileLoading = () => (
  <main>
    <PageHeadingSkeleton />
    <section className="px-5 flex flex-col gap-4">
      <Skeleton className="h-3 w-32" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full mt-2" />
    </section>
  </main>
);

export default ProfileLoading;
