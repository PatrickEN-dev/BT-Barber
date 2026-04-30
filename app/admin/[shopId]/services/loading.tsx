import PageHeadingSkeleton from "@/app/_components/skeletons/PageHeadingSkeleton";
import ServiceRowSkeleton from "@/app/_components/skeletons/ServiceRowSkeleton";

const ServicesLoading = () => (
  <main>
    <PageHeadingSkeleton withAction />
    <section className="px-5 flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <ServiceRowSkeleton key={i} />
      ))}
    </section>
  </main>
);

export default ServicesLoading;
