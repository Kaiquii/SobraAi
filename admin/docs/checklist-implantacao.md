# Checklist de implantação

Este checklist deve ser concluído antes de cada publicação do SobraAi Admin. A conclusão técnica da Fase 7 não autoriza o deploy.

## 1. Ambiente

- [ ] Definir `API_URL` no ambiente de produção sem o prefixo `NEXT_PUBLIC_`.
- [ ] Confirmar que a URL utiliza HTTPS e aponta para a API correta.
- [ ] Confirmar que nenhum `.env`, token, senha ou JWT foi versionado.
- [ ] Usar uma versão do Node.js compatível com o Next.js 16.

## 2. Segurança e sessão

- [ ] Validar login com administrador ativo.
- [ ] Validar bloqueio de conta sem papel administrativo.
- [ ] Validar retorno ao login com token ausente, inválido e expirado.
- [ ] Confirmar que o JWT existe somente em cookie `HttpOnly`, `Secure` em produção e `SameSite=Lax`.
- [ ] Validar logout e remoção da sessão.
- [ ] Confirmar que cada Route Handler administrativo revalida autenticação e autorização.
- [ ] Confirmar CSP, proteção contra enquadramento, políticas do navegador e `Cache-Control: no-store` nas rotas `/api`.

## 3. Fluxos funcionais

- [ ] Carregar a home sem indicadores fictícios.
- [ ] Buscar e filtrar usuários.
- [ ] Visualizar conta e avatar.
- [ ] Revogar e liberar acesso com confirmação.
- [ ] Excluir uma conta de teste com confirmação definitiva.
- [ ] Consultar versão ativa e histórico Android.
- [ ] Visualizar e editar uma versão de teste.
- [ ] Publicar uma versão de teste somente quando a alteração estiver autorizada.
- [ ] Validar mensagens para `400`, `401`, `403`, `404`, `409`, `429` e falhas inesperadas.

## 4. Interface e acessibilidade

- [ ] Testar desktop e mobile nos temas claro e escuro.
- [ ] Confirmar ausência de rolagem horizontal e barras internas desnecessárias.
- [ ] Percorrer login, header, sidebar, filtros, tabelas e modais somente pelo teclado.
- [ ] Confirmar foco visível, retorno de foco e fechamento por `Escape`.
- [ ] Confirmar nomes acessíveis e áreas de toque adequadas.
- [ ] Revisar gramática, acentuação, capitalização e textos longos.

## 5. Qualidade técnica

- [ ] Executar `npm ci` em um ambiente limpo.
- [ ] Executar `npm run lint`.
- [ ] Executar `npm run typecheck`.
- [ ] Executar `npm run build`.
- [ ] Executar `npm audit` e avaliar qualquer ocorrência antes do deploy.
- [ ] Testar a build com `npm run start`.

## 6. Publicação e retorno

- [ ] Registrar a versão ou o commit que será publicado.
- [ ] Obter autorização explícita do responsável pelo projeto.
- [ ] Confirmar plano de retorno para a versão anterior.
- [ ] Após o deploy, repetir login, home, usuários, versões e logout no domínio de produção.
- [ ] Monitorar erros da aplicação e da API após a publicação.
