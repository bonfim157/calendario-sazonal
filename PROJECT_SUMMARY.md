PROJECT SUMMARY — Calendário Sazonal (Next.js port)

Resumo rápido
------------
Este documento registra tudo que foi feito na migração do projeto original (SPA) para um app Next.js com um banco de dados simulado (lowdb), APIs, autenticação por JWT em cookie e deploy na Vercel. Está organizado para que seja possível retomar o trabalho facilmente.

Estado atual
------------
- Código Next.js (TypeScript, App Router) em: C:\Users\RAFAELFERREIRABONFIM\calendario-next
- Deploy conectado ao GitHub: push para a branch main. Vercel está configurado, mas a última implantação falhou porque o Root Directory do projeto no Vercel estava apontando para a pasta errada.
- O root agora foi alterado no código para redirecionar para /dashboard (app/page.tsx).
- Banco: lowdb com arquivo data/db.json (simulado). No Vercel, filesystem é efêmero — não use lowdb em produção.

Principais arquivos alterados / adicionados
-----------------------------------------
- app/page.tsx — agora redireciona para /dashboard (roteamento root)
- app/login/page.tsx — tela de login
- app/dashboard/page.tsx — carrega LegacyApp
- app/components/LegacyApp.tsx — layout antigo portado para Next.js
- app/legacy.css — estilos portados
- app/api/auth/login/route.ts — autenticação (JWT, cookie)
- app/api/auth/logout/route.ts
- app/api/auth/validate/route.ts
- app/api/events/route.ts and app/api/events/[id]/approve/route.ts
- app/api/chat/route.ts, app/api/schedule/route.ts, app/api/seed/route.ts
- lib/db.ts — lowdb adapter (data/db.json)
- data/db.json — seed/demo data (users, events, messages)
- middleware.ts — proteção simples para /dashboard
- README_DEPLOY.md & README.md — documentação e notas

Credenciais demo (seed)
-----------------------
- Usuario demo: prof.rafael
- Senha: prof123
(Usuários são criados pelo endpoint /api/seed. Em produção, desabilitar o seed.)

Como rodar localmente
---------------------
1. Abrir terminal no diretório do app Next.js:
   cd C:\Users\RAFAELFERREIRABONFIM\calendario-next
2. Instalar dependências:
   npm install
3. Rodar em desenvolvimento:
   npm run dev
4. Rodar build (testar o que Vercel faz):
   npm run build
5. Testar seed (apenas em dev):
   curl -X POST http://localhost:3000/api/seed
6. Login: POST para /api/auth/login ou usar a UI /login

Problema observado no deploy
----------------------------
- Erro por npm run build não encontrar package.json porque, no repositório principal, a app Next.js foi colocada dentro de uma subpasta (calendario-next). Solução rápida:
  - Ajustar Root Directory no painel da Vercel para "calendario-next" (Settings → Git → Root Directory) e redeploy.
  - Alternativa (mais estruturada): mover o conteúdo do Next.js para a raiz do repositório e ajustar .gitignore, CI e scripts.

Como ajustar o Root Directory na Vercel (passos rápidos)
--------------------------------------------------------
1. Vercel → Projects → selecione o projeto (calendario-sazonal).
2. Settings → Git → Build & Development Settings.
3. Em Root Directory defina: calendario-next
4. Salve e clique em Redeploy na página de Deployments.

Variáveis de ambiente necessárias (Vercel)
-----------------------------------------
- JWT_SECRET — string forte para assinar JWTs (não deixar default dev_secret_change_me).
- ENABLE_SEED — colocar false em produção para desabilitar endpoint /api/seed.
- (Opcional) MONGODB_URI — se migrar para MongoDB, presente na lib de migração futura.

Limitações e riscos
-------------------
- lowdb grava em arquivo local (data/db.json). Em Vercel (serverless), o filesystem é efêmero: dados não persistem entre instâncias ou após deploy.
- /api/seed atualmente público dependendo de ENABLE_SEED. Certifique-se de desativar em produção.
- Middleware usado para proteção é simples; revisar para uso com rotating tokens, refresh tokens, e proteção de rotas server-side.

Sugestões prioritárias para quando retomar
-----------------------------------------
1. Migrar para banco real (MongoDB Atlas free tier): criar cluster M0, gerar MONGODB_URI e implementar lib/db-mongo.ts + modelos Mongoose. Fazer script de migração dos dados do lowdb.
2. Remover data/db.json do repositório (.gitignore) depois da migração e rota seed segura.
3. Implementar UI de criação/edição de eventos com formulários (atualmente ações simples/alert).
4. Implementar página de gestão (aprovação) e logs de auditoria.
5. Substituir polling do chat por solução em tempo real (Pusher, Supabase, WebSockets) se necessário.

Como retomar (checklist curto)
-----------------------------
- [ ] Ajustar Root Directory no Vercel para "calendario-next" e redeploy (resolve o erro de build).
- [ ] Verificar variáveis de ambiente: JWT_SECRET e ENABLE_SEED
- [ ] Rodar build localmente e corrigir warnings/erros restantes
- [ ] Criar plano de migração para MongoDB (se desejar dados persistentes)

Comandos úteis
--------------
- Instalar: npm install
- Dev: npm run dev
- Build: npm run build
- Start (produção local): npm run start

Onde olhar primeiro (arquivos essenciais)
-----------------------------------------
- lib/db.ts — entender onde os dados são lidos e escritos (substituir por Mongo posteriormente)
- app/api/* — rota de autenticação e rotas CRUD
- app/components/LegacyApp.tsx — UI legado (para restaurar ou ajustar)

Se quiser que eu:
- Posso gerar o conjunto de arquivos necessários para migrar para MongoDB (conexão, models, script de migração).
- Posso commitar e pushar este PROJECT_SUMMARY.md para o repositório e criar um branch com as mudanças de migração (se autorizar).

Próximo passo sugerido agora (rápido):
- Ajuste do Root Directory na Vercel e redeploy para que o build conclua. Depois, validar site e checar logs.

Anexos / Notas finais
---------------------
- Registro de commits recentes: a alteração para redirecionar root foi commitada com a mensagem: "chore: redirect root to /dashboard (serve legacy layout)" com coautoria Copilot.

Salvo em: C:\Users\RAFAELFERREIRABONFIM\calendario-next\PROJECT_SUMMARY.md

Se quiser, eu comito e pusho este arquivo agora para o repositório (ou crio um branch). O que prefere?