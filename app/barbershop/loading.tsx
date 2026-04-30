import HeaderSkeleton from "@/app/_components/skeletons/HeaderSkeleton";
import BarbershopCardSkeleton from "@/app/_components/skeletons/BarbershopCardSkeleton";
import { Skeleton } from "@/app/_components/ui/skeleton";

const BarbershopSearchLoading = () => (
  <>
    <HeaderSkeleton />
    <section className="px-5 py-6 flex flex-col gap-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-3 w-40" />
      <ul className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="w-full">
            <BarbershopCardSkeleton />
          </li>
        ))}
      </ul>
    </section>
  </>
);

export default BarbershopSearchLoading;
