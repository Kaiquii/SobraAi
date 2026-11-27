"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

import { MAX_PAGE_LIMIT } from "@/lib/pagination";

type UseResponsivePageLimitOptions = {
  containerRef: RefObject<HTMLElement | null>;
  currentLimit: number;
  isLayoutReady: boolean;
  onLimitChange: (limit: number) => void;
  rowHeight: number;
};

const DESKTOP_BREAKPOINT = 1024;
const CALCULATION_SAFETY_SPACE = 2;

export function useResponsivePageLimit({
  containerRef,
  currentLimit,
  isLayoutReady,
  onLimitChange,
  rowHeight,
}: UseResponsivePageLimitOptions) {
  const currentLimitRef = useRef(currentLimit);
  const lastViewportKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    currentLimitRef.current = currentLimit;
  }, [currentLimit]);

  useLayoutEffect(() => {
    if (!isLayoutReady) {
      lastViewportKeyRef.current = null;
      return;
    }

    let animationFrame = 0;
    const container = containerRef.current;

    function calculateLimit() {
      const viewport = window.visualViewport;
      // A faixa de erro e os resultados podem alterar a área da tabela sem redimensionar a janela.
      const viewportKey = [
        window.innerWidth,
        window.innerHeight,
        window.devicePixelRatio,
        viewport?.width,
        viewport?.height,
      ].join(":");

      if (lastViewportKeyRef.current === viewportKey) return;

      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        lastViewportKeyRef.current = viewportKey;
        container?.style.removeProperty("--admin-table-row-height");
        return;
      }

      const capacity = container?.querySelector<HTMLElement>("[data-pagination-capacity]");
      if (!capacity) return;
      const tableHeader = capacity.querySelector<HTMLElement>(
        "[data-pagination-header]",
      );
      if (!tableHeader) return;
      const tableHeaderHeight = tableHeader.getBoundingClientRect().height;
      const availableHeight =
        capacity.clientHeight -
        tableHeaderHeight -
        CALCULATION_SAFETY_SPACE;

      if (availableHeight <= 0) return;
      lastViewportKeyRef.current = viewportKey;

      const nextLimit = Math.min(
        MAX_PAGE_LIMIT,
        Math.max(1, Math.floor(availableHeight / rowHeight)),
      );
      const distributedRowHeight = availableHeight / nextLimit;

      container?.style.setProperty(
        "--admin-table-row-height",
        `${distributedRowHeight}px`,
      );

      if (nextLimit !== currentLimitRef.current) {
        currentLimitRef.current = nextLimit;
        onLimitChange(nextLimit);
      }
    }

    function scheduleCalculation() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(calculateLimit);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") scheduleCalculation();
    }

    calculateLimit();
    window.addEventListener("resize", scheduleCalculation);
    window.addEventListener("focus", scheduleCalculation);
    window.addEventListener("orientationchange", scheduleCalculation);
    window.addEventListener("pageshow", scheduleCalculation);
    window.visualViewport?.addEventListener("resize", scheduleCalculation);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let resolutionQuery: MediaQueryList;
    function watchCurrentResolution() {
      resolutionQuery?.removeEventListener("change", watchCurrentResolution);
      resolutionQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      resolutionQuery.addEventListener("change", watchCurrentResolution);
      scheduleCalculation();
    }
    watchCurrentResolution();

    const contentObserver = new ResizeObserver(scheduleCalculation);
    if (container) contentObserver.observe(container);
    const capacity = container?.querySelector("[data-pagination-capacity]");
    if (capacity) contentObserver.observe(capacity);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", scheduleCalculation);
      window.removeEventListener("focus", scheduleCalculation);
      window.removeEventListener("orientationchange", scheduleCalculation);
      window.removeEventListener("pageshow", scheduleCalculation);
      window.visualViewport?.removeEventListener("resize", scheduleCalculation);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resolutionQuery.removeEventListener("change", watchCurrentResolution);
      contentObserver.disconnect();
      container?.style.removeProperty("--admin-table-row-height");
    };
  }, [containerRef, isLayoutReady, onLimitChange, rowHeight]);
}
