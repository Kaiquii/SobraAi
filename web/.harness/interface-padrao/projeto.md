# Projeto

## Regras obrigatórias do monorepo

Antes de qualquer análise ou alteração, execute `npm run ai:context` dentro de `web/`. O contexto carrega as regras gerais e específicas pelo `project-rules.json` da raiz; leia também os documentos do fluxo indicado. Instruções de interface não substituem as regras do projeto. Commit/push somente quando autorizados; servidores pelo usuário; interação visual somente em abas e APIs do navegador.

- Web: Next.js App Router, React, Tailwind, Zustand e Axios; fontes em `app`, `components` e `features`.
- Tema: Slate claro/escuro, azul de ação e fonte do `body` de `app/globals.css`.
- Referência Android local: `../mobile`, a partir de `web/`.
- Validação: `npm run ai:doctor`, `npm run ai:check`; somente o usuário inicia servidores.
- Catálogo geral existente: `docs/ui-components.md`. Regras de plataformas: `rules.md`.

## Política Git confirmada

Orientação do usuário em 04/11/2026: trabalhar somente na `main`. Conferir a branch antes de iniciar o trabalho e antes de cada commit ou push. Não criar branches, inclusive temporárias ou `codex/`, nem worktrees; commits e pushes autorizados devem ocorrer somente na `main`.

Outra branch, HEAD destacado ou Git indisponível exigem preservar o estado e informar o usuário. Não corrigir automaticamente com checkout, switch, reset, stash ou exclusão de branches/worktrees. Esta política não autoriza commit ou push e prevalece sobre recomendações genéricas de isolamento em branches/worktrees. O harness verifica a branch sem alterá-la; regras completas em `AGENTS.md`, `rules.md` e `docs/ai-guidelines.md`.
