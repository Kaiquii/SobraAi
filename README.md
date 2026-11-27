# SobraAi

Monorepo do SobraAi, com os projetos mobile, web, administrativo e back-end. Cada projeto mantém suas dependências, configuração e ciclo de publicação.

| Pasta | Projeto | Documentação |
| --- | --- | --- |
| `mobile/` | Android e iOS com Kotlin Multiplatform e Compose Multiplatform | [README](mobile/README.md) |
| `web/` | Aplicação web com Next.js e React | [README](web/README.md) |
| `admin/` | Painel administrativo com Next.js e React | [README](admin/README.md) |
| `backend/` | API Go | [README](backend/README.md) |

## Desenvolvimento e validação

Execute cada comando a partir da pasta indicada. Consulte os guias internos para configurar SDKs, variáveis de ambiente e ferramentas. Web e admin mantêm seus próprios `package-lock.json`; não há instalação npm na raiz.

| Pasta | Preparação | Validação |
| --- | --- | --- |
| `web/` | `npm ci` | `npm run ai:doctor` e `npm run ai:check` |
| `admin/` | `npm ci` | `npm run test`, `npm run lint`, `npm run typecheck` e `npm run build` |
| `backend/` | `go mod download` | `.\scripts\test.ps1` no Windows ou `sh ./scripts/test.sh` no Linux/macOS |
| `mobile/` | JDK e SDKs descritos no projeto | `.\gradlew.bat harnessVerify` no Windows; validação Apple complementar no Mac |

## Deploys independentes

O repositório remoto é https://github.com/Kaiquii/SobraAi.git.

No Netlify, mantenha os dois projetos existentes e troque apenas o repositório vinculado para `Kaiquii/SobraAi`. Assim, os nomes dos projetos e seus domínios atuais são preservados.

| Projeto existente | URL atual | Base directory | Build command | Publish directory | Production branch |
| --- | --- | --- | --- | --- | --- |
| Web | https://sobra-ai.netlify.app/login | `web` | `npm run build` | `.next` | `main` |
| Administrativo | https://sobra-ai-admin.netlify.app/login | `admin` | `npm run build` | `.next` | `main` |

Como cada aplicação instala e compila dentro da sua própria pasta, deixe Package directory vazio quando ele coincidir com Base directory. O caminho `.next` é relativo à pasta base de cada aplicação. Os arquivos `web/netlify.toml` e `admin/netlify.toml` declaram o adaptador oficial `@netlify/plugin-nextjs`, que prepara funções, redirects e assets do Next.js. Essa declaração evita uma publicação estática incompleta quando a detecção automática do framework não ocorre após trocar o repositório.

Em cada projeto existente, acesse Project configuration > Developer settings > Continuous deployment > Repository > Manage repository > Link to a different repository e selecione `Kaiquii/SobraAi`. Ajuste as opções em Build settings conforme a tabela. Mantenha os nomes dos projetos, os domínios e as variáveis de ambiente já configuradas. Não crie outros projetos para substituir os atuais.

Referências: [trocar o repositório vinculado](https://docs.netlify.com/build/git-workflows/repo-permissions-linking/) e [configuração de monorepos](https://docs.netlify.com/build/configure-builds/monorepos/).

A preparação local e o push do monorepo não trocam a conexão Git dos projetos existentes no Netlify. Essa troca é uma operação separada no painel. Não há configuração de build do Netlify na raiz do repositório.

No back-end, use `backend/` como contexto Docker e execute os comandos de operação a partir dessa pasta. O `docker-compose.yml` local foi preservado com a configuração existente e está ignorado por conter credenciais. Em novos clones, copie `docker-compose.example.yml` para `docker-compose.yml` e configure as variáveis localmente a partir de `.env.example`. A publicação mobile continua seguindo os guias Android e Apple em `mobile/`. Um commit comum não atualiza automaticamente aplicativos já instalados; preserve a compatibilidade da API.

## Arquivos locais e histórico anterior

A cópia local da migração preserva arquivos ocultos, credenciais, dependências, caches, builds e dados locais dos quatro projetos. Esses arquivos privados ou gerados ficam fora do commit conforme os arquivos `.gitignore`.

Os quatro repositórios Git originais foram preservados integralmente em `.local-migration/original-git/`, junto com bundles para recuperação e um inventário de verificação SHA-256. Essa pasta é privada, ignorada pelo Git e não acompanha um clone do GitHub; mantenha um backup seguro dela e dos arquivos locais importantes.

O novo histórico começa com o estado atual unificado. Os históricos antigos permanecem nos backups locais porque há arquivos de ambiente em commits anteriores; eles não são incorporados ao histórico publicável do monorepo.

As instruções gerais para agentes estão em [AGENTS.md](AGENTS.md), complementadas pelas regras de cada projeto. O mapa [project-rules.json](project-rules.json) reúne os documentos obrigatórios. `node scripts/project-rules.mjs --check` valida o mapa dos quatro projetos; sem `--check`, o comando imprime o conteúdo atual das regras. Use `--project web`, `--project admin`, `--project backend` ou `--project mobile` para delimitar o contexto, repetindo a opção em tarefas entre projetos. Commit e push exigem autorização do usuário; somente ele inicia e controla os servidores da aplicação.

As [regras comuns](docs/rules.md) incluem a ordem de leitura e os guias de cada projeto. Consulte a lista de documentos com `node scripts/project-rules.mjs --index`.
