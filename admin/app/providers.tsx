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
    const storedTheme = window.localStorage.getItem("sobra-ai-admin-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    setIsDark(storedTheme ? storedTheme === "dark" : prefersDark);
  }, [setIsDark]);

  return (
    <>
      <PwaRegistrar />
      {children}
    </>
  );
}
