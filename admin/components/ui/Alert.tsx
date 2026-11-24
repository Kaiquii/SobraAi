import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type AlertTone = "error" | "info" | "success";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
};

const tones = {
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200",
  info: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200",
};

const icons = {
  error: CircleAlert,
  info: Info,
  success: CircleCheck,
};

export function Alert({ className, children, tone = "info", ...props }: AlertProps) {
  const Icon = icons[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-5",
        tones[tone],
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
