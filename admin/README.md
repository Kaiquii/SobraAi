# SobraAi Admin

Painel administrativo do SobraAi para gestão de usuários e das versões do aplicativo Android. O projeto utiliza Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand, Axios e Lucide React.

## Requisitos

- Node.js compatível com o Next.js 16;
- npm;
- acesso à API do SobraAi;
- uma conta com papel administrativo e acesso liberado.

## Configuração local

1. Instale as dependências:

```bash
npm install
```

2. Copie `.env.example` para `.env.local` e informe a URL da API:

```env
API_URL=https://137-131-247-103.nip.io
```

`API_URL` é validada e utilizada somente no servidor. O projeto não usa variáveis `NEXT_PUBLIC_` para tokens, credenciais ou endereços privados. Arquivos `.env*`, com exceção de `.env.example`, não devem ser versionados.

3. Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). A rota inicial direciona para `/login`.

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run lint       # ESLint
npm run typecheck  # verificação do TypeScript
npm run build      # build de produção
npm run start      # execução da build produzida
npm audit          # auditoria de dependências
```

## Arquitetura

- `app/`: rotas, layouts, metadata e Route Handlers do BFF;
- `components/layout/`: header, sidebar e shell administrativo;
- `components/ui/`: componentes reutilizáveis;
- `features/`: módulos de autenticação, home, usuários e versões;
- `hooks/`: comportamentos reutilizáveis de interface responsiva;
- `lib/`: Axios, ambiente, sessão e utilitários compartilhados;
- `store/`: estados globais de tema e layout;
- `docs/`: regras, contratos da API, arquitetura e checklist de implantação.

O navegador conversa apenas com os Route Handlers em `/api`. Esses handlers validam a sessão administrativa e usam Axios para acessar a API externa. O JWT permanece em cookie `HttpOnly`; ele não é devolvido ao JavaScript do navegador.

Consulte [docs/mapeamento-arquitetura-features.md](docs/mapeamento-arquitetura-features.md) para o detalhamento e [docs/rules.md](docs/rules.md) antes de alterar o projeto.

## Rotas

- `/login`: autenticação administrativa;
- `/home`: resumo operacional;
- `/usuarios`: consulta e gestão de acesso dos usuários;
- `/versoes-aplicativo`: consulta e publicação das versões Android.

## Preparação para produção

Antes de publicar:

1. configure `API_URL` no ambiente de hospedagem;
2. execute lint, TypeScript, build e auditoria de dependências;
3. valide login, expiração da sessão, logout e rotas protegidas;
4. teste desktop e mobile nos temas claro e escuro;
5. confirme que a hospedagem utiliza HTTPS;
6. siga [docs/checklist-implantacao.md](docs/checklist-implantacao.md).

A publicação depende de autorização explícita do responsável pelo projeto.
