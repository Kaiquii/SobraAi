export const THEME_STORAGE_KEY = "sobra-ai-admin-theme";

export const themeBootstrapScript = `(() => {
  let savedTheme;
  try {
    savedTheme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
  } catch {
    // O navegador pode bloquear o acesso ao armazenamento.
  }

  const isDark = savedTheme === "dark" ||
    (savedTheme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
})();`;
