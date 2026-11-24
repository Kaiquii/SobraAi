# Guia da API para o painel administrativo SobraAi

## Objetivo

Este guia descreve a API atual do SobraAi para a criacao de um painel administrativo em Next.js. O documento separa o que ja esta implementado do que ainda exige novos endpoints no backend.

## Base da API e convencoes

```text
{API_URL}/api
```

- Bodies e respostas usam JSON, exceto upload de avatar, que usa `multipart/form-data`.
- Rotas protegidas recebem `Authorization: Bearer <token>`.
- O JWT atual dura 7 dias apos o login.
- Os papeis existentes sao `user` e `admin`.
- Datas retornadas pelo Go usam RFC 3339.
- Valores monetarios sao numeros JSON; o front formata Real somente na interface.
- Despesas, rendas e categorias usam barra final: `/api/expenses/`, `/api/incomes/`, `/api/categories/`.

## Login e sessao administrativa

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@exemplo.com",
  "password": "senha"
}
```

Resposta de sucesso:

```json
{
  "message": "Login realizado com sucesso!",
  "token": "jwt",
  "user": {
    "name": "Administrador",
    "email": "admin@exemplo.com",
    "role": "admin",
    "avatar_url": "",
    "access_blocked": false
  }
}
```

O painel deve permitir acesso somente quando `user.role === "admin"`.

| Status | Significado |
| --- | --- |
| `400` | Body invalido |
| `401` | E-mail ou senha incorretos |
| `403` | Conta bloqueada ou sem permissao administrativa |
| `429` | Muitas tentativas de login |
| `500` | Falha interna |

O backend bloqueia uma combinacao de e-mail e IP apos 5 falhas em 10 minutos, por 5 minutos. Em cada rota protegida, o backend valida o JWT, consulta o usuario no banco e bloqueia imediatamente usuarios com acesso revogado.

## Rotas administrativas implementadas

```text
DELETE /api/admin/users/:id
PATCH  /api/admin/users/:id/revoke-access
PATCH  /api/admin/users/:id/restore-access
PATCH  /api/admin/users/:id/promote-premium
PATCH  /api/admin/users/:id/revoke-premium

POST   /api/admin/app-version/android
PATCH  /api/admin/app-version/android/:version_code
GET    /api/admin/app-version/android/history
```

Todas exigem JWT com `role: "admin"`.

## Alerta de seguranca antes de publicar o painel

A listagem de usuarios atual fica em:

```http
GET /api/auth/users
Authorization: Bearer TOKEN
```

Ela exige JWT valido, mas **nao exige papel de administrador**. O front pode esconder a tela de usuarios de usuarios comuns, mas isso nao protege a rota: qualquer usuario autenticado ainda consegue chama-la diretamente.

Antes de publicar o painel, o backend deve adicionar `AdminMiddleware` nessa rota ou move-la para `GET /api/admin/users`.

# Funcionalidades do painel administrativo

## Usuarios

### Listar usuarios

```http
GET /api/auth/users?page=1&limit=20&search=maria&role=user&status=active
Authorization: Bearer TOKEN_ADMIN
```

Resposta:

```json
{
  "total": 2,
  "users": [
    {
      "id": 19,
      "name": "Maria Silva",
      "email": "maria@exemplo.com",
      "role": "user",
      "avatar_url": "",
      "access_blocked": false,
      "access_blocked_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

`page` começa em `1` e `limit` aceita valores entre `1` e `100`. `search` busca parcialmente por nome ou e-mail; `role` aceita `user`, `premium` ou `admin`; `status` aceita `active` ou `blocked`. Busca e filtros podem ser combinados, não diferenciam maiúsculas de minúsculas e alteram `total`, `pagination.total` e `pagination.total_pages` para representar todos os resultados encontrados.

No painel, a listagem de usuários usa `8` registros como limite inicial de segurança e, no desktop, ajusta esse valor pela altura fixa reservada à lista antes da primeira consulta. O cálculo usa a altura contratual da linha e nunca depende dos usuários retornados ou das linhas renderizadas. Os cinco indicadores são globais e não devem ser calculados somente com os registros da página atual. Total, ativos, bloqueados e administradores são carregados por `GET /api/admin/users/metrics`; o total de Premium usa a mesma listagem administrativa com `role=premium` e `limit=1`, sem baixar a lista completa de usuários. Busca por nome ou e-mail e filtros de papel e acesso devem ser processados no backend, com retorno à página `1` sempre que a consulta mudar.

| Campo | Uso no painel |
| --- | --- |
| `id` | Chave para acoes administrativas |
| `name` | Nome e busca local |
| `email` | Identificacao e busca local |
| `role` | `user`, `premium` ou `admin` |
| `avatar_url` | Avatar; string vazia significa sem foto |
| `access_blocked` | Badge de ativo/bloqueado |
| `access_blocked_at` | Data/hora do bloqueio ou `null` |

Limitações atuais da API:

- a ordenação de usuários no servidor usa `id` crescente;
- não possui data de criação de usuário;
- não possui detalhe administrativo por `id`.

### Gerenciar Premium

```http
PATCH /api/admin/users/:id/promote-premium
PATCH /api/admin/users/:id/revoke-premium
Authorization: Bearer TOKEN_ADMIN
```

As rotas não recebem body. Promover altera `user` para `premium`; remover devolve o perfil `user`. O painel atualiza somente a linha recebida na resposta e recarrega os indicadores globais, sem recarregar a lista. Quando um filtro de papel estiver ativo e o perfil atualizado não corresponder a ele, a linha deve ser removida localmente.

Hoje, Premium é apenas uma identificação administrativa para preparar futuras vantagens no aplicativo. Administradores não exibem ações de perfil.

### Revogar acesso

```http
PATCH /api/admin/users/:id/revoke-access
Authorization: Bearer TOKEN_ADMIN
```

Sem body. Resposta:

```json
{
  "message": "Acesso do usuario revogado com sucesso",
  "user": {
    "id": 19,
    "name": "Maria Silva",
    "email": "maria@exemplo.com",
    "role": "user",
    "access_blocked": true,
    "access_blocked_at": "2026-07-21T12:00:00Z"
  }
}
```

Regras:

- administrador nao pode bloquear a si mesmo;
- administrador nao pode bloquear outro administrador;
- usuario inexistente retorna `404`;
- nao administrador recebe `403`.

O usuario bloqueado nao consegue fazer login nem acessar qualquer rota protegida, mesmo com token valido. A UI deve usar modal de confirmacao e atualizar a tabela somente apos `200`.

### Liberar acesso

```http
PATCH /api/admin/users/:id/restore-access
Authorization: Bearer TOKEN_ADMIN
```

Sem body. A resposta possui o mesmo formato, com `access_blocked: false` e `access_blocked_at: null`. Mostrar a acao apenas para usuarios bloqueados.

### Excluir usuario

```http
DELETE /api/admin/users/:id
Authorization: Bearer TOKEN_ADMIN
```

Sem body. O backend nao permite excluir usuarios com `role: "admin"`.

A exclusao remove permanentemente, em transacao:

- usuario;
- despesas;
- rendas;
- categorias;
- conversas e mensagens do assistente;
- tokens de redefinicao de senha.

Depois tenta apagar o avatar. Resposta normal:

```json
{
  "message": "Usuario e todos os dados dele foram deletados com sucesso"
}
```

Se somente a foto falhar:

```json
{
  "message": "Usuario e dados deletados com sucesso, mas houve erro ao remover a foto de perfil",
  "warning": "detalhe tecnico"
}
```

Usar modal destrutivo com aviso claro de que dados financeiros e conversas nao poderao ser restaurados. Nao ha lixeira, soft delete, auditoria ou restauracao.

### Dashboard possivel hoje

Com a lista de usuarios, o painel pode calcular:

- total de usuarios;
- usuarios ativos;
- usuarios bloqueados;
- total de administradores;
- total de usuarios comuns;
- lista de bloqueados e data de bloqueio.

Nao existem dados para usuarios novos por periodo, crescimento, totais financeiros globais, conversas de terceiros, uso de IA, logs de login, volume de e-mails ou auditoria de acoes administrativas.

## Versoes do aplicativo Android

### Modelo

| Campo | Significado |
| --- | --- |
| `id` | Identificador interno |
| `platform` | Atualmente somente `android` |
| `latest_version_name` | Nome exibido, por exemplo `1.0.2` |
| `latest_version_code` | Codigo inteiro crescente, por exemplo `102` |
| `min_required_version_code` | Menor versao permitida sem atualizacao obrigatoria |
| `force_update` | Obriga atualizacao para todos abaixo da ultima versao |
| `play_store_url` | Link da Play Store |
| `message` | Mensagem para o usuario |
| `created_at`, `updated_at` | Datas de criacao e atualizacao |

Regra do Android:

- se `latest_version_code` for maior que a instalada, pode exibir aviso;
- atualizacao e obrigatoria quando `force_update` for `true`;
- tambem e obrigatoria quando a versao instalada for menor que `min_required_version_code`.

Exemplo: com `latest_version_code: 101` e `min_required_version_code: 101`, qualquer app abaixo de `101` precisa atualizar, mesmo com `force_update: false`.

### Versao ativa

Rota publica usada pelo Android:

```http
GET /api/app-version?platform=android
```

Sem `platform`, o backend usa `android`. Ela retorna a versao com maior `latest_version_code`.

### Historico

```http
GET /api/admin/app-version/android/history?page=1&limit=20&search=1.1&force_update=false
Authorization: Bearer TOKEN_ADMIN
```

Resposta:

```json
{
  "total": 2,
  "versions": [
    {
      "id": 2,
      "platform": "android",
      "latest_version_name": "1.0.2",
      "latest_version_code": 102,
      "min_required_version_code": 101,
      "force_update": false,
      "play_store_url": "https://play.google.com/store/apps/details?id=br.com.sobraai.app",
      "message": "Nova versao disponivel.",
      "created_at": "2026-07-21T12:00:00Z",
      "updated_at": "2026-07-21T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

O historico vem do maior para o menor `latest_version_code`.
Os mesmos parâmetros opcionais `page` e `limit` são aceitos, com limite máximo de `100` registros. `search` consulta nome, código ou mensagem da versão e `force_update` aceita explicitamente `true` ou `false`. O painel sempre utiliza o modo paginado e volta à primeira página depois de publicar uma nova versão.
No histórico filtrado, `total` continua representando todas as versões Android cadastradas, enquanto `pagination.total` e `pagination.total_pages` representam somente os resultados da consulta.
O histórico administrativo usa `5` versões como limite inicial de segurança e, no desktop, ajusta esse valor pela altura fixa reservada à listagem antes da primeira consulta. O cálculo não depende das versões retornadas nem das linhas renderizadas. Em telas maiores, mais versões são solicitadas para ocupar o espaço disponível sem criar rolagem. Busca por versão, código ou mensagem e filtro de política também devem ser processados no backend e reiniciar a paginação na página `1`.

### Criar versao

```http
POST /api/admin/app-version/android
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json
```

```json
{
  "latest_version_name": "1.0.2",
  "latest_version_code": 102,
  "min_required_version_code": 101,
  "force_update": false,
  "play_store_url": "https://play.google.com/store/apps/details?id=br.com.sobraai.app",
  "message": "Nova versao disponivel."
}
```

Retorna `201` com a versao criada.

Validacoes:

- aceita somente `android`;
- `latest_version_name` e `play_store_url` sao obrigatorios;
- `latest_version_code` deve ser maior que zero;
- `min_required_version_code` deve ser maior ou igual a zero;
- `min_required_version_code` nao pode ser maior que `latest_version_code`;
- mesma plataforma e codigo retornam `409`.

### Editar versao

```http
PATCH /api/admin/app-version/android/:version_code
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json
```

O body possui os mesmos campos do cadastro. O `latest_version_code` do body deve ser igual ao da URL. O codigo nao pode ser trocado; apenas nome, minimo exigido, obrigatoriedade, URL e mensagem podem ser corrigidos.

# Catalogo completo da API

## Autenticacao publica

| Metodo | Rota | Body | Descricao |
| --- | --- | --- | --- |
| `POST` | `/api/auth/request-register-code` | `email` | Envia codigo de cadastro de 6 digitos valido por 10 min. Limita 3 pedidos por e-mail e 5 por IP em 30 min. |
| `POST` | `/api/auth/register` | `name`, `email`, `password`, `code` | Cria usuario comum apos validar codigo. Retorna `user_id`, sem JWT. |
| `POST` | `/api/auth/login` | `email`, `password` | Retorna JWT e resumo do usuario. |
| `POST` | `/api/auth/forgot-password` | `email` | Envia codigo de redefinicao se a conta existir. A resposta e generica para nao revelar e-mails cadastrados. |
| `POST` | `/api/auth/reset-password` | `email`, `code`, `new_password` | Troca senha e invalida o codigo. |

Play Integrity e Turnstile estao apenas planejados e nao fazem parte dos bodies atuais.

## Perfil do usuario logado

Todas exigem JWT e atuam somente no proprio usuario.

| Metodo | Rota | Body | Resultado |
| --- | --- | --- | --- |
| `GET` | `/api/users/profile` | - | Retorna perfil do usuario logado. |
| `PATCH` | `/api/users/profile` | `name?`, `email?` | Atualiza nome/e-mail. |
| `PATCH` | `/api/users/profile/photo` | `multipart/form-data`, campo `photo` | Aceita JPG, JPEG, PNG ou GIF de ate 5 MB; retorna `avatar_url`. |
| `DELETE` | `/api/users/profile/photo` | - | Remove foto de perfil. |

Avatar local costuma ser servido publicamente em `/uploads/users/:id/avatar.jpg`.

## Categorias

| Metodo | Rota | Body/query | Resultado |
| --- | --- | --- | --- |
| `POST` | `/api/categories/` | `name` | Cria categoria do usuario. |
| `GET` | `/api/categories/` | - | Retorna `{ total, categories }`. |
| `PATCH` | `/api/categories/:id` | campos a alterar | Atualiza categoria do proprio usuario. Enviar apenas `name`. |
| `DELETE` | `/api/categories/:id` | - | Remove somente se nao houver despesa vinculada. |

## Despesas

| Metodo | Rota | Body/query | Resultado |
| --- | --- | --- | --- |
| `POST` | `/api/expenses/` | `amount`, `description`, `notes?`, `category_id?`, `payment_source?`, `date`, `type`, `installments?` | `Unica` cria uma linha; `Parcelada` cria parcelas; `Fixa` gera 120 meses. |
| `GET` | `/api/expenses/` | `month?`, `year?`, `type?` | Lista somente despesas do usuario. |
| `GET` | `/api/expenses/:id` | - | Busca uma despesa do usuario. |
| `PATCH` | `/api/expenses/:id` | campos e `update_future?` | Atualiza uma despesa e pode replicar futuras da serie. |
| `DELETE` | `/api/expenses/:id` | `delete_future=true?` | Remove uma ou atual/futuras da serie. |

Tipos aceitos: `Unica`, `Parcelada`, `Fixa`. Observacoes aceitam ate 500 caracteres.

Modelo retornado: `id`, `user_id`, `series_id`, `category_id`, `amount`, `description`, `notes`, `payment_source`, `date`, `month`, `year`, `type`, `installments`, `current_installment`.

## Rendas

| Metodo | Rota | Body/query | Resultado |
| --- | --- | --- | --- |
| `POST` | `/api/incomes/` | `source`, `amount`, `month`, `year`, `type?`, `repeat_future?` | Cria renda. |
| `GET` | `/api/incomes/` | `month?`, `year?` | Lista rendas do usuario. |
| `PATCH` | `/api/incomes/:id` | campos e `update_future?` | Atualiza renda e pode replicar futuras da mesma fonte. |
| `DELETE` | `/api/incomes/:id` | `delete_future=true?` | Remove uma ou atual/futuras da mesma fonte. |

Fontes aceitas: `Salario`, `Adiantamento`, `Renda Extra`. Tipos: `Unica`, `Fixa`.

Renda fixa de Salario/Adiantamento gera 60 meses. Renda Extra fixa so gera 60 meses quando `repeat_future` for `true`.

## Relatorios

Todas exigem JWT e usam somente dados do usuario autenticado. Nenhuma aceita `user_id`, portanto nao servem para o administrador analisar outra conta.

| Rota | Query | Retorno |
| --- | --- | --- |
| `GET /api/reports/summary` | `month`, `year` obrigatorios | Receitas, despesas, saldo e detalhamento por fonte. |
| `GET /api/reports/categories` | `year` obrigatorio, `month?` | Gastos por categoria e percentual. |
| `GET /api/reports/chart` | `year` obrigatorio | Doze meses com `income` e `expense`. |
| `GET /api/reports/yearly-summary` | `year` obrigatorio | `economia_total` e `media_mensal`. |
| `GET /api/reports/month-comparison` | `month`, `year`, `compare_month?`, `compare_year?` | Comparativo de meses, categorias, fontes, tipos e insights. |
| `GET /api/reports/installment-commitments` | `month?`, `year?`, `months?`, `include_current_month_as_paid?` | Compromissos de despesas parceladas. |

`month-comparison` compara com o mes anterior por padrao. `installment-commitments` usa mes atual e 12 meses por padrao; `months` aceita de 1 a 60.

## Assistente IA

Todas exigem JWT e sao exclusivas do usuario logado.

| Metodo | Rota | Body | Resultado |
| --- | --- | --- | --- |
| `POST` | `/api/assistant/chat` | `message`, `conversation_id?`, `history?` | Cria ou continua conversa. |
| `GET` | `/api/assistant/conversations` | - | Lista conversas do usuario. |
| `GET` | `/api/assistant/conversations/:id/messages` | - | Lista mensagens da conversa. |
| `DELETE` | `/api/assistant/conversations/:id` | - | Exclui conversa e mensagens. |

A resposta de chat pode conter `conversation_id`, `reply`, `tool_call`, `tool_result`, `error_code` e `retry_after_seconds`.

O assistente consulta apenas dados do proprio usuario e cria despesa somente apos confirmacao textual. Falhas de IA podem retornar HTTP `200` com `error_code: gemini_quota_exceeded` ou `gemini_unavailable`.

# Telas sugeridas no Next.js

```text
/login
/dashboard
/usuarios
/usuarios/:id
/versoes-aplicativo
/versoes-aplicativo/nova
/versoes-aplicativo/:versionCode/editar
```

## Tela de usuarios

Incluir:

- cards globais de total, ativos, bloqueados, administradores e Premium;
- busca por nome/e-mail;
- filtros por papel e status;
- tabela com avatar, nome, e-mail, papel, status e data de bloqueio;
- modais de revogar, liberar e excluir;
- feedback para `403`, `404` e `500`.

Nao incluir sem novos endpoints:

- editar outro usuario;
- alterar papel ou criar administrador;
- excluir administrador;
- consultar despesas/rendas de terceiros;
- consultar conversas de terceiros;
- restaurar usuario excluido.

## Tela de versoes

Incluir:

- card da versao mais recente;
- tabela de historico;
- formulario de nova versao;
- formulario de edicao;
- switch para `force_update`;
- validacao de `min_required_version_code`;
- preview da mensagem de atualizacao;
- link da Play Store;
- confirmacao antes de salvar configuracao que bloqueie versoes antigas.

# Tratamento de erros

Em geral, a API retorna:

```json
{
  "error": "Mensagem legivel"
}
```

| Status | Tratamento no front |
| --- | --- |
| `400` | Mostrar validacao no formulario |
| `401` | Encerrar sessao e redirecionar para login |
| `403` | Bloquear tela/acao e mostrar mensagem |
| `404` | Informar que o recurso nao existe mais |
| `409` | Informar conflito, como versao duplicada |
| `429` | Exibir limite temporario |
| `500` | Mostrar erro generico e permitir nova tentativa |

# Recomendacao de sessao no Next.js

Prefira guardar o JWT em cookie `httpOnly` controlado por uma camada server-side/BFF do Next.js, em vez de manter token duradouro em `localStorage`.

Use URL da API configurada por ambiente, por exemplo:

```text
API_URL=https://api.seudominio.com
```

No painel administrativo, `API_URL` é lida somente no servidor pelo BFF do Next.js. Ela não deve usar `NEXT_PUBLIC_`.

Nunca expor no navegador JWT secret, credenciais SMTP, chaves de Cloudflare, chaves de IA ou outros segredos de backend.

# Checklist de integracao

- [ ] Administrador possui `role: "admin"` no banco.
- [ ] Login bloqueia visualmente usuarios sem papel administrativo.
- [ ] Chamadas administrativas enviam Bearer token.
- [x] A decisão de manter a listagem de usuários com o comportamento atual foi aceita pelo responsável do projeto.
- [ ] Bloqueio e exclusao possuem confirmacao e feedback.
- [ ] Exclusao explica que dados financeiros e conversas sao removidos definitivamente.
- [ ] Formulario de versoes valida codigos e explica atualizacao forcada.
- [ ] Front trata `401`, `403`, `404`, `409`, `429` e `500`.
- [ ] Painel nao tenta manipular dados de terceiros com endpoints de usuario final.
