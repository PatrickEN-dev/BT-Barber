import HeaderSkeleton from "@/app/_components/skeletons/HeaderSkeleton";
import BarbershopCardSkeleton from "@/app/_components/skeletons/BarbershopCardSkeleton";
import { Skeleton } from "@/app/_components/ui/skeleton";

const HomeLoading = () => (
  <main className="pb-24">
    <HeaderSkeleton />

    <section className="px-5 pt-6 flex flex-col gap-2">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
    </section>

    <section className="mt-6 px-5">
      <Skeleton className="h-11 w-full rounded-xl" />
    </section>

    <section className="mt-8 px-5">
      <Skeleton className="mb-4 h-3 w-24" />
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <BarbershopCardSkeleton />
          </li>
        ))}
      </ul>
    </section>

    <section className="mt-10 px-5">
      <Skeleton className="mb-4 h-3 w-20" />
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <BarbershopCardSkeleton />
          </li>
        ))}
      </ul>
    </section>
  </main>
);

export default HomeLoading;
