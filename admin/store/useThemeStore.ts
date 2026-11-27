"use client";

import { create } from "zustand";

import {
  DARK_THEME_QUERY,
  parseTheme,
  THEME_BACKGROUND,
  THEME_COOKIE_NAME,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

type ThemeState = {
  isDark: boolean;
  initializeTheme: () => void;
  toggleTheme: () => void;
};

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  root.style.backgroundColor = THEME_BACKGROUND[theme];
}

function saveTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // O cookie pode estar disponível mesmo com localStorage bloqueado.
  }
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${THEME_COOKIE_NAME}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  } catch {
    // O tema continua aplicado na página atual.
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  initializeTheme: () => {
    const serverTheme = parseTheme(document.documentElement.dataset.themePreference);
    let storedTheme: Theme | undefined;
    try {
      storedTheme = parseTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
    } catch {
      // Usa a preferência do servidor ou do sistema.
    }
    const theme = storedTheme ?? serverTheme ?? (window.matchMedia(DARK_THEME_QUERY).matches ? "dark" : "light");
    applyTheme(theme);
    if (storedTheme && storedTheme !== serverTheme) saveTheme(storedTheme);
    set({ isDark: theme === "dark" });
  },
  toggleTheme: () => {
    set((state) => {
      const isDark = !state.isDark;
      const theme = isDark ? "dark" : "light";
      applyTheme(theme);
      saveTheme(theme);

      return { isDark };
    });
  },
}));
