"use client";

import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ModalProps = {
  accent?: "danger" | "neutral" | "sky" | "success" | "warning";
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description?: string;
  eyebrow?: string;
  headerIcon?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isDismissDisabled?: boolean;
  isOpen: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  title: string;
};

const accentStyles = {
  danger: "bg-red-500 dark:bg-red-400",
  neutral: "bg-slate-400 dark:bg-slate-500",
  sky: "bg-sky-500 dark:bg-sky-400",
  success: "bg-emerald-500 dark:bg-emerald-400",
  warning: "bg-amber-500 dark:bg-amber-400",
};

export function Modal({
  accent = "neutral",
  children,
  className,
  contentClassName,
  description,
  eyebrow,
  headerIcon,
  initialFocusRef,
  isDismissDisabled = false,
  isOpen,
  onClose,
  returnFocusRef,
  title,
}: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const descriptionId = useId();
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement;
    const explicitReturnTarget = returnFocusRef?.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (initialFocusRef?.current ?? closeButtonRef.current)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDismissDisabled) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      const returnTarget = explicitReturnTarget ?? previouslyFocused;
      if (returnTarget instanceof HTMLElement) returnTarget.focus();
    };
  }, [initialFocusRef, isDismissDisabled, isOpen, onClose, returnFocusRef]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-80 grid place-items-center bg-slate-950/75 p-3 backdrop-blur-[2px] sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isDismissDisabled
        ) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-[0_28px_90px_rgb(15_23_42/0.38)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_30px_100px_rgb(0_0_0/0.72)] sm:max-h-[calc(100dvh-2rem)]",
          className,
        )}
      >
        <div className={cn("h-1 w-full", accentStyles[accent])} aria-hidden="true" />

        <div className={cn("p-5 sm:p-6", contentClassName)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3.5">
              {headerIcon}
              <div className="min-w-0 pt-0.5">
                {eyebrow && (
                  <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {eyebrow}
                  </p>
                )}
                <h2
                  id={titleId}
                  className="text-lg font-bold leading-snug text-slate-950 dark:text-white sm:text-xl"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id={descriptionId}
                    className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400"
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>

            <Button
              ref={closeButtonRef}
              variant="compactIcon"
              aria-label="Fechar modal"
              title="Fechar"
              disabled={isDismissDisabled}
              onClick={onClose}
            >
              <X className="size-4.5" aria-hidden="true" />
            </Button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
