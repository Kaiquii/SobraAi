import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { loadProjectRules } from "./project-rules.mjs";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "sobraai-rules-"));
  assert.equal(dirname(root), resolve(tmpdir()));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const manifest = { schemaVersion: 1, common: ["AGENTS.md"], projects: {
    web: ["web/rules.md"], backend: ["backend/rules.md"],
  } };
  const put = (file, content) => {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), content);
  };
  const save = () => put("project-rules.json", JSON.stringify(manifest));
  put("AGENTS.md", "Commit e push somente quando autorizados; servidores pelo usuário.");
  put("web/rules.md", "Regras da web.");
  put("backend/rules.md", "Regras do backend.");
  save();
  return { root, manifest, put, save };
}

test("tarefas entre projetos recebem o conteúdo comum e todos os projetos afetados sem duplicação", (t) => {
  const { root } = fixture(t);
  const rules = loadProjectRules(["web", "backend", "web"], { root });
  assert.deepEqual(rules.map(rule => rule.file), ["AGENTS.md", "web/rules.md", "backend/rules.md"]);
  assert.match(rules[0].contents, /somente quando autorizados/);
  assert.equal(rules[2].contents, "Regras do backend.");
});

test("mudanças nas regras são lidas novamente em cada execução", (t) => {
  const { root, put } = fixture(t);
  loadProjectRules(["web"], { root });
  put("web/rules.md", "Regra atualizada pelo usuário.");
  assert.equal(loadProjectRules(["web"], { root })[1].contents, "Regra atualizada pelo usuário.");
});

test("regra ausente ou vazia interrompe a carga em vez de fornecer contexto incompleto", (t) => {
  const { root, put } = fixture(t);
  rmSync(join(root, "web/rules.md"));
  assert.throws(() => loadProjectRules(["web"], { root }), /ausente.*web\/rules.md/);
  put("web/rules.md", " \n");
  assert.throws(() => loadProjectRules(["web"], { root }), /vazia.*web\/rules.md/);
});

test("projeto desconhecido e mapa sem as regras gerais não são aceitos", (t) => {
  const { root, manifest, save } = fixture(t);
  assert.throws(() => loadProjectRules(["typo"], { root }), /sem regras.*typo/);
  manifest.common = [];
  save();
  assert.throws(() => loadProjectRules(["web"], { root }), /Mapa de regras inválido/);
});

test("o mapa só permite documentos Markdown dentro do monorepo", (t) => {
  const { root, manifest, save } = fixture(t);
  for (const path of ["../outside.md", ".env", "web/../../outside.md"]) {
    manifest.projects.web = [path];
    save();
    assert.throws(() => loadProjectRules(["web"], { root }), /Caminho de regra inválido/);
  }
});

test("o contexto real do harness web inclui o conteúdo das regras gerais e locais", () => {
  const webRoot = fileURLToPath(new URL("../web/", import.meta.url));
  const output = execFileSync(process.execPath, ["scripts/ai-harness.mjs", "context"], {
    cwd: webRoot, encoding: "utf8", maxBuffer: 2 * 1024 * 1024, windowsHide: true,
  });
  const context = JSON.parse(output);
  const rules = loadProjectRules(["web"]);
  assert.equal(context.requiredContext.length, rules.length);
  assert.equal(context.requiredContext[0].file, "../AGENTS.md");
  for (const rule of rules) {
    assert.ok(context.requiredContext.some(document => document.contents === rule.contents), rule.file);
  }
});

test("todos os projetos carregam as regras globais antes dos documentos locais", () => {
  for (const project of ["web", "admin", "backend", "mobile"]) {
    const [agents, globalRules, localAgents] = loadProjectRules([project]);
    assert.equal(agents.file, "AGENTS.md");
    assert.equal(globalRules.file, "docs/rules.md");
    assert.match(globalRules.contents, /Ajustes de backend antes do frontend/);
    assert.equal(localAgents.file, `${project}/AGENTS.md`);
  }
});

test("o índice segue a ordem de leitura e limita os documentos ao escopo", () => {
  const script = fileURLToPath(new URL("./project-rules.mjs", import.meta.url));
  const output = execFileSync(process.execPath, [script, "--index", "--project", "admin", "--project", "backend"], {
    encoding: "utf8", windowsHide: true,
  });
  const rules = loadProjectRules(["admin", "backend"]);
  assert.deepEqual(output.trim().split(/\r?\n/).slice(1), rules.map(({ file }, index) => `${index + 1}. ${file}`));
});

test("o contexto mobile funciona sem SDK e bloqueia uma regra ausente", { skip: process.platform !== "win32" }, (t) => {
  const { root, manifest, put, save } = fixture(t);
  manifest.projects.mobile = ["mobile/rules.md"];
  save();
  put("mobile/rules.md", "Regra mobile de teste.");
  put("mobile/scripts/test-harness.ps1", readFileSync(new URL("../mobile/scripts/test-harness.ps1", import.meta.url), "utf8"));
  const args = ["-NoProfile", "-File", join(root, "mobile/scripts/test-harness.ps1"), "-Mode", "context"];
  const options = { encoding: "utf8", windowsHide: true, timeout: 15000 };
  const valid = spawnSync("powershell.exe", args, options);
  assert.equal(valid.status, 0, valid.stderr);
  assert.match(valid.stdout, /Regra mobile de teste/);
  rmSync(join(root, "mobile/rules.md"));
  const missing = spawnSync("powershell.exe", args, options);
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /Regra obrigatoria ausente/);
});
