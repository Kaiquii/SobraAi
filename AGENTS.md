# SobraAi — monorepo

Este repositório reúne quatro projetos independentes:

- `mobile/`: Kotlin Multiplatform para Android e iOS.
- `web/`: aplicação web Next.js.
- `admin/`: painel administrativo Next.js.
- `backend/`: API Go.

Leia o `AGENTS.md` e as regras da pasta afetada antes de trabalhar nela. Os caminhos e comandos dos guias internos são relativos à respectiva pasta, salvo indicação explícita da raiz do monorepo. As pastas `.agents/` e `.codex/` de cada projeto foram preservadas.

## Git e preservação

Trabalhe somente na `main`. Confira `git branch --show-current` e `git status --short` antes de alterações e antes de commits ou pushes autorizados. Não crie branches, worktrees ou repositórios Git internos. Preserve alterações existentes. Commit, push e publicação exigem autorização do usuário.

## Comandos e validação

Execute npm dentro de `web/` ou `admin/`, Go dentro de `backend/` e o Gradle Wrapper dentro de `mobile/`. Os projetos mantêm dependências, lockfiles, builds e deploys independentes. Não iniciar servidores, emuladores ou simuladores por iniciativa própria. A validação do mobile deve considerar Android e iOS.

## Interação de interface: somente navegador

Orientação permanente do usuário em 24/11/2026: toda interação visual deve ocorrer exclusivamente em abas do navegador, pelas APIs de navegador. Não usar controle nativo do PC, captura da área de trabalho ou de janelas inteiras, automação de mouse/teclado do sistema ou atalhos para trocar janelas/abas pelo desktop. Isso também é proibido como alternativa quando a extensão de navegador falhar. Nesse caso, manter o trabalho nas ferramentas de navegador e informar a limitação real. Edição de código, comandos de build/teste e Git seguem as demais regras do harness; não são automação da interface do PC.

## Arquivos privados e produção

Credenciais, arquivos de ambiente, assinaturas, uploads e backups locais não devem entrar no Git. Nunca imprimir seus valores. `.local-migration/` contém os Gits originais e os relatórios privados da migração; mantenha essa pasta ignorada e local. Não acessar VM, banco remoto, Netlify/Vercel nem publicar em lojas sem autorização específica para a operação.
