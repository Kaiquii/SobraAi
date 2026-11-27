"use client";

import { create } from "zustand";

import { THEME_STORAGE_KEY } from "@/lib/theme";

type ThemeState = {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  toggleTheme: () => void;
};

function applyTheme(isDark: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
  } catch {
    // A troca de tema continua disponível quando o armazenamento é bloqueado.
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  setIsDark: (isDark) => set({ isDark }),
  toggleTheme: () => {
    set((state) => {
      const isDark = !state.isDark;
      applyTheme(isDark);

      return { isDark };
    });
  },
}));
