# Regras comuns do SobraAi

## Documentação global

Mantenha novas regras e outros documentos Markdown globais em `docs/`. Na raiz ficam o `README.md` e o ponto de entrada `AGENTS.md`.

## Como usar o contexto do harness

1. Identifique os projetos que a tarefa afeta. Inclua o backend se houver mudança no contrato da API.
2. Carregue o contexto obrigatório conforme o [AGENTS.md do monorepo](../AGENTS.md). As regras comuns e locais são cumulativas. Carregue o contexto de qualquer projeto acrescentado ao escopo antes de atuar nele.
3. Use `node scripts/project-rules.mjs --index --project <projeto>` para localizar os documentos obrigatórios em ordem de leitura. Para ver vários projetos, repita `--project`. O carregamento completo é obrigatório.
4. Consulte os documentos e os fontes do fluxo afetado. Comece pelo mapa do projeto para encontrar o código e pelos contratos para verificar os consumidores.
5. Revise o diff com as regras carregadas, execute as verificações aplicáveis e registre o que passou e as lacunas.

| Projeto | Onde começar após carregar as regras |
| --- | --- |
| Web | [Arquitetura](../web/docs/project-architecture.md), [contrato da API](../web/docs/backend-api-contract.md) e [paridade Android](../web/docs/android-parity-harness.md) para fluxos Web móveis |
| Admin | [Mapa de features](../admin/docs/mapeamento-arquitetura-features.md) para interface, stores e BFF |
| Backend | [Comandos do harness](../backend/.agents/commands.md) e [checklist de revisão](../backend/.agents/review-checklist.md) para implementação e validação |
| Mobile | [Mapa do projeto](../mobile/docs/ai-project-map.md), [fluxo de trabalho](../mobile/docs/ai-workflow.md) e [harness de testes](../mobile/docs/test-harness.md) para Android e iOS |

## Ajustes de backend antes do frontend

Quando uma tarefa de Web, Admin ou Mobile depender de uma mudança nos dados, no comportamento ou no contrato da API, implemente e valide a mudança correspondente no backend antes de integrar o frontend. Carregue as regras dos projetos envolvidos e preserve a compatibilidade com os demais consumidores.

O frontend deve consumir a API para operações cuja correção depende dos dados ou das regras do servidor. São proibidos contornos como simular respostas ausentes, duplicar regras de negócio do backend ou baixar todas as páginas para reproduzir filtros e ordenação que a API deve aplicar antes de paginar.

Na revisão do harness, confirme onde a operação foi implementada, como os clientes consomem o contrato e quais testes cobrem a integração. Se houver um impedimento concreto para ajustar a API, registre a dependência e o que ficou pendente.
