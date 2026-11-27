# Autorização para commit e push

Ao concluir uma tarefa, deixe as alterações no diretório de trabalho para o usuário revisar e agrupar. Preserve o que já estiver no índice do Git.

- Faça **commit** somente se o usuário pedir explicitamente que você faça o commit das alterações da tarefa atual.
- Faça **push** somente se o usuário pedir explicitamente que você envie os commits da tarefa atual. Um único pedido pode autorizar as duas operações se mencionar ambas.
- Pedidos de implementação, teste, correção, deploy, acesso à VM ou uma autorização genérica como “pode fazer tudo” não autorizam `git add`, `git commit` ou `git push`. Se a publicação depender dessas operações, explique a dependência e solicite a autorização específica antes de executá-las.
- Uma autorização vale para as operações e as alterações indicadas pelo usuário. Mudanças posteriores ou outra tarefa precisam da sua própria autorização. Um pedido de sugestão de mensagem de commit pede somente o texto.
- Para juntar ou substituir commits já publicados por meio de reescrita, peça autorização explícita para alterar o histórico remoto.

As operações autorizadas seguem a política da `main` do [AGENTS.md](../AGENTS.md#git-e-preservação).
