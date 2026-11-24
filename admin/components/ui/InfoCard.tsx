import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type InfoCardProps = {
  description: string;
  icon: LucideIcon;
  tone?: "blue" | "emerald";
  title: string;
};

const tones = {
  blue: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function InfoCard({
  description,
  icon: Icon,
  tone = "emerald",
  title,
}: InfoCardProps) {
  return (
    <Card className="p-4 shadow-[0_8px_22px_rgb(15_23_42/0.06)] dark:shadow-[0_8px_22px_rgb(0_0_0/0.2)]">
      <span className={cn("grid size-11 place-items-center rounded-xl", tones[tone])}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-bold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </Card>
  );
}
