import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type HomeStatCardProps = {
  icon: LucideIcon;
  label: string;
  tone: "blue" | "emerald";
  value: string;
};

const tones = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function HomeStatCard({ icon: Icon, label, tone, value }: HomeStatCardProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 sm:min-w-40">
      <span
        className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tones[tone])}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-lg font-bold leading-none text-slate-950 dark:text-white">
          {value}
        </p>
        <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}
