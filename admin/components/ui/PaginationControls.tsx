"use client";

import { ChevronLeft, ChevronRight, Rows3 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { Pagination } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type PaginationControlsProps = {
  className?: string;
  isLoading: boolean;
  itemLabel: string;
  itemsOnPage: number;
  onPageChange: (page: number) => void;
  pagination: Pagination;
};

export function PaginationControls({
  className,
  isLoading,
  itemLabel,
  itemsOnPage,
  onPageChange,
  pagination,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, pagination.total_pages);

  return (
    <nav
      data-pagination-controls
      aria-busy={isLoading}
      aria-label={`Paginação de ${itemLabel}`}
      className={cn(
        "flex min-h-13 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/45 sm:px-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <p className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 sm:text-xs">
          <Rows3
            className="size-4 shrink-0 text-sky-600 dark:text-sky-400"
            aria-hidden="true"
          />
          <span>
            <strong className="text-slate-950 dark:text-white">
              {itemsOnPage}
            </strong>{" "}
            de {pagination.total} {itemLabel}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <p
          className="mr-0.5 shrink-0 text-[11px] font-bold text-slate-700 dark:text-slate-200 sm:text-xs"
          aria-live="polite"
        >
          <span className="hidden sm:inline">Página </span>
          {pagination.page} de {totalPages}
        </p>

        <Button
          variant="compactIcon"
          className="max-sm:size-10 max-sm:min-h-10"
          aria-label="Página anterior"
          title="Página anterior"
          disabled={isLoading || !pagination.has_previous}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
        <Button
          variant="compactIcon"
          className="max-sm:size-10 max-sm:min-h-10"
          aria-label="Próxima página"
          title="Próxima página"
          disabled={isLoading || !pagination.has_next}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
