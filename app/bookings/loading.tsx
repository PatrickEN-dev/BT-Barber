import HeaderSkeleton from "@/app/_components/skeletons/HeaderSkeleton";
import BookingCardSkeleton from "@/app/_components/skeletons/BookingCardSkeleton";
import { Skeleton } from "@/app/_components/ui/skeleton";

const BookingsLoading = () => (
  <>
    <HeaderSkeleton />
    <section className="px-5 py-6 flex flex-col gap-4">
      <Skeleton className="h-6 w-40 mb-2" />
      <Skeleton className="h-3 w-24" />
      {Array.from({ length: 3 }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </section>
  </>
);

export default BookingsLoading;
