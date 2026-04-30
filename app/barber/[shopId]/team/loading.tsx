import PageHeadingSkeleton from "@/app/_components/skeletons/PageHeadingSkeleton";
import BarberCardSkeleton from "@/app/_components/skeletons/BarberCardSkeleton";

const TeamLoading = () => (
  <main>
    <PageHeadingSkeleton />
    <section className="px-5 flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <BarberCardSkeleton key={i} />
      ))}
    </section>
  </main>
);

export default TeamLoading;
