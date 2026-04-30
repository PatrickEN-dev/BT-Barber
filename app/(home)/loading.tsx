import HeaderSkeleton from "@/app/_components/skeletons/HeaderSkeleton";
import BarbershopCardSkeleton from "@/app/_components/skeletons/BarbershopCardSkeleton";
import { Skeleton } from "@/app/_components/ui/skeleton";

const HomeLoading = () => (
  <main>
    <HeaderSkeleton />

    <section className="px-5 pt-5 flex flex-col gap-2">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
    </section>

    <section className="px-5 mt-6">
      <Skeleton className="h-10 w-full" />
    </section>

    <section className="mt-6 px-2 pb-3">
      <Skeleton className="h-3 w-24 mx-5 mb-3" />
      <ul className="flex px-5 gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i}>
            <BarbershopCardSkeleton />
          </li>
        ))}
      </ul>
    </section>

    <section className="mt-6 px-2">
      <Skeleton className="h-3 w-20 mx-5 mb-3" />
      <ul className="flex px-5 gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i}>
            <BarbershopCardSkeleton />
          </li>
        ))}
      </ul>
    </section>
  </main>
);

export default HomeLoading;
