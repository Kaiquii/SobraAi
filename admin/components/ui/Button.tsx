import { LoaderCircle } from "lucide-react";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "danger"
  | "warning"
  | "secondary"
  | "ghost"
  | "icon"
  | "compactIcon";

type ButtonProps = ComponentPropsWithRef<"button"> & {
  isLoading?: boolean;
  loadingLabel?: string;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "min-h-11 px-4 bg-emerald-600 text-white shadow-[0_8px_18px_rgb(5_150_105/0.18)] hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 dark:active:bg-emerald-300",
  danger:
    "min-h-11 px-4 bg-red-600 text-white shadow-[0_8px_18px_rgb(220_38_38/0.18)] hover:bg-red-700 active:bg-red-800 dark:bg-red-500 dark:text-white dark:hover:bg-red-400 dark:active:bg-red-300",
  warning:
    "min-h-11 px-4 bg-amber-500 text-slate-950 shadow-[0_8px_18px_rgb(245_158_11/0.18)] hover:bg-amber-600 active:bg-amber-700 dark:bg-amber-400 dark:hover:bg-amber-300 dark:active:bg-amber-200",
  secondary:
    "min-h-11 px-4 border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-700",
  ghost:
    "min-h-11 px-4 text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700",
  icon:
    "size-11 shrink-0 border border-slate-300 bg-white p-0 text-slate-700 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:active:bg-slate-700",
  compactIcon:
    "size-9 min-h-9 shrink-0 border border-slate-200 bg-transparent p-0 text-slate-600 hover:bg-slate-100 active:bg-slate-200 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700",
};

export function Button({
  className,
  children,
  disabled,
  isLoading = false,
  loadingLabel = "Carregando...",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-busy={isLoading}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 dark:focus-visible:ring-emerald-400 dark:focus-visible:ring-offset-slate-950",
        variants[variant],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
