"use client";

import { create } from "zustand";

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
  window.localStorage.setItem("sobra-ai-admin-theme", isDark ? "dark" : "light");
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  setIsDark: (isDark) => {
    applyTheme(isDark);
    set({ isDark });
  },
  toggleTheme: () => {
    set((state) => {
      const isDark = !state.isDark;
      applyTheme(isDark);

      return { isDark };
    });
  },
}));
