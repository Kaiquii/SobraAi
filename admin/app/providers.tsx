"use client";

import { useEffect, type ReactNode } from "react";

import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { useThemeStore } from "@/store/useThemeStore";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const setIsDark = useThemeStore((state) => state.setIsDark);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, [setIsDark]);

  return (
    <>
      <PwaRegistrar />
      {children}
    </>
  );
}
