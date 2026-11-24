import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type MetricCardProps = {
  className?: string;
  compact?: boolean;
  description: string;
  icon: LucideIcon;
  isLoading?: boolean;
  label: string;
  tone: "amber" | "blue" | "emerald" | "violet";
  value: number | string;
};

const tones = {
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  violet:
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

export function MetricCard({
  className,
  compact = false,
  description,
  icon: Icon,
  isLoading = false,
  label,
  tone,
  value,
}: MetricCardProps) {
  if (compact) {
    return (
      <div
        aria-busy={isLoading}
        title={description}
        className={cn(
          "flex min-h-14 min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-[0_6px_18px_rgb(15_23_42/0.04)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_8px_22px_rgb(0_0_0/0.18)]",
          className,
        )}
      >
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg",
            tones[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>

        {isLoading ? (
          <div
            className="min-w-0 flex-1 animate-pulse motion-reduce:animate-none"
            aria-hidden="true"
          >
            <div className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-1 h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : (
          <div className="min-w-0">
            <p className="text-lg font-bold leading-none text-slate-950 dark:text-white">
              {value}
            </p>
            <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {label}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      aria-busy={isLoading}
      className={cn(
        "flex min-h-20 min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-[0_8px_24px_rgb(15_23_42/0.05)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_10px_28px_rgb(0_0_0/0.2)] sm:gap-3 sm:p-3",
        className,
      )}
    >
      <span
        className={cn("grid size-9 shrink-0 place-items-center rounded-xl sm:size-11", tones[tone])}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>

      {isLoading ? (
        <div className="min-w-0 flex-1 animate-pulse motion-reduce:animate-none" aria-hidden="true">
          <div className="h-6 w-12 rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      ) : (
        <div className="min-w-0">
          <p className="text-xl font-bold leading-none text-slate-950 dark:text-white sm:text-2xl">
            {value}
          </p>
          <p className="mt-1.5 truncate text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400 sm:text-xs sm:tracking-wide">
            {label}
          </p>
          <p className="mt-0.5 hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
