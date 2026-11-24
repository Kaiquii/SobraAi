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
    const capacity = container?.querySelector<HTMLElement>(
      "[data-pagination-capacity]",
    );

    function calculateLimit() {
      if (window.innerWidth < DESKTOP_BREAKPOINT) {
        const viewportKey = [
          window.innerWidth,
          window.innerHeight,
          window.devicePixelRatio,
          "mobile",
        ].join(":");

        if (lastViewportKeyRef.current === viewportKey) return;
        lastViewportKeyRef.current = viewportKey;
        container?.style.removeProperty("--admin-table-row-height");
        return;
      }

      if (!capacity) return;

      const viewportKey = [
        window.innerWidth,
        window.innerHeight,
        window.devicePixelRatio,
        capacity.clientWidth,
        capacity.clientHeight,
      ].join(":");

      if (lastViewportKeyRef.current === viewportKey) return;
      lastViewportKeyRef.current = viewportKey;

      const tableHeader = capacity.querySelector<HTMLElement>(
        "[data-pagination-header]",
      );
      const tableHeaderHeight = tableHeader?.getBoundingClientRect().height ?? 0;
      const availableHeight =
        capacity.clientHeight -
        tableHeaderHeight -
        CALCULATION_SAFETY_SPACE;

      if (availableHeight <= 0) return;

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

    const resolutionQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`,
    );
    resolutionQuery.addEventListener("change", scheduleCalculation);

    const resizeObserver = new ResizeObserver(scheduleCalculation);
    if (container) resizeObserver.observe(container);
    if (capacity) resizeObserver.observe(capacity);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", scheduleCalculation);
      window.removeEventListener("focus", scheduleCalculation);
      window.removeEventListener("orientationchange", scheduleCalculation);
      window.removeEventListener("pageshow", scheduleCalculation);
      window.visualViewport?.removeEventListener("resize", scheduleCalculation);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resolutionQuery.removeEventListener("change", scheduleCalculation);
      resizeObserver.disconnect();
      container?.style.removeProperty("--admin-table-row-height");
    };
  }, [containerRef, isLayoutReady, onLimitChange, rowHeight]);
}
