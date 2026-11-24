<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Automação de interface

Por orientação permanente do usuário em 24/11/2026, usar exclusivamente abas e APIs do navegador para interagir com interfaces. Não controlar o PC por APIs nativas, mouse/teclado do sistema ou captura de janelas, nem usar esse acesso como alternativa quando a conexão do navegador falhar. Consulte também `../AGENTS.md`, na raiz do monorepo.

# Regras obrigatórias do projeto

Antes de analisar, editar ou executar comandos, execute `npm run ai:context` dentro de `admin/`. Leia o conteúdo atual do `../AGENTS.md`, deste arquivo, de `docs/rules.md` e de `docs/mapeamento-arquitetura-features.md`, carregados pelo mapa `../project-rules.json`. Leia também os documentos específicos do fluxo afetado. As regras gerais e específicas são cumulativas. Falta de documento obrigatório impede prosseguir; não presumir regras nem ignorar a falha. Antes da entrega, revisar o diff contra essas instruções.

Commit e push somente quando autorizados pelo usuário, na `main`. Somente o usuário inicia, reinicia ou encerra o servidor da aplicação; não executar `npm run dev`, `next dev`, `npm start` ou equivalentes para subir o painel. Reutilizar o servidor existente e informar quando a validação visual depender de ele estar disponível. Testes, lint, tipos e builds finitos continuam permitidos.
