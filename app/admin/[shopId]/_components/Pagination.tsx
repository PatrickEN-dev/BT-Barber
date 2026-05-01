import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/app/_lib/utils";

interface IProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

const buildHref = (
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>
) => {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
  }
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
};

const Pagination = ({ page, totalPages, total, perPage, basePath, searchParams }: IProps) => {
  if (total === 0) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(start + perPage - 1, total);

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);
  const disabledPrev = page <= 1;
  const disabledNext = page >= totalPages;

  return (
    <nav className="flex items-center justify-between gap-3 py-4 mt-2 border-t border-border/60">
      <p className="text-[11px] text-gray-500 tabular-nums">
        <span className="text-foreground font-medium">
          {start}–{end}
        </span>{" "}
        de {total}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <Link
            href={disabledPrev ? "#" : buildHref(basePath, prev, searchParams)}
            aria-disabled={disabledPrev}
            aria-label="Página anterior"
            className={cn(
              "inline-flex items-center justify-center h-8 w-8 rounded-md border border-input transition-colors",
              disabledPrev ? "pointer-events-none opacity-40" : "hover:bg-accent"
            )}
          >
            <ChevronLeftIcon size={14} />
          </Link>
          <span className="text-[11px] text-gray-500 px-2 tabular-nums">
            {page}/{totalPages}
          </span>
          <Link
            href={disabledNext ? "#" : buildHref(basePath, next, searchParams)}
            aria-disabled={disabledNext}
            aria-label="Próxima página"
            className={cn(
              "inline-flex items-center justify-center h-8 w-8 rounded-md border border-input transition-colors",
              disabledNext ? "pointer-events-none opacity-40" : "hover:bg-accent"
            )}
          >
            <ChevronRightIcon size={14} />
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Pagination;
