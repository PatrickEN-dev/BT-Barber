"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/app/_lib/utils";
import type { BookingStatus } from "@/app/admin/_actions/bookings";

interface IProps {
  shopId: string;
  status: BookingStatus;
  barberId?: string;
  range: BookingRange;
  barbers: Array<{ id: string; name: string }>;
}

export type BookingRange = "today" | "tomorrow" | "week" | "month" | "any";

const STATUS_OPTIONS: Array<{ value: BookingStatus; label: string }> = [
  { value: "upcoming", label: "Próximos" },
  { value: "past", label: "Passados" },
  { value: "all", label: "Todos" },
];

const RANGE_OPTIONS: Array<{ value: BookingRange; label: string }> = [
  { value: "any", label: "Qualquer data" },
  { value: "today", label: "Hoje" },
  { value: "tomorrow", label: "Amanhã" },
  { value: "week", label: "7 dias" },
  { value: "month", label: "30 dias" },
];

const BookingFilters = ({ shopId, status, barberId, range, barbers }: IProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/admin/${shopId}/bookings?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 scrollbar-none">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setParam("status", opt.value)}
            className={cn(
              "shrink-0 px-3.5 h-8 rounded-full text-xs font-medium border transition-colors",
              status === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input text-gray-400 hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 scrollbar-none">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setParam("range", opt.value === "any" ? null : opt.value)}
            className={cn(
              "shrink-0 px-3 h-7 rounded-md text-[11px] font-medium border transition-colors",
              range === opt.value
                ? "bg-secondary text-foreground border-secondary"
                : "border-input/60 text-gray-500 hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {barbers.length > 0 && (
        <select
          value={barberId ?? ""}
          onChange={(e) => setParam("barberId", e.target.value || null)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos os barbeiros</option>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default BookingFilters;
