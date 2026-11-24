"use client";

import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export type DropdownOption<T extends string> = {
  description?: string;
  label: string;
  value: T;
};

type DropdownSelectProps<T extends string> = {
  ariaLabel: string;
  className?: string;
  icon?: LucideIcon;
  onChange: (value: T) => void;
  options: readonly DropdownOption<T>[];
  value: T;
};

type MenuPosition = {
  bottom?: number;
  left: number;
  maxHeight: number;
  top?: number;
  width: number;
};

export function DropdownSelect<T extends string>({
  ariaLabel,
  className,
  icon: Icon,
  onChange,
  options,
  value,
}: DropdownSelectProps<T>) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedOption = options[selectedIndex];

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 8;
    const menuGap = 6;
    const width = Math.min(
      Math.max(rect.width, 200),
      window.innerWidth - viewportPadding * 2,
    );
    const left = Math.min(
      Math.max(rect.left, viewportPadding),
      window.innerWidth - width - viewportPadding,
    );
    const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
    const availableAbove = rect.top - viewportPadding;
    const opensAbove = availableBelow < 180 && availableAbove > availableBelow;
    const availableSpace = opensAbove ? availableAbove : availableBelow;

    setPosition({
      bottom: opensAbove ? window.innerHeight - rect.top + menuGap : undefined,
      left,
      maxHeight: Math.max(120, Math.min(260, availableSpace - menuGap)),
      top: opensAbove ? undefined : rect.bottom + menuGap,
      width,
    });
  }, []);

  const closeMenu = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const focusFrame = window.requestAnimationFrame(() => {
      optionRefs.current[selectedIndex]?.focus();
    });

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !triggerRef.current?.contains(event.target) &&
        !document.getElementById(listboxId)?.contains(event.target)
      ) {
        closeMenu();
      }
    }

    function handleViewportChange() {
      updatePosition();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [closeMenu, isOpen, listboxId, selectedIndex, updatePosition]);

  function moveActiveIndex(direction: 1 | -1) {
    const nextIndex =
      (activeIndex + direction + options.length) % options.length;
    setActiveIndex(nextIndex);
    optionRefs.current[nextIndex]?.focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      setActiveIndex(selectedIndex);
      setIsOpen(true);
    }
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActiveIndex(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveIndex(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      optionRefs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      const lastIndex = options.length - 1;
      setActiveIndex(lastIndex);
      optionRefs.current[lastIndex]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
    } else if (event.key === "Tab") {
      closeMenu();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChange(options[index].value);
      closeMenu(true);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-dropdown-control
        className={cn(
          "flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-[13px] font-semibold text-slate-800 shadow-sm outline-none hover:bg-slate-50 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/15",
          className,
        )}
        aria-label={ariaLabel}
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => {
          if (isOpen) {
            closeMenu();
          } else {
            setActiveIndex(selectedIndex);
            setIsOpen(true);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        {Icon && (
          <Icon
            className="size-4 shrink-0 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
        )}
        <span className="min-w-0 flex-1 truncate">{selectedOption.label}</span>
        <ChevronDown
          className="size-4 shrink-0 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            className="fixed z-100 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_50px_rgb(15_23_42/0.2)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_20px_55px_rgb(0_0_0/0.6)]"
            style={position}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  data-dropdown-control
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={index === activeIndex ? 0 : -1}
                  className={cn(
                    "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                    isSelected
                      ? "bg-emerald-50 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                  )}
                  onClick={() => {
                    onChange(option.value);
                    closeMenu(true);
                  }}
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.description && (
                      <span className="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
