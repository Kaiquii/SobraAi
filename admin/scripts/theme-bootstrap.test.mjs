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
  ];

  for (const { savedTheme, osDark, expected, blocked } of scenarios) {
    const classes = new Set(["h-full"]);
    const root = {
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
    assert.equal(classes.has("dark"), expected === "dark");
    assert.equal(classes.has("h-full"), true);
  }
});
