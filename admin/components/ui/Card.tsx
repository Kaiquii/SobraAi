import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-[0_16px_45px_rgb(15_23_42/0.08)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_18px_50px_rgb(0_0_0/0.3)]",
        className,
      )}
      {...props}
    />
  );
}
