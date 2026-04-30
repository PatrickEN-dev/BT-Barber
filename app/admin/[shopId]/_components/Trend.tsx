import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import { cn } from "@/app/_lib/utils";

interface IProps {
  value: number | null;
  invert?: boolean;
  className?: string;
  suffix?: string;
}

const Trend = ({ value, invert = false, className, suffix = "vs período anterior" }: IProps) => {
  if (value === null || value === undefined) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] text-gray-500", className)}>
        — sem comparativo
      </span>
    );
  }

  const isZero = Math.abs(value) < 0.5;
  const isPositive = value > 0;
  const good = invert ? !isPositive : isPositive;

  const tone = isZero
    ? "text-gray-400"
    : good
    ? "text-emerald-400"
    : "text-rose-400";

  const Icon = isZero ? MinusIcon : isPositive ? ArrowUpRightIcon : ArrowDownRightIcon;
  const formatted = isZero ? "0%" : `${isPositive ? "+" : ""}${Math.round(value)}%`;

  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", tone, className)}>
      <Icon size={11} strokeWidth={2.5} />
      {formatted}
      <span className="text-gray-500 font-normal ml-0.5">{suffix}</span>
    </span>
  );
};

export default Trend;
