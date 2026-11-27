import { readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const monorepoRoot = fileURLToPath(new URL("../", import.meta.url));

export function loadProjectRules(projects, { root = monorepoRoot } = {}) {
  const manifest = JSON.parse(readFileSync(resolve(root, "project-rules.json"), "utf8"));
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.common) ||
      !manifest.common.includes("AGENTS.md") || !manifest.projects ||
      typeof manifest.projects !== "object" || Array.isArray(manifest.projects) ||
      Object.keys(manifest.projects).length === 0) {
    throw new Error("Mapa de regras inválido: project-rules.json.");
  }
  const selected = projects?.length ? projects : Object.keys(manifest.projects);
  const files = [...manifest.common];
  for (const project of selected) {
    if (!Object.hasOwn(manifest.projects, project) || !Array.isArray(manifest.projects[project]) ||
        manifest.projects[project].length === 0) {
      throw new Error(`Projeto sem regras obrigatórias: ${project}.`);
    }
    files.push(...manifest.projects[project]);
  }
  return [...new Set(files)].map((file) => {
    if (typeof file !== "string" || !file.endsWith(".md") || isAbsolute(file) ||
        file.split(/[\\/]/).includes("..")) {
      throw new Error(`Caminho de regra inválido: ${file}.`);
    }
    const path = resolve(root, file);
    const local = relative(root, path);
    if (!local || local.startsWith("..") || isAbsolute(local)) {
      throw new Error(`Regra fora do monorepo: ${file}.`);
    }
    let contents;
    try { contents = readFileSync(path, "utf8").trim(); }
    catch { throw new Error(`Regra obrigatória ausente ou ilegível: ${file}.`); }
    if (!contents) throw new Error(`Regra obrigatória vazia: ${file}.`);
    return { file, contents };
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const projects = [];
    const modes = new Set();
    for (let index = 2; index < process.argv.length; index++) {
      const arg = process.argv[index];
      if (arg === "--check" || arg === "--index") modes.add(arg);
      else if (arg === "--project" && process.argv[index + 1] && !process.argv[index + 1].startsWith("--")) {
        projects.push(process.argv[++index]);
      } else throw new Error("Use --project web|admin|backend|mobile (repetível) e opcionalmente --check ou --index.");
    }
    if (modes.size > 1) throw new Error("Escolha --check ou --index.");
    const rules = loadProjectRules(projects);
    if (modes.has("--check")) console.log(`[project-rules] ${rules.length} documentos obrigatórios válidos.`);
    else if (modes.has("--index")) {
      console.log("[project-rules] Ordem de leitura. Execute sem --index para carregar o conteúdo completo.");
      rules.forEach(({ file }, index) => console.log(`${index + 1}. ${file}`));
    }
    else console.log(rules.map(({ file, contents }) => `\n--- REGRA: ${file} ---\n${contents}`).join("\n"));
  } catch (error) {
    console.error(`[project-rules] ${error.message}`);
    process.exitCode = 1;
  }
}
