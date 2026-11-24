"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useThemeStore } from "@/store/useThemeStore";

type ThemeToggleProps = {
  compact?: boolean;
};

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <Button
      aria-label={label}
      title={label}
      variant={compact ? "compactIcon" : "icon"}
      onClick={toggleTheme}
    >
      {isDark ? (
        <Sun className={compact ? "size-5" : "size-6"} strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Moon className={compact ? "size-5" : "size-6"} strokeWidth={2.25} aria-hidden="true" />
      )}
    </Button>
  );
}
