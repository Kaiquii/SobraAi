"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  applyBrowserTheme,
  getInitialTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

type ThemeState = {
  theme: Theme;
  initializeTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // O snapshot inicial deve ser idêntico no servidor e na hidratação.
      theme: "light",
      initializeTheme: () => {
        const theme = getInitialTheme();
        applyBrowserTheme(theme);
        set({ theme });
      },
      setTheme: (theme) => {
        applyBrowserTheme(theme);
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const theme = state.theme === "dark" ? "light" : "dark";
          applyBrowserTheme(theme);

          return { theme };
        }),
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: ({ theme }) => ({ theme }),
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try { return window.localStorage.getItem(name); } catch { return null; }
        },
        setItem: (name, value) => {
          try { window.localStorage.setItem(name, value); } catch { /* O tema continua funcionando sem storage. */ }
        },
        removeItem: (name) => {
          try { window.localStorage.removeItem(name); } catch { /* Storage pode estar bloqueado. */ }
        },
      })),
    },
  ),
);
