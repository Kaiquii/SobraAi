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
| `admin/` | `npm ci` | `npm run lint`, `npm run typecheck` e `npm run build` |
| `backend/` | `go mod download` | `.\scripts\test.ps1` no Windows ou `sh ./scripts/test.sh` no Linux/macOS |
| `mobile/` | JDK e SDKs descritos no projeto | `.\gradlew.bat harnessVerify` no Windows; validação Apple complementar no Mac |

## Deploys independentes

O repositório remoto é https://github.com/Kaiquii/SobraAi.git.

Na Vercel, mantenha dois projetos conectados a esse repositório:

- Aplicação web: `Root Directory = web`, com os comandos de build e variáveis do projeto web.
- Administrativo: `Root Directory = admin`, com os comandos de build e variáveis do administrativo.

As variáveis de ambiente e os domínios continuam configurados em cada projeto da Vercel. A migração local não muda a conexão Git dos deploys existentes. Não há configuração de build da Vercel na raiz.

No back-end, use `backend/` como contexto Docker e execute os comandos de operação a partir dessa pasta. O `docker-compose.yml` local foi preservado com a configuração existente e está ignorado por conter credenciais. Em novos clones, copie `docker-compose.example.yml` para `docker-compose.yml` e configure as variáveis localmente a partir de `.env.example`. A publicação mobile continua seguindo os guias Android e Apple em `mobile/`. Um commit comum não atualiza automaticamente aplicativos já instalados; preserve a compatibilidade da API.

## Arquivos locais e histórico anterior

A cópia local da migração preserva arquivos ocultos, credenciais, dependências, caches, builds e dados locais dos quatro projetos. Esses arquivos privados ou gerados ficam fora do commit conforme os arquivos `.gitignore`.

Os quatro repositórios Git originais foram preservados integralmente em `.local-migration/original-git/`, junto com bundles para recuperação e um inventário de verificação SHA-256. Essa pasta é privada, ignorada pelo Git e não acompanha um clone do GitHub; mantenha um backup seguro dela e dos arquivos locais importantes.

O novo histórico começa com o estado atual unificado. Os históricos antigos permanecem nos backups locais porque há arquivos de ambiente em commits anteriores; eles não são incorporados ao histórico publicável do monorepo.

As instruções gerais para agentes estão em [AGENTS.md](AGENTS.md), complementadas pelas regras de cada projeto.
