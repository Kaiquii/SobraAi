"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type ToastProps = {
  duration?: number;
  isOpen: boolean;
  message: string;
  onClose: () => void;
  tone?: "error" | "success";
};

const tones = {
  error: {
    container:
      "border-red-400 bg-red-700 text-white dark:border-red-300 dark:bg-red-600",
    icon: "bg-red-950 text-red-100",
    close:
      "text-red-100 hover:bg-red-800 hover:text-white focus-visible:ring-white dark:hover:bg-red-700",
  },
  success: {
    container:
      "border-emerald-400 bg-emerald-700 text-white dark:border-emerald-300 dark:bg-emerald-600",
    icon: "bg-emerald-950 text-emerald-100",
    close:
      "text-emerald-100 hover:bg-emerald-800 hover:text-white focus-visible:ring-white dark:hover:bg-emerald-700",
  },
};

export function Toast({
  duration = 4000,
  isOpen,
  message,
  onClose,
  tone = "success",
}: ToastProps) {
  useEffect(() => {
    if (!isOpen) return;

    const timeout = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timeout);
  }, [duration, isOpen, message, onClose]);

  if (!isOpen) return null;

  const Icon = tone === "success" ? CircleCheck : CircleAlert;
  const toneStyles = tones[tone];

  return createPortal(
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn(
        "fixed bottom-3 left-1/2 z-200 flex w-[min(360px,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-3 rounded-xl border p-2.5 shadow-[0_18px_48px_rgb(15_23_42/0.42)] sm:bottom-5 sm:left-auto sm:right-5 sm:translate-x-0 dark:shadow-[0_20px_52px_rgb(0_0_0/0.62)]",
        toneStyles.container,
      )}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg",
          toneStyles.icon,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="min-w-0 flex-1 text-sm font-semibold leading-5">{message}</p>
      <button
        type="button"
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg outline-none focus-visible:ring-2",
          toneStyles.close,
        )}
        aria-label="Fechar notificação"
        onClick={onClose}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>,
    document.body,
  );
}
