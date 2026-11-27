export const THEME_STORAGE_KEY = "sobra-ai-admin-theme";
export const THEME_COOKIE_NAME = THEME_STORAGE_KEY;
export const DARK_THEME_QUERY = "(prefers-color-scheme: dark)";
export const THEME_BACKGROUND = { light: "#eef3f8", dark: "#07111f" } as const;

export type Theme = keyof typeof THEME_BACKGROUND;

export function parseTheme(value: string | null | undefined): Theme | undefined {
  if (value === "dark" || value === "light") return value;
}

export const themeBootstrapScript = `(() => {
  const root = document.documentElement;
  let savedTheme = root.dataset.themePreference;
  try {
    const stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (stored === "dark" || stored === "light") savedTheme = stored;
  } catch {
    // O navegador pode bloquear o acesso ao armazenamento.
  }

  const theme = savedTheme || (matchMedia(${JSON.stringify(DARK_THEME_QUERY)}).matches ? "dark" : "light");
  const background = ${JSON.stringify(THEME_BACKGROUND)};
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  root.style.backgroundColor = background[theme];
})();`;
