import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type QuickAccessCardProps = {
  description: string;
  eyebrow: string;
  href?: string;
  icon: LucideIcon;
  label: string;
  status: string;
  tone: "blue" | "violet";
};

const tones = {
  blue: {
    decoration: "border-sky-300/50 dark:border-sky-800/40",
    border: "border-t-sky-500",
    interactive:
      "group-hover:border-sky-400 group-hover:bg-sky-50/70 group-hover:shadow-[0_18px_38px_rgb(14_165_233/0.16)] group-focus-visible:border-sky-400 group-focus-visible:bg-sky-50/70 dark:group-hover:border-sky-700 dark:group-hover:bg-sky-950 dark:group-hover:shadow-[0_20px_42px_rgb(2_132_199/0.16)] dark:group-focus-visible:border-sky-700 dark:group-focus-visible:bg-sky-950",
    icon: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
  violet: {
    decoration: "border-violet-300/50 dark:border-violet-800/40",
    border: "border-t-violet-500",
    interactive:
      "group-hover:border-violet-400 group-hover:bg-violet-50/70 group-hover:shadow-[0_18px_38px_rgb(139_92_246/0.16)] group-focus-visible:border-violet-400 group-focus-visible:bg-violet-50/70 dark:group-hover:border-violet-700 dark:group-hover:bg-violet-950 dark:group-hover:shadow-[0_20px_42px_rgb(109_40_217/0.16)] dark:group-focus-visible:border-violet-700 dark:group-focus-visible:bg-violet-950",
    icon: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
};

export function QuickAccessCard({
  description,
  eyebrow,
  href,
  icon: Icon,
  label,
  status,
  tone,
}: QuickAccessCardProps) {
  const selectedTone = tones[tone];

  const content = (
    <Card
      className={cn(
        "relative min-h-36 overflow-hidden border-t-4 p-4 shadow-[0_8px_24px_rgb(15_23_42/0.05)] dark:shadow-[0_10px_28px_rgb(0_0_0/0.2)]",
        selectedTone.border,
        href && selectedTone.interactive,
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute -right-8 -top-10 size-28 rounded-full border",
          href && "group-hover:scale-110 group-focus-visible:scale-110",
          selectedTone.decoration,
        )}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            href && "group-hover:scale-105 group-focus-visible:scale-105",
            selectedTone.icon,
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {status}
        </span>
      </div>

      <p className="relative mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {eyebrow}
      </p>
      <h3 className="relative mt-1 text-lg font-bold text-slate-950 dark:text-white">
        {label}
      </h3>
      <p className="relative mt-1 text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </Card>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="group block rounded-2xl outline-none hover:-translate-y-1 active:translate-y-0 focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-slate-950"
      aria-label={`Abrir ${label}`}
    >
      {content}
    </Link>
  );
}
