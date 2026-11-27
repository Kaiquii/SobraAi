# Regras obrigatórias do projeto

## Contexto obrigatório do monorepo

Antes de analisar, editar ou executar comandos, execute `npm run ai:context` na pasta `admin/`. O mapa `../../project-rules.json` carrega o conteúdo atual do [AGENTS.md geral](../../AGENTS.md), do [AGENTS.md do admin](../AGENTS.md), destas regras e do [mapa de arquitetura](mapeamento-arquitetura-features.md). As instruções são cumulativas; leia também os documentos específicos do fluxo. Carregue as regras dos demais projetos se o escopo os envolver. Documento obrigatório ausente, vazio ou ilegível bloqueia a carga. Revise o diff contra as regras antes da entrega.

Commit/push somente quando autorizados pelo usuário; iniciar e controlar o servidor da aplicação é responsabilidade exclusiva dele.

Este documento define os padrões que devem ser considerados antes de qualquer análise, implementação ou refatoração. Toda alteração deve preservar as decisões abaixo e permanecer alinhada aos demais documentos da pasta `docs`.

## Ajustes de API

Siga as [regras comuns do SobraAi](../../docs/rules.md). Quando o painel depender de uma mudança na API, faça e valide o ajuste no backend Go antes de integrar o BFF e a interface.

## 1. Arquitetura por módulos e features

- Organizar o projeto por domínios de negócio dentro de `features`.
- Manter as páginas de `app` pequenas, responsáveis apenas por rotas, layouts, metadata, redirects e composição das views.
- Cada feature deve criar apenas as camadas necessárias entre `components`, `api`, `store`, `types` e `utils`.
- Manter as chamadas HTTP da feature em sua pasta `api` e os tipos do domínio em sua pasta `types`.
- Colocar em `components/ui`, `components/layout`, `lib` ou `store` da raiz somente o que for realmente compartilhado.
- Sempre procurar e utilizar componentes reutilizáveis existentes antes de criar uma nova implementação.
- Todo novo componente deve ser reutilizável, ter responsabilidade clara e evitar regras específicas que impeçam seu uso em contextos equivalentes.
- Não duplicar componentes, comportamentos ou estilos que já existam no projeto.
- Reutilizar também tipos, utilitários e estilos existentes antes de criar novos.
- Evitar dependências circulares, abstrações prematuras e refatorações fora do escopo solicitado.
- Usar o alias `@/` para imports internos em vez de caminhos relativos longos.

### Layout administrativo

- O painel autenticado deve possuir um header compartilhado entre as rotas administrativas.
- O botão responsável por abrir a navegação deve permanecer no header.
- O header deve apresentar a identidade do usuário autenticado, o botão de troca de tema e o botão de abertura da sidebar.
- A identidade visual do header deve funcionar como atalho para a página inicial, que não deve ocupar um item permanente na navegação da sidebar.
- A página inicial deve apresentar somente uma visão geral compacta; os fluxos completos de usuários e versões pertencem às respectivas telas da sidebar.
- **Regra fixa da home no desktop:** em telas a partir de `1024px`, a rota `/home` deve ser uma única tela, sem exibir nem gerar barra de rolagem vertical ou horizontal. Todo o conteúdo deve caber na área visível da janela; quando necessário, reduzir espaçamentos e dimensões dos blocos sem remover informações.
- **Regra fixa da home no mobile:** abaixo de `1024px`, permitir rolagem vertical quando necessária para preservar legibilidade, espaçamento e áreas de toque. A home nunca deve gerar rolagem horizontal.
- **Regra fixa das listagens no desktop:** no estado normal, as rotas `/usuarios` e `/versoes-aplicativo` devem exibir cabeçalho, conteúdo paginado e controles dentro de uma única tela, sem gerar rolagem vertical ou horizontal. Calcular o limite exclusivamente pela altura da área fixa reservada à listagem e pela altura contratual da linha de cada módulo. O conteúdo retornado, a quantidade de linhas renderizadas e o rodapé nunca podem participar dessa medição.
- Recalcular o limite responsivo ao redimensionar a janela, trocar entre monitores com resoluções ou escalas diferentes, alterar a orientação, restaurar a aba ou retornar o foco. Se houver uma requisição em andamento, preservar e aplicar o último limite calculado quando ela terminar.
- **Estabilidade visual das listagens:** no desktop, reservar desde o primeiro render a área completa da listagem e do rodapé de paginação. O limite deve ser definido em `useLayoutEffect`, antes da pintura, e gravado no estado antes da primeira consulta. Mudanças nos dados, buscas, filtros e troca de página não recalculam a capacidade. Somente mudanças reais de viewport podem recalculá-la. Não animar altura, largura ou posição; durante atualizações, usar no máximo uma transição curta de opacidade e respeitar `prefers-reduced-motion`.
- As tabelas administrativas compartilham a altura contratual desktop de `48px` por linha, definida por `ADMIN_TABLE_ROW_HEIGHT` em `lib/pagination.ts`. O CSS das linhas deve respeitar exatamente esse valor para aproveitar toda a área disponível sem divergência entre cálculo e renderização.
- Depois de calcular quantas linhas de `48px` cabem, distribuir igualmente entre elas o pequeno restante vertical da área reservada. Essa distribuição altera somente a altura visual das linhas; não pode mudar o limite, disparar outra consulta ou depender da quantidade retornada.
- **Regra fixa das listagens no mobile:** permitir rolagem vertical para preservar leitura e áreas de toque, sem gerar rolagem horizontal.
- O botão do usuário deve abrir um menu com nome, e-mail, perfil administrativo e ação de logout.
- O botão do usuário deve exibir `avatar_url` somente para visualização e usar as iniciais como fallback quando a imagem não existir ou falhar.
- Ao clicar diretamente na foto do usuário, abrir uma visualização ampliada em modal acessível, sem oferecer edição, upload ou remoção.
- Logout, exclusão, revogação de acesso e outras ações destrutivas ou sensíveis devem usar o componente reutilizável de confirmação antes de executar a operação.
- A rota `/home` deve usar aproximadamente 84% da largura disponível em telas grandes, limitada a `1600px`.
- Telas de consulta e manipulação de dados devem aproveitar praticamente toda a largura disponível no desktop, mantendo uma margem lateral segura de aproximadamente `1rem`; no mobile, devem ocupar toda a largura com o padding necessário para não encostar nas bordas.
- A sidebar deve ser flutuante, sobreposta ao conteúdo e fechada por padrão.
- A sidebar não deve reservar largura permanente nem deslocar o conteúdo quando estiver fechada.
- A navegação deve continuar acessível por teclado e possuir fechamento por botão, backdrop e tecla `Escape`.
- Toda rolagem visível no sistema deve usar a scrollbar global personalizada de `app/globals.css`, com cores adequadas aos temas claro e escuro e sem os botões nativos das extremidades.

## 2. Gerenciamento de estado com Zustand

- Usar Zustand para estados globais, estados compartilhados entre componentes e operações pertencentes ao domínio de uma feature.
- Stores específicas devem permanecer dentro de `features/<feature>/store`.
- A pasta `store` da raiz deve conter somente estados usados por toda a aplicação.
- Usar `useState` para estados visuais estritamente locais, como modal aberto, aba selecionada ou valor temporário de um campo.
- Toda store assíncrona deve representar adequadamente estados de carregamento, envio, sucesso, vazio e erro.
- Componentes não devem concentrar regras de negócio ou duplicar operações já coordenadas por uma store.

## 3. Tema claro e escuro

- Toda nova interface deve ser implementada e validada nos temas claro e escuro.
- Gerenciar a preferência de tema com Zustand por meio do estado `isDark`.
- Aplicar ou remover a classe `dark` no elemento raiz da aplicação de acordo com `isDark`.
- Usar as variantes `dark:` do Tailwind CSS para definir os estilos do tema escuro.
- Manter cores, contraste, bordas, sombras, ícones, gráficos, overlays e estados interativos legíveis nos dois temas.
- Não corrigir um tema causando regressão visual no outro.
- Evitar flashes de tema incorreto durante o carregamento e a hidratação da aplicação.

## 4. Transições e animações

- Não usar `transition`, `transition-all`, `transition-colors`, classes `duration-*` ou transições de propriedades visuais que atrasem ou prejudiquem a troca de tema.
- Não animar cores, fundos, bordas ou sombras durante a alternância entre os temas.
- Animações de interação podem usar somente propriedades que não prejudiquem a troca de tema, como `transform` e `opacity`.
- Toda animação deve respeitar a preferência do usuário por movimento reduzido quando aplicável.

## 5. Requisições HTTP com Axios

- Usar Axios em todas as integrações REST HTTP realizadas pelo código da aplicação.
- Não usar `fetch`, direta ou indiretamente, para consumir a API REST.
- Centralizar a configuração do Axios em `lib/api.ts`, incluindo URL-base, headers, autenticação, timeout e interceptors.
- Componentes não devem conter URLs de endpoints nem criar instâncias próprias do Axios.
- Cada feature deve encapsular seus endpoints em `features/<feature>/api`.
- Preservar cancelamento, timeout, tratamento padronizado de erros e estados de carregamento quando uma integração for criada ou alterada.
- Listagens com suporte a paginação no backend devem enviar `page` e o limite calculado para a área disponível, preservar os metadados recebidos e recarregar a página atual após mutações. Ao cadastrar um item ordenado como mais recente ou mudar o limite responsivo, voltar para a primeira página.
- Totais, buscas e filtros de listagens paginadas sempre representam o conjunto completo. Busca e filtros devem ser enviados ao backend, reiniciar a consulta na página `1` e nunca operar somente sobre os registros da página carregada. Não baixar a coleção completa no front-end para simular esse comportamento.
- Tratar adequadamente os status `400`, `401`, `403`, `404`, `409`, `429` e `500` conforme o contrato da API.
- O back-end continua sendo a autoridade final para autenticação e autorização, mesmo quando a interface oculta rotas ou ações.
- Todo Route Handler administrativo deve revalidar a sessão e a permissão no servidor; a verificação antecipada do `proxy.ts` nunca deve ser tratada como autorização suficiente.
- Respostas `5xx` do BFF devem retornar uma mensagem genérica e segura, sem repassar detalhes internos, stack traces ou mensagens técnicas do backend ao navegador.
- Rotas do BFF que tratam autenticação ou dados administrativos devem usar `Cache-Control: no-store`; os cabeçalhos globais de segurança definidos em `next.config.ts` devem ser preservados.

## 6. Variáveis de ambiente e segredos

- Não fixar URLs-base, tokens, credenciais ou identificadores configuráveis no código-fonte.
- Armazenar configurações locais e segredos em arquivos `.env` apropriados ao ambiente.
- Nunca versionar `.env`, `.env.local`, tokens, senhas, JWTs ou outros segredos.
- Manter no repositório apenas um `.env.example`, sem valores sensíveis, documentando todas as variáveis obrigatórias.
- Documentar novas variáveis também no `README.md`.
- Centralizar a leitura e a validação das variáveis de ambiente em um único módulo de configuração.
- Nunca usar o prefixo `NEXT_PUBLIC_` em tokens, credenciais ou qualquer valor que deva permanecer no servidor.
- Somente variáveis que podem ser expostas publicamente no navegador podem usar o prefixo `NEXT_PUBLIC_`.

## 7. Responsividade e qualidade da interface

- Toda implementação de front-end deve funcionar corretamente no desktop e no mobile.
- Todo texto exibido na interface deve ser revisado quanto à gramática, ortografia, acentuação, pontuação e clareza em português do Brasil.
- Manter consistência de termos, títulos, mensagens, ações e capitalização em todas as telas.
- Não publicar textos provisórios, abreviações confusas ou mensagens sem acentuação adequada.
- Considerar textos longos, quebras de linha, áreas de toque, menus, tabelas, modais, gráficos e estados de carregamento em telas pequenas.
- Não permitir rolagem horizontal acidental, conteúdo cortado ou sobreposição incoerente.
- Controles interativos devem possuir foco visível, nome acessível e área de toque adequada.
- Todo botão de ação que executa uma operação, abre ou fecha modal, menu ou sidebar, envia formulário ou altera estado deve apresentar `cursor: pointer` quando estiver habilitado.
- Aplicar o cursor de ação somente a elementos `<button>` e controles acessíveis que realmente representem botões por meio de `role="button"`. Botões desabilitados devem usar `cursor: not-allowed` e nunca aparentar estar disponíveis.
- Dropdowns, campos de formulário e opções de seleção não devem usar `cursor: pointer`. O `components/ui/DropdownSelect.tsx` é uma exceção explícita mesmo utilizando `<button>` internamente por acessibilidade e deve manter `cursor: default` no gatilho e nas opções.
- Não aplicar `cursor: pointer` em textos, cards informativos ou contêineres que não possuam uma ação real associada.
- Usar exclusivamente ícones da biblioteca `lucide-react` nos controles e elementos de interface. Não misturar bibliotecas de ícones, emojis, caracteres Unicode ou SVGs desenhados manualmente para representar ações. Imagens de marca, avatares e ilustrações não são consideradas ícones de interface.
- Todo dropdown de seleção deve reutilizar `components/ui/DropdownSelect.tsx`, com menu flutuante próprio, navegação por teclado, posicionamento adaptado ao espaço da janela e estilos para os temas claro e escuro. Não usar o `<select>` nativo do navegador em novas interfaces.
- Mensagens temporárias de sucesso ou erro após ações devem reutilizar `components/ui/Toast.tsx`, aparecer no canto inferior direito no desktop e centralizadas junto à borda inferior no mobile, sem bloquear o conteúdo principal.
- Falhas que impedem o carregamento inicial de uma área devem usar o estado compartilhado `components/ui/LoadErrorState.tsx`: superfície neutra integrada à página, ícone de alerta discreto, explicação curta e ação de nova tentativa. Evitar faixas vermelhas de largura total para esse tipo de erro.
- O toast deve usar superfície sólida com cor semântica e alto contraste, sem transparência que permita confusão visual com tabelas, cards ou outros elementos abaixo dele.
- O toast deve permanecer em uma camada elevada, com `z-index` superior ao de dropdowns e modais, e desaparecer automaticamente após alguns segundos.
- Todo diálogo deve reutilizar `components/ui/Modal.tsx`; não criar overlays, cabeçalhos, botões de fechamento ou mecanismos de foco paralelos dentro das features.
- Exclusão, revogação, liberação de acesso, logout e outras decisões sensíveis devem reutilizar `components/ui/ConfirmationModal.tsx`. O padrão visual deve conter contexto da ação, descrição objetiva da consequência, destaque semântico coerente (`danger`, `warning`, `success` ou `neutral`) e ações claramente nomeadas.
- Modais de confirmação devem manter o botão seguro em foco inicial, impedir fechamento durante o envio, funcionar por teclado e adaptar conteúdo e botões ao mobile. A cor vermelha é exclusiva para ações permanentes ou destrutivas; ações reversíveis de bloqueio devem usar aviso em âmbar.
- Modais de consulta devem organizar identidade, metadados e situação em blocos legíveis, informar explicitamente quando forem somente leitura e não exibir controles que sugiram edição quando ela não estiver disponível.
- Formulários em modais devem priorizar uma composição compacta que caiba na área visível do desktop sem gerar rolagem interna; conteúdo complementar, como prévias, deve ser opcional e não competir com os campos principais.
- Campos de texto multilinha dentro de modais devem ter altura limitada e não permitir redimensionamento livre que ultrapasse os limites do diálogo.
- Toda funcionalidade assíncrona deve apresentar estados de carregamento, sucesso, vazio e erro.
- Preservar a identidade visual existente e não redesenhar componentes fora do escopo solicitado.

## 8. Validação antes de concluir

- **Servidor local sob controle do desenvolvedor:** o agente não deve iniciar, reiniciar nem manter em execução o frontend (`npm run dev`, `next dev` ou equivalente), inclusive para validação visual. O desenvolvedor é responsável por executar o servidor local e controlar a porta `3000`. Para validar alterações, reutilizar somente uma instância que já esteja em execução; se ela não existir, limitar-se às verificações estáticas e informar que a validação visual depende do servidor iniciado pelo desenvolvedor.
- Confirmar que todas as regras deste documento foram respeitadas.
- Executar o ESLint e a verificação do TypeScript.
- Executar a build de produção quando a alteração afetar código, configuração ou dependências.
- Validar visualmente desktop, mobile, tema claro e tema escuro quando houver mudança de interface.
- Confirmar que as integrações utilizam Axios e que o estado compartilhado utiliza Zustand.
- Não considerar a tarefa concluída enquanto houver erros conhecidos relacionados à alteração.
