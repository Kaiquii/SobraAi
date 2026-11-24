# SobraAi — monorepo

Este repositório reúne quatro projetos independentes:

- `mobile/`: Kotlin Multiplatform para Android e iOS.
- `web/`: aplicação web Next.js.
- `admin/`: painel administrativo Next.js.
- `backend/`: API Go.

Leia o `AGENTS.md` e as regras da pasta afetada antes de trabalhar nela. Os caminhos e comandos dos guias internos são relativos à respectiva pasta, salvo indicação explícita da raiz do monorepo. As pastas `.agents/` e `.codex/` de cada projeto foram preservadas.

## Leitura obrigatória das regras do projeto

As regras da raiz e dos projetos afetados são cumulativas e continuam obrigatórias após a unificação. Antes de analisar, editar ou executar comandos, carregue o contexto completo de cada projeto envolvido a partir de `project-rules.json`, na raiz. Leia também os documentos específicos do fluxo citados nessas regras; o mapa não substitui contratos, fontes ou instruções adicionais de subpastas. Se o escopo passar a incluir outro projeto, carregue suas regras antes de atuar nele.

| Projeto | Contexto obrigatório (comando dentro da pasta do projeto) |
| --- | --- |
| Web | `npm run ai:context` |
| Admin | `npm run ai:context` |
| Backend | `go run ./cmd/harness -mode context` |
| Mobile | `.\scripts\test-harness.ps1 -Mode context` |

Também é possível carregar vários projetos pela raiz: `node scripts/project-rules.mjs --project web --project backend`. O conteúdo dos documentos é carregado novamente em cada execução; arquivo obrigatório ausente, vazio ou ilegível interrompe a carga. Não prosseguir supondo regras nem remover uma entrada para fazer a validação passar. Uma nova regra permanente ou mudança de caminho exige atualizar os documentos e o mapa na mesma tarefa.

Antes da entrega, revisar o diff contra as regras carregadas, registrar o que foi validado e informar lacunas. Carregar documentos ou passar em testes não comprova, por si só, cumprimento de todas as regras. Em caso de conflito real não resolvido pelas instruções atuais do usuário, preservar o trabalho e explicar a divergência antes da ação afetada.

Commit e push continuam permitidos **somente quando autorizados pelo usuário para a tarefa em andamento**, na `main`; não são uma etapa implícita de implementação ou validação. Somente o usuário inicia, reinicia e controla os servidores da aplicação. A interação visual continua exclusivamente no navegador, conforme a seção abaixo.

## Git e preservação

Trabalhe somente na `main`. Confira `git branch --show-current` e `git status --short` antes de alterações e antes de commits ou pushes autorizados. Não crie branches, worktrees ou repositórios Git internos. Preserve alterações existentes. Commit, push e publicação exigem autorização do usuário.

## Comandos e validação

Execute npm dentro de `web/` ou `admin/`, Go dentro de `backend/` e o Gradle Wrapper dentro de `mobile/`. Os projetos mantêm dependências, lockfiles, builds e deploys independentes. Somente o usuário inicia, reinicia ou encerra servidores da aplicação; não executar `npm run dev`, `next dev`, `npm start` ou equivalentes para subir o aplicativo. Reutilizar o servidor do usuário ou informar a dependência. Verificações finitas de código continuam permitidas. Não iniciar emuladores ou simuladores por iniciativa própria. A validação do mobile deve considerar Android e iOS.

## Interação de interface: somente navegador

Orientação permanente do usuário em 24/11/2026: toda interação visual deve ocorrer exclusivamente em abas do navegador, pelas APIs de navegador. Não usar controle nativo do PC, captura da área de trabalho ou de janelas inteiras, automação de mouse/teclado do sistema ou atalhos para trocar janelas/abas pelo desktop. Isso também é proibido como alternativa quando a extensão de navegador falhar. Nesse caso, manter o trabalho nas ferramentas de navegador e informar a limitação real. Edição de código, comandos de build/teste e Git seguem as demais regras do harness; não são automação da interface do PC.

## Arquivos privados e produção

Credenciais, arquivos de ambiente, assinaturas, uploads e backups locais não devem entrar no Git. Nunca imprimir seus valores. `.local-migration/` contém os Gits originais e os relatórios privados da migração; mantenha essa pasta ignorada e local. Não acessar VM, banco remoto, Netlify/Vercel nem publicar em lojas sem autorização específica para a operação.
