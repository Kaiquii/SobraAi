import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type ModuleCardProps = {
  description: string;
  icon: LucideIcon;
  label: string;
  status: string;
  title: string;
  tone?: "blue" | "emerald" | "violet";
};

const tones = {
  blue: {
    accent: "bg-sky-500",
    decoration: "border-sky-200/70 dark:border-sky-800/35",
    icon: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    line: "bg-sky-400",
  },
  emerald: {
    accent: "bg-emerald-500",
    decoration: "border-emerald-200/70 dark:border-emerald-800/35",
    icon:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    line: "bg-emerald-400",
  },
  violet: {
    accent: "bg-violet-500",
    decoration: "border-violet-200/70 dark:border-violet-800/35",
    icon: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    line: "bg-violet-400",
  },
};

export function ModuleCard({
  description,
  icon: Icon,
  label,
  status,
  title,
  tone = "emerald",
}: ModuleCardProps) {
  const selectedTone = tones[tone];

  return (
    <Card className="relative flex min-h-59.5 h-full flex-col overflow-hidden p-6 shadow-[0_10px_30px_rgb(15_23_42/0.06)] dark:shadow-[0_12px_34px_rgb(0_0_0/0.22)] sm:p-7">
      <span
        className={cn("absolute inset-x-0 top-0 h-1", selectedTone.accent)}
        aria-hidden="true"
      />
      <span
        className={cn(
          "pointer-events-none absolute -right-10 -top-12 size-36 rounded-full border",
          selectedTone.decoration,
        )}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className={cn("grid size-12 place-items-center rounded-xl", selectedTone.icon)}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {status}
        </span>
      </div>

      <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <h3 className="relative mt-2 text-xl font-bold text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="relative mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>

      <span
        className={cn("relative mt-auto h-1 w-12 rounded-full", selectedTone.line)}
        aria-hidden="true"
      />
    </Card>
  );
}
