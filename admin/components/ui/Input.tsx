import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  compact?: boolean;
  endAdornment?: ReactNode;
  startIcon?: ReactNode;
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    compact = false,
    endAdornment,
    startIcon,
    wrapperClassName,
    ...props
  },
  ref,
) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      {startIcon && (
        <span
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center text-slate-400 dark:text-slate-500",
            compact ? "w-9" : "w-11",
          )}
        >
          {startIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full border border-slate-300 bg-white px-3 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/15",
          compact ? "h-9 rounded-lg text-[13px]" : "h-12 rounded-xl text-sm",
          Boolean(startIcon) && (compact ? "pl-9" : "pl-11"),
          Boolean(endAdornment) && (compact ? "pr-9" : "pr-12"),
          className,
        )}
        {...props}
      />
      {endAdornment && (
        <span
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-center",
            compact ? "w-9" : "w-12",
          )}
        >
          {endAdornment}
        </span>
      )}
    </div>
  );
});
