import { Card, CardContent } from "@/app/_components/ui/card";
import { Skeleton } from "@/app/_components/ui/skeleton";

interface IProps {
  height?: number;
}

const ChartCardSkeleton = ({ height = 160 }: IProps) => (
  <Card>
    <CardContent className="p-4 flex flex-col gap-3">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="h-3 w-20" />
      <div className="flex items-end gap-2 pt-2" style={{ height }}>
        {[40, 70, 55, 90, 35, 75, 60].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default ChartCardSkeleton;
