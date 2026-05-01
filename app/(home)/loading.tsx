import HeaderSkeleton from "@/app/_components/skeletons/HeaderSkeleton";
import BarbershopCardSkeleton from "@/app/_components/skeletons/BarbershopCardSkeleton";
import Container from "@/app/_components/Container";
import { Skeleton } from "@/app/_components/ui/skeleton";

const MobileSkeleton = () => (
  <div className="pb-24 lg:hidden">
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
  </div>
);

const DesktopSkeleton = () => (
  <div className="hidden pb-24 lg:block">
    <section className="border-b border-border bg-gradient-to-b from-card to-background">
      <Container className="py-12 xl:py-16">
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-[480px]" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-11 w-[420px] rounded-xl" />
        </div>
      </Container>
    </section>

    <Container className="mt-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px] xl:gap-12">
        <div className="flex flex-col gap-12">
          <div>
            <Skeleton className="mb-5 h-3 w-28" />
            <ul className="grid grid-cols-3 gap-5 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i}>
                  <BarbershopCardSkeleton />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Skeleton className="mb-5 h-3 w-24" />
            <ul className="grid grid-cols-3 gap-5 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i}>
                  <BarbershopCardSkeleton />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <aside className="hidden lg:block">
          <Skeleton className="mb-4 h-3 w-40" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </aside>
      </div>
    </Container>
  </div>
);

const HomeLoading = () => (
  <main>
    <HeaderSkeleton />
    <MobileSkeleton />
    <DesktopSkeleton />
  </main>
);

export default HomeLoading;
