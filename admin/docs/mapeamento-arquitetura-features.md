# Mapeamento da arquitetura por features

Este documento descreve a arquitetura atual do SobraAi Admin. Ele deve ser atualizado sempre que uma rota, feature ou camada compartilhada for criada.

## Visão geral

O projeto utiliza Next.js 16 com App Router, React 19, TypeScript estrito, Tailwind CSS 4, Zustand, Axios e Lucide React. A aplicação segue uma arquitetura modular por domínio:

```text
rota em app
  -> view da feature
    -> store Zustand
      -> cliente Axios do navegador
        -> Route Handler protegido
          -> cliente Axios do servidor
            -> API do SobraAi
```

Essa composição mantém o JWT fora do JavaScript do navegador e separa interface, estado, integração e autorização.

## Estrutura da raiz

```text
sobra-ai-admin/
|-- app/
|   |-- (auth)/login/
|   |-- (dashboard)/
|   |   |-- home/
|   |   |-- usuarios/
|   |   `-- versoes-aplicativo/
|   `-- api/
|       |-- auth/
|       `-- admin/
|-- components/
|   |-- layout/
|   `-- ui/
|-- features/
|   |-- app-versions/
|   |-- auth/
|   |-- home/
|   `-- users/
|-- lib/
|   |-- auth/
|   `-- server/
|-- hooks/
|-- store/
|-- public/brand/
|-- docs/
|-- proxy.ts
|-- next.config.ts
|-- package.json
`-- .env.example
```

## Desenvolvimento e cache do PWA

O modo de desenvolvimento usa `next dev --webpack`, evitando o panic do Turbopack observado na resolução de módulos durante o HMR no Windows. `turbopack.root` e `outputFileTracingRoot` apontam para a pasta do admin, que mantém suas próprias dependências no monorepo. O build de produção mantém o compilador padrão do Next.js.

Em desenvolvimento, `PwaRegistrar` remove o registro de service worker do escopo raiz e os caches com prefixo `sobra-ai-admin-`. Em produção, o worker guarda somente os ícones da marca e assets em `/_next/static/`, com limite de entradas. Navegações, HTML, API, RSC e HMR seguem a rede. A ativação remove apenas caches antigos do próprio admin; falhas de armazenamento não impedem a carga dos assets. As regressões são executadas por `npm run test`.

## Camada de rotas: `app`

As páginas são pontos de entrada finos: declaram metadata e renderizam a view principal da feature. Regras de negócio, stores e chamadas HTTP não devem ser implementadas diretamente nas páginas.

Rotas atuais:

| Rota | Implementação | Responsabilidade |
| --- | --- | --- |
| `/login` | `app/(auth)/login/page.tsx` | Entrada administrativa |
| `/home` | `app/(dashboard)/home/page.tsx` | Resumo operacional |
| `/usuarios` | `app/(dashboard)/usuarios/page.tsx` | Gestão de usuários |
| `/versoes-aplicativo` | `app/(dashboard)/versoes-aplicativo/page.tsx` | Gestão de versões Android |

`app/(dashboard)/layout.tsx` aplica o `AdminShell` a todas as telas autenticadas. `app/not-found.tsx` e `app/error.tsx` fornecem respostas consistentes para rotas inexistentes e falhas inesperadas.

## BFF e sessão

Os Route Handlers em `app/api` formam a camada BFF do painel:

- `app/api/auth`: login, consulta de sessão e logout;
- `app/api/admin/users`: listagem e operações administrativas de usuários;
- `app/api/admin/app-versions`: versão ativa, histórico, cadastro e edição.

O login grava o JWT em cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção. O cliente recebe somente os dados necessários da conta. As rotas administrativas executam `requireAdminSession()` antes de acessar a API externa.

O `proxy.ts` realiza apenas o redirecionamento antecipado baseado na presença do cookie. Ele não substitui a validação completa de token e permissão feita nos Route Handlers e no carregamento da sessão.

## Features

Cada domínio pode possuir:

```text
features/<feature>/
|-- api/          # endpoints consumidos pelo navegador
|-- components/   # view e componentes do domínio
|-- server/       # validação e lógica exclusiva do servidor
|-- store/        # estado Zustand do domínio
|-- types/        # contratos TypeScript
`-- utils/        # formatação e validação puras
```

### `features/auth`

- formulário de login;
- estado da sessão e operações de entrada/saída;
- tratamento de respostas não autorizadas;
- tipos públicos da conta autenticada.

### `features/home`

- resumo de usuários;
- versão Android ativa;
- atalhos para as telas operacionais;
- falhas parciais independentes entre os domínios.

### `features/users`

O painel abre a lista na ordem padrão da API. A tabela permite ordenar por nome, perfil, acesso, último uso e data de bloqueio pelos cabeçalhos. Nos cards, o seletor oferece as mesmas opções e permite voltar à ordem padrão. A mudança mantém os filtros e retorna à primeira página. A API administrativa ordena o conjunto filtrado antes de paginar, com desempate pelo ID.

No desktop, erros de atualização da lista aparecem no espaço reservado ao rodapé, com uma ação de nova tentativa. Alterações no conteúdo das listagens de usuários e versões não disparam uma nova consulta de paginação quando a janela mantém as mesmas dimensões.

- listagem paginada no servidor com limite responsivo, busca global por nome ou e-mail e filtros globais de perfil e acesso;
- busca e filtros locais sobre a página carregada, com indicadores globais separados;
- indicadores globais de total, ativos, bloqueados e administradores, complementados pela contagem Premium filtrada no backend;
- modais de consulta e confirmação;
- revogação, liberação e exclusão;
- visualização de avatar.

### `features/app-versions`

- versão ativa e histórico;
- histórico paginado no servidor com limite responsivo, busca global por versão, código ou mensagem e filtro global de política, retornando à primeira página quando a consulta muda ou após uma publicação;
- cadastro e edição;
- validação no cliente e no servidor;
- confirmação de políticas restritivas;
- prévia do diálogo Android.

## Componentes compartilhados

`components/layout` contém `AdminShell`, `Header` e `Sidebar`.

`components/ui` contém os padrões reutilizáveis, entre eles:

- `Button`, `Input`, `Textarea` e `Switch`;
- `Card`, `Alert`, `MetricCard`, `PaginationControls` e `Toast`;
- `Modal`, `ConfirmationModal` e `ImagePreviewModal`;
- `DropdownSelect`, `ThemeToggle`, `UserAvatar` e `BrandMark`.

Antes de criar um componente, confirme se um padrão equivalente já existe nessa pasta.

## Estado

- estado de domínio: `features/<feature>/store`;
- estado global de interface: `store/`;
- estado estritamente local: `useState` no componente responsável.

As stores representam carregamento, erro, sucesso e envio. Requisições e mutações não devem ser duplicadas nos componentes.

## HTTP e erros

- `lib/api.ts`: Axios do navegador com base `/api`;
- `lib/server/backendApi.ts`: Axios exclusivo do servidor com `API_URL`;
- `lib/server/routeError.ts`: resposta padronizada do BFF;
- `lib/apiErrors.ts`: leitura segura de status e mensagens.

Não usar `fetch`, criar instâncias Axios dentro de componentes ou fixar a URL externa no código-fonte.

## Variáveis e dados sensíveis

`lib/env.ts` é o único ponto de leitura da variável `API_URL` e está marcado como `server-only`. Nenhuma credencial ou JWT deve utilizar `NEXT_PUBLIC_`, ser persistido em `localStorage` ou aparecer em respostas do BFF.

## Fluxo para uma nova feature

1. confirmar o endpoint e o contrato nos documentos da API;
2. criar tipos, API e store dentro da feature;
3. validar entrada não confiável também no servidor;
4. reutilizar componentes de `components/ui`;
5. criar uma página fina em `app`;
6. incluir a rota na navegação e na proteção quando necessário;
7. implementar loading, vazio, erro e sucesso;
8. validar teclado, mobile, tema claro e escuro;
9. executar `npm run lint`, `npm run typecheck` e `npm run build`.

As decisões obrigatórias continuam definidas em `docs/rules.md`.
