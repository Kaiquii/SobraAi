"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { adminNavigation } from "@/components/layout/adminNavigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAdminLayoutStore } from "@/store/useAdminLayoutStore";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function Sidebar() {
  const pathname = usePathname();
  const closeSidebar = useAdminLayoutStore((state) => state.closeSidebar);
  const isSidebarOpen = useAdminLayoutStore((state) => state.isSidebarOpen);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSidebar();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );

      if (focusableElements.length === 0) return;

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
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      document.getElementById("admin-sidebar-trigger")?.focus();
    };
  }, [closeSidebar, isSidebarOpen]);

  if (!isSidebarOpen) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default bg-slate-950/50"
        aria-label="Fechar menu de navegação"
        onClick={closeSidebar}
      />

      <aside
        ref={panelRef}
        id="admin-sidebar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-sidebar-title"
        className="fixed inset-y-2 left-2 z-50 flex w-[288px] max-w-[calc(100vw-1rem)] flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgb(15_23_42/0.24)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_20px_60px_rgb(0_0_0/0.5)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
          <BrandMark
            className="min-w-0 gap-2"
            imageClassName="!size-9 !rounded-lg !shadow-none"
            showSubtitle={false}
            titleClassName="!text-lg"
          />
          <Button
            ref={closeButtonRef}
            variant="compactIcon"
            aria-label="Fechar menu de navegação"
            title="Fechar menu"
            onClick={closeSidebar}
          >
            <X className="size-4.5" aria-hidden="true" />
          </Button>
        </div>

        <div className="px-2 pb-2 pt-5">
          <p
            id="admin-sidebar-title"
            className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400"
          >
            Navegação
          </p>
        </div>

        <nav aria-label="Navegação administrativa">
          <ul className="space-y-1">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.available && pathname === item.href;
              const itemClassName = cn(
                "flex min-h-12 items-center gap-2.5 rounded-xl border px-2.5 py-2 outline-none",
                isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-100"
                  : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:focus-visible:ring-emerald-400",
                !item.available && "cursor-not-allowed",
              );

              const content = (
                <>
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg",
                      isActive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{item.label}</span>
                  </span>
                  {!item.available && (
                    <span className="rounded-md bg-slate-100 px-1.5 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Em breve
                    </span>
                  )}
                </>
              );

              return (
                <li key={item.href}>
                  {item.available ? (
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={itemClassName}
                      onClick={closeSidebar}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div aria-disabled="true" className={itemClassName}>
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

      </aside>
    </>
  );
}
