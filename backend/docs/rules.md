# Regras Do Projeto

## Contexto obrigatório do monorepo

Antes de analisar, editar ou executar comandos, execute `go run ./cmd/harness -mode context` dentro de `backend/`. O mapa `../../project-rules.json` inclui o [AGENTS.md geral](../../AGENTS.md), o [AGENTS.md do backend](../AGENTS.md), estas regras e os comandos/checklist em `.agents/`. O harness inclui o conteúdo atual desses documentos no prompt do implementador e do revisor. Documento obrigatório ausente, vazio ou ilegível impede a execução; não supor regras nem retirar uma entrada para passar. Leia também os contratos e documentos específicos do fluxo. Ampliação do escopo para outro projeto exige carregar suas regras antes de atuar nele. Antes da entrega, revisar o diff contra as regras carregadas.

Commit/push somente quando autorizados pelo usuário; servidores da aplicação são iniciados e controlados por ele. Comandos finitos de testes, build e contexto não iniciam o servidor da aplicação.

## Git: Sempre Na Main

- Nao criar novas branches para nenhuma tarefa, teste, deploy, harness ou subagente,
  incluindo branches temporarias e prefixos como `codex/`.
- Trabalhar no checkout atual da `main`; todo commit e push autorizado deve ocorrer
  nessa branch. Nao desenvolver em branches auxiliares por worktree ou outro checkout.
- Verificar `git branch --show-current` antes de alterar arquivos e antes de commit/push.
  O resultado deve ser `main`; outra branch ou detached HEAD interrompe mutacoes.
- Preservar o estado se houver divergencia. Nao trocar automaticamente de branch,
  descartar ou guardar alteracoes para contornar a regra. Informar a pendencia.
- Esta politica nao autoriza remover branches existentes, nem fazer commit/push
  sem autorizacao do usuario.

## VM E Producao

- Todo trabalho deve ser realizado somente no projeto local por padrao.
- Nunca conectar na VM, enviar arquivos, executar comandos remotos, alterar configuracoes, manipular containers, acessar o banco de producao, reiniciar a API ou realizar deploy sem autorizacao explicita do usuario para aquela operacao.
- O fornecimento de IP, chave SSH, credenciais ou acesso anterior nao representa autorizacao permanente.
- Pedidos como `implementar`, `corrigir`, `alinhar`, `testar`, `verificar` ou `pode fazer` autorizam apenas alteracoes locais, salvo quando o usuario mencionar explicitamente que autoriza a acao na VM ou em producao.
- Antes de qualquer acao na VM, explicar exatamente o que sera executado, quais servicos podem ser afetados e qual sera o procedimento de rollback. Aguardar confirmacao explicita antes de continuar.
- Toda autorizacao para a VM e limitada ao escopo informado e termina quando aquela operacao for concluida. Uma nova alteracao ou um novo deploy exige uma nova autorizacao.
- Nunca interpretar uma autorizacao para backup, auditoria, migration ou consulta como permissao para publicar uma imagem, recriar containers ou alterar a API em producao.
- Depois de concluir alteracoes locais, entregar os comandos ou o procedimento para o usuario realizar o deploy manualmente, a menos que ele autorize explicitamente o deploy pela ferramenta.
- Em caso de duvida sobre o alcance da autorizacao, parar e pedir confirmacao. Nao executar a acao remota por inferencia.

## Criterio De Conclusao Para Producao

- Nunca considerar uma funcionalidade pronta, concluida ou apta para deploy apenas porque o fluxo principal foi implementado.
- Antes de declarar conclusao, revisar tambem criacao, consulta, edicao, exclusao, transicoes entre estados, compatibilidade com dados existentes, relatorios, exportacoes e integracoes afetadas.
- Validar que nenhuma operacao de edicao deixa dados financeiros inconsistentes. Em especial, qualquer alteracao de valor, fonte de pagamento ou lista relacionada deve preservar os totais e ocorrer de forma transacional.
- Executar testes automatizados relevantes e registrar com clareza quando uma verificacao nao puder ser concluida. Um teste que nao foi executado ou que expirou nao e uma aprovacao.
- Quando houver alteracao de banco, confirmar a migration, a compatibilidade com dados antigos, o procedimento de backup e o plano de rollback antes de recomendar deploy.
- Se houver uma lacuna conhecida, informar explicitamente que a funcionalidade ainda nao esta pronta para producao e corrigir ou obter uma decisao do usuario antes de recomendar a publicacao.
