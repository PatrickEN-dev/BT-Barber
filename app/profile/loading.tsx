import HeaderSkeleton from "@/app/_components/skeletons/HeaderSkeleton";
import BookingCardSkeleton from "@/app/_components/skeletons/BookingCardSkeleton";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const ProfileLoading = () => (
  <main className="pb-12">
    <HeaderSkeleton />

    <section className="px-5 pt-6 flex flex-col items-center gap-2">
      <Skeleton className="h-24 w-24 rounded-full" />
      <Skeleton className="h-5 w-2/5 mt-2" />
      <Skeleton className="h-3 w-1/3" />
    </section>

    <section className="px-5 mt-8 flex flex-col gap-3">
      <Skeleton className="h-3 w-44" />
      {Array.from({ length: 2 }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </section>

    <section className="px-5 mt-10">
      <Skeleton className="h-3 w-16 mb-3" />
      <Card>
        <CardContent className="p-4 flex flex-col gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <Skeleton className="h-10 w-full mt-4" />
    </section>
  </main>
);

export default ProfileLoading;
