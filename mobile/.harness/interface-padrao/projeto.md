# Produto

## Contexto obrigatório

Carregar `.\scripts\test-harness.ps1 -Mode context` dentro de `mobile/` antes de agir. O `project-rules.json` da raiz inclui as regras gerais e específicas do projeto; ler também os documentos do fluxo. Este resumo de interface não substitui essas regras. Commit/push somente quando autorizados, servidores da aplicação pelo usuário e interação visual somente pelo navegador.
SobraAi Kotlin/Compose Multiplatform; telas commonMain de sharedUi, tema designSystem. Android e iOS compartilham os mesmos componentes. Ver AGENTS.md e docs/frontend-rules.md. Validação: harnessVerify; dispositivos pelo usuário.

Política Git confirmada em 04/11/2026: trabalhar somente na main, conferindo
branch e status antes do trabalho e antes de commit/push autorizado. Não criar
branches novas (temporárias, codex/, auxiliares ou por worktree), nem em testes.
Outra branch/HEAD destacado exige preservar e informar, sem checkout, reset,
stash ou exclusão automática de arquivos/refs. A política não autoriza commit/push.
