import { Card, CardContent } from "@/app/_components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/app/_lib/utils";
import Trend from "./Trend";

type Tone = "primary" | "emerald" | "amber" | "sky" | "neutral";

interface IProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: Tone;
  trend?: number | null;
  trendInvert?: boolean;
}

const toneStyles: Record<Tone, string> = {
  primary: "bg-primary/15 text-primary",
  emerald: "bg-emerald-500/15 text-emerald-400",
  amber: "bg-amber-500/15 text-amber-400",
  sky: "bg-sky-500/15 text-sky-400",
  neutral: "bg-secondary text-gray-300",
};

const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  trend,
  trendInvert,
}: IProps) => (
  <Card>
    <CardContent className="p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-[0.08em] text-gray-400 font-semibold">
          {label}
        </span>
        {Icon && (
          <div
            className={cn(
              "h-7 w-7 rounded-md inline-flex items-center justify-center",
              toneStyles[tone]
            )}
          >
            <Icon size={13} strokeWidth={2} />
          </div>
        )}
      </div>
      <span className="text-2xl font-bold leading-none tracking-tight tabular-nums">
        {value}
      </span>
      <div className="flex flex-col gap-0.5">
        {trend !== undefined && <Trend value={trend ?? null} invert={trendInvert} suffix="" />}
        {hint && <span className="text-[11px] text-gray-500">{hint}</span>}
      </div>
    </CardContent>
  </Card>
);

export default StatCard;
