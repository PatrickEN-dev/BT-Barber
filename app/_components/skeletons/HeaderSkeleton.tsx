import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

const HeaderSkeleton = () => (
  <header>
    <Card>
      <CardContent className="p-5 justify-between items-center flex flex-row">
        <Skeleton className="h-[18px] w-[120px]" />
        <Skeleton className="h-10 w-10" />
      </CardContent>
    </Card>
  </header>
);

export default HeaderSkeleton;
