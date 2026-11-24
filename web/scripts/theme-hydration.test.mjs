import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToString } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
function Button({ children, ...props }) {
  delete props.variant;
  delete props.size;
  return React.createElement("button", props, children);
}
function load(relative, mocks, globals) {
  const source = readFileSync(new URL(relative, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => name in mocks ? mocks[name] : require(name), ...globals });
  return exports;
}

function fixture({ saved, darkSystem = true, blocked = false } = {}) {
  const values = new Map(saved ? [["app-financeiro-theme", JSON.stringify({ state: { theme: saved }, version: 0 })]] : []);
  const classes = new Set();
  const document = { documentElement: {
    style: {}, classList: { toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name) },
  }, querySelectorAll: () => [] };
  const storage = {
    getItem(name) { if (blocked) throw Error("Storage blocked"); return values.get(name) ?? null; },
    setItem(name, value) { if (blocked) throw Error("Storage blocked"); values.set(name, value); },
    removeItem(name) { if (blocked) throw Error("Storage blocked"); values.delete(name); },
  };
  const globals = { window: { localStorage: storage, matchMedia: () => ({ matches: darkSystem }) }, document };
  const theme = load("../lib/theme.ts", {}, globals);
  const { useThemeStore } = load("../store/useThemeStore.ts", { "@/lib/theme": theme }, globals);
  const { ThemeToggle } = load("../components/ui/theme-toggle.tsx", {
    "@/store/useThemeStore": { useThemeStore },
    "@/lib/utils": { cn: (...names) => names.filter(Boolean).join(" ") },
    "@/components/ui/button": { Button },
  }, globals);
  return { useThemeStore, classes, document, values, ThemeToggle };
}

test("SSR and client hydration render the same theme button even with a saved dark preference", () => {
  const serverTheme = load("../lib/theme.ts", {}, {});
  const server = load("../store/useThemeStore.ts", { "@/lib/theme": serverTheme }, {});
  const client = fixture({ saved: "dark" });
  assert.equal(server.useThemeStore.getInitialState().theme, "light");
  assert.equal(client.useThemeStore.getInitialState().theme, "light");
  assert.equal(client.useThemeStore.getState().theme, "dark");
  const serverToggle = load("../components/ui/theme-toggle.tsx", {
    "@/store/useThemeStore": server,
    "@/lib/utils": { cn: (...names) => names.filter(Boolean).join(" ") },
    "@/components/ui/button": { Button },
  }, {}).ThemeToggle;
  assert.equal(renderToString(React.createElement(serverToggle)), renderToString(React.createElement(client.ThemeToggle)));
});

test("initialization restores the system theme without changing the SSR snapshot", () => {
  const { useThemeStore, classes } = fixture();
  assert.equal(useThemeStore.getState().theme, "light");
  useThemeStore.getState().initializeTheme();
  assert.equal(useThemeStore.getState().theme, "dark");
  assert.equal(useThemeStore.getInitialState().theme, "light");
  assert.ok(classes.has("dark"));
});

test("an explicit light preference overrides the system and survives theme changes", () => {
  const { useThemeStore, values, classes } = fixture({ saved: "light" });
  useThemeStore.getState().initializeTheme();
  assert.equal(useThemeStore.getState().theme, "light");
  assert.ok(!classes.has("dark"));
  useThemeStore.getState().toggleTheme();
  assert.equal(JSON.parse(values.get("app-financeiro-theme")).state.theme, "dark");
  assert.ok(classes.has("dark"));
});

test("storage being blocked does not break initialization or the theme toggle", () => {
  const { useThemeStore, classes } = fixture({ blocked: true });
  assert.doesNotThrow(() => useThemeStore.getState().initializeTheme());
  assert.equal(useThemeStore.getState().theme, "dark");
  assert.ok(classes.has("dark"));
  assert.doesNotThrow(() => useThemeStore.getState().toggleTheme());
  assert.equal(useThemeStore.getState().theme, "light");
});
