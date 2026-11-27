import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../lib/theme.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});
const theme = {};
runInNewContext(outputText, { exports: theme });

test("o script aplica o tema salvo durante a leitura do HTML", () => {
  const scenarios = [
    { savedTheme: "dark", osDark: false, expected: "dark" },
    { savedTheme: "light", osDark: true, expected: "light" },
    { savedTheme: null, osDark: true, expected: "dark" },
    { savedTheme: null, osDark: false, expected: "light" },
    { blocked: true, osDark: true, expected: "dark" },
    { blocked: true, serverTheme: "dark", osDark: false, expected: "dark" },
    { savedTheme: null, serverTheme: "light", osDark: true, expected: "light" },
    { savedTheme: "dark", serverTheme: "light", osDark: false, expected: "dark" },
    { savedTheme: "invalido", osDark: true, expected: "dark" },
  ];

  for (const { savedTheme, serverTheme, osDark, expected, blocked } of scenarios) {
    const classes = new Set(["h-full"]);
    const root = {
      dataset: { themePreference: serverTheme },
      classList: {
        toggle(name, active) {
          if (active) classes.add(name);
          else classes.delete(name);
        },
      },
      style: {},
    };

    runInNewContext(theme.themeBootstrapScript, {
      document: { documentElement: root },
      localStorage: {
        getItem(key) {
          assert.equal(key, "sobra-ai-admin-theme");
          if (blocked) throw new Error("Armazenamento bloqueado");
          return savedTheme;
        },
      },
      matchMedia(query) {
        assert.equal(query, "(prefers-color-scheme: dark)");
        return { matches: osDark };
      },
    });

    assert.equal(root.style.colorScheme, expected);
    assert.equal(root.style.backgroundColor, expected === "dark" ? "#07111f" : "#eef3f8");
    assert.equal(classes.has("dark"), expected === "dark");
    assert.equal(classes.has("h-full"), true);
  }
});

test("a hidratação restaura a preferência mesmo quando o script inicial não a aplicou", () => {
  const storeSource = readFileSync(new URL("../store/useThemeStore.ts", import.meta.url), "utf8");
  const storeCode = ts.transpileModule(storeSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const classes = new Set();
  const root = {
    dataset: {},
    classList: { toggle: (name, active) => active ? classes.add(name) : classes.delete(name) },
    style: {},
  };
  const document = { documentElement: root, cookie: "" };
  const preferences = new Map([["sobra-ai-admin-theme", "dark"]]);
  const exports = {};

  runInNewContext(storeCode, {
    document,
    exports,
    window: {
      location: { protocol: "https:" },
      localStorage: {
        getItem: (key) => preferences.get(key),
        setItem: (key, value) => preferences.set(key, value),
      },
      matchMedia: () => ({ matches: false }),
    },
    require(path) {
      if (path === "@/lib/theme") return theme;
      assert.equal(path, "zustand");
      return {
        create(initializer) {
          let state = initializer((update) => {
            state = { ...state, ...(typeof update === "function" ? update(state) : update) };
          });
          return { getState: () => state };
        },
      };
    },
  });

  const store = exports.useThemeStore;
  store.getState().initializeTheme();
  assert.equal(store.getState().isDark, true);
  assert.equal(root.style.colorScheme, "dark");
  assert.equal(classes.has("dark"), true);
  assert.match(document.cookie, /^sobra-ai-admin-theme=dark;.*; Secure$/);

  store.getState().toggleTheme();
  assert.equal(store.getState().isDark, false);
  assert.equal(root.style.colorScheme, "light");
  assert.equal(classes.has("dark"), false);
  assert.equal(preferences.get("sobra-ai-admin-theme"), "light");
  assert.match(document.cookie, /^sobra-ai-admin-theme=light;/);
});
