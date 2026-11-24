"use client";

import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
};

export function Switch({
  checked,
  className,
  disabled = false,
  label,
  onCheckedChange,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-slate-900",
        checked
          ? "border-emerald-600 bg-emerald-600 dark:border-emerald-400 dark:bg-emerald-400"
          : "border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700",
        className,
      )}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={cn(
          "block size-4 rounded-full bg-white shadow-sm",
          checked ? "translate-x-6 dark:bg-slate-950" : "translate-x-1",
        )}
        aria-hidden="true"
      />
    </button>
  );
}
