"use client";

import { useLayoutEffect, type ReactNode } from "react";

import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { useThemeStore } from "@/store/useThemeStore";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useLayoutEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <>
      <PwaRegistrar />
      {children}
    </>
  );
}
