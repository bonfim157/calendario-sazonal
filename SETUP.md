# EduCalendário — Guia de Setup e Próximos Passos

> **Última atualização:** 2026-07-27  
> Este documento descreve o que foi feito, o que está pendente e o que você precisa fazer manualmente.

---

## O que já foi feito (autônomo — sem precisar de você)

### ✅ Fase 0 — Auditoria e Baseline
- Branch `legacy-baseline` criada com o estado original antes da migração
- Vulnerabilidades de segurança do Next.js corrigidas (16.2.9 → 16.2.12)
- `middleware.ts` migrado para `proxy.ts` (convenção obrigatória do Next.js 16)

### ✅ Fase 1 — Migração do Banco de Dados (lowdb → Supabase)
- `lib/db.ts` (lowdb) substituído por `lib/supabase.ts` (Supabase client com lazy init)
- Todas as 6 rotas API atualizadas para usar Supabase em vez de JSON local
- `supabase/schema.sql` criado: schema completo + seed com grade horária do 3º TI
- `/api/seed` público removido (agora retorna 403)
- Cookies de auth ganharam flag `SameSite=Lax`
- `.env.local.example` criado

### ✅ Fase 3 — Hardening do Backend
- `lib/validation.ts` criado com schemas Zod para todas as rotas
- Todas as rotas API validam input com Zod antes de processar
- Mensagens de erro em português com detalhes por campo

### ✅ Fase 4 — Redesign Completo da UI
- **Tailwind v4** instalado (`@tailwindcss/postcss`)
- **`app/layout.tsx`** atualizado: `lang="pt-BR"`, fonte Nunito, título "EduCalendário"
- **`app/login/page.tsx`** redesenhado: gradiente azul/roxo, botões de demo por papel
- **`app/dashboard/page.tsx`** completamente reescrito — sem mais LegacyApp.tsx
- **Novos componentes criados:**
  - `app/components/layout/Shell.tsx` — container 3 colunas
  - `app/components/layout/Sidebar.tsx` — sidebar com cor por papel (azul/verde/roxo)
  - `app/components/layout/Topbar.tsx` — topbar com saudação e data
  - `app/components/Calendar.tsx` — grade mensal com chips de evento e legenda
  - `app/components/EventModal.tsx` — modal real para criar eventos (sem alert())
  - `app/components/ApprovalPanel.tsx` — painel de aprovação só para gestão
  - `app/components/ChatPanel.tsx` — chat com bolhas, polling a 5s
  - `app/components/ScheduleView.tsx` — grade horária com cores por disciplina
  - `app/components/RightPanel.tsx` — painel direito com tabs (Visão Geral / Horários)

### ✅ Fase 6 — Estrutura do PostHog (código pronto, ativa com API key)
- `lib/posthog.ts` — cliente server-side com lazy init (só ativa com `POSTHOG_API_KEY`)
- `app/components/PostHogProvider.tsx` — provider browser com config de privacidade LGPD
- `app/components/ErrorBoundary.tsx` — captura erros JS e envia ao PostHog
- `next.config.ts` — proxy reverso do PostHog (evita ad-blockers)

---

## O que você precisa fazer (manual)

### 🔴 PRIORIDADE 1 — Conectar ao Supabase (para o app funcionar em produção)

**Passo 1: Criar o projeto Supabase**
1. Acesse [supabase.com](https://supabase.com) e crie uma conta (ou faça login)
2. Clique em "New Project"
3. Nome: `educalendario`
4. Região: **South America (São Paulo)** — mais rápido para o Brasil
5. Escolha uma senha forte para o banco de dados (salve em algum lugar seguro)
6. Aguarde o projeto ser criado (~2 minutos)

**Passo 2: Pegar as credenciais**
1. Vá em **Settings → API** no painel do Supabase
2. Copie os 3 valores:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

**Passo 3: Criar o arquivo `.env.local`**
```bash
# Crie este arquivo na raiz do projeto (ao lado de package.json)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Passo 4: Rodar o schema no Supabase**
1. No painel do Supabase, vá em **SQL Editor → New Query**
2. Cole o conteúdo inteiro do arquivo `supabase/schema.sql`
3. Clique em **Run** (ou Ctrl+Enter)
4. Você verá as tabelas criadas em **Table Editor**

**Passo 5: Testar localmente**
```bash
npm run dev
# Acesse http://localhost:3000
# Login: prof.rafael / prof123
```

---

### 🟡 PRIORIDADE 2 — Fase 2: Supabase Auth + Row Level Security

> Esta fase substitui o JWT manual (bcrypt+cookie) pelo Supabase Auth nativo.
> **Pré-requisito:** Fase 1 (Supabase configurado) concluída.

**O que precisa ser feito:**

**2.1 — Criar contas no Supabase Auth**
No painel do Supabase, vá em **Authentication → Users → Add User** e crie:

| Email | Senha | (isso vai ser convertido para login@educalendario.local internamente) |
|---|---|---|
| `prof.rafael@educalendario.local` | `prof123` | |
| `aluno.joao@educalendario.local` | `aluno123` | |
| `gestao.escola@educalendario.local` | `gestao123` | |

> No Supabase Auth, vá em **Authentication → Providers → Email** e desabilite "Confirm email" para não precisar confirmar por email.

**2.2 — Vincular auth_id aos usuários**
Após criar as contas, rode no SQL Editor:
```sql
-- Conecta cada usuário do auth ao perfil na tabela users
UPDATE public.users SET auth_id = (
  SELECT id FROM auth.users WHERE email = 'prof.rafael@educalendario.local'
) WHERE login = 'prof.rafael';

UPDATE public.users SET auth_id = (
  SELECT id FROM auth.users WHERE email = 'aluno.joao@educalendario.local'
) WHERE login = 'aluno.joao';

UPDATE public.users SET auth_id = (
  SELECT id FROM auth.users WHERE email = 'gestao.escola@educalendario.local'
) WHERE login = 'gestao.escola';
```

**2.3 — Habilitar RLS e criar policies**
Rode no SQL Editor:
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;

-- Policies de eventos
CREATE POLICY "aluno vê só aprovados" ON public.events FOR SELECT USING (
  status = 'approved'
  OR (SELECT papel FROM public.users WHERE auth_id = auth.uid()) IN ('professor','gestao')
);
CREATE POLICY "professor e gestao criam eventos" ON public.events FOR INSERT WITH CHECK (
  (SELECT papel FROM public.users WHERE auth_id = auth.uid()) IN ('professor','gestao')
);
CREATE POLICY "só gestão aprova" ON public.events FOR UPDATE USING (
  (SELECT papel FROM public.users WHERE auth_id = auth.uid()) = 'gestao'
);

-- Policies de mensagens (todos autenticados)
CREATE POLICY "todos leem mensagens" ON public.messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "todos enviam mensagens" ON public.messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policies de schedules (todos leem)
CREATE POLICY "todos veem horários" ON public.schedules FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policies de users (cada um vê só o próprio; gestão vê todos)
CREATE POLICY "users veem próprio perfil" ON public.users FOR SELECT USING (
  auth_id = auth.uid()
  OR (SELECT papel FROM public.users WHERE auth_id = auth.uid()) = 'gestao'
);
```

**2.4 — Instalar e configurar @supabase/ssr**
O pacote já está instalado. Requer:
1. Criar `lib/supabase-server.ts` usando `createServerClient` de `@supabase/ssr`
2. Atualizar `proxy.ts` para usar `supabase.auth.getUser()` em vez de checar cookie `token`
3. Reescrever `app/api/auth/login/route.ts` para usar `supabase.auth.signInWithPassword`
4. Reescrever `app/api/auth/logout/route.ts` para usar `supabase.auth.signOut`
5. Reescrever `app/api/auth/validate/route.ts` para usar `supabase.auth.getUser()`
6. Remover `jsonwebtoken`, `bcryptjs`, `cookie` do `package.json`
7. Remover `JWT_SECRET` e `senha_hash` (não são mais necessários)

> **Nota:** Me chame de volta para implementar a Fase 2 quando o Supabase estiver configurado.

---

### 🟡 PRIORIDADE 3 — Fase 3 (complemento): Rate Limiting no Login

> O Zod já está aplicado em todas as rotas. Falta o rate limiting no endpoint de login.
> **Serviço:** Upstash Redis (free tier, funciona em Vercel Edge)

**3.1 — Criar conta Upstash**
1. Acesse [upstash.com](https://upstash.com) e crie uma conta
2. Crie um banco Redis (free tier)
3. Copie as credenciais para `.env.local`:
```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...
```

**3.2 — Instalar e configurar**
```bash
npm install @upstash/ratelimit @upstash/redis
```

Depois, no início de `app/api/auth/login/route.ts`, adicione:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 tentativas por IP por minuto
})

// No POST handler, antes de processar:
const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
const { success } = await ratelimit.limit(ip)
if (!success) {
  return NextResponse.json({ erro: 'Muitas tentativas. Aguarde 1 minuto.' }, { status: 429 })
}
```

---

### 🟢 PRIORIDADE 4 — Fase 5: Dashboard de Métricas (Gestão)

> **Pré-requisito:** Fase 1 (Supabase configurado) concluída.

**O que fazer:**

**5.1 — Criar Views SQL no Supabase**
No SQL Editor, execute:
```sql
-- View: eventos por categoria
CREATE VIEW v_events_by_category AS
SELECT category, COUNT(*) as total
FROM events GROUP BY category ORDER BY total DESC;

-- View: taxa de aprovação por mês
CREATE VIEW v_approval_by_month AS
SELECT DATE_TRUNC('month', date) as mes, status, COUNT(*) as total
FROM events GROUP BY 1, 2 ORDER BY 1;

-- View: atividade por papel de usuário
CREATE VIEW v_events_by_role AS
SELECT u.papel, COUNT(*) as total
FROM events e JOIN users u ON u.login = e.autor_login
GROUP BY u.papel;

-- View: tempo médio de aprovação (em horas)
CREATE VIEW v_avg_approval_time AS
SELECT AVG(EXTRACT(EPOCH FROM (approved_at - created_at)) / 3600) as horas
FROM events WHERE status = 'approved' AND approved_at IS NOT NULL;

-- View: atividade no chat nos últimos 30 dias
CREATE VIEW v_chat_activity AS
SELECT DATE_TRUNC('day', created_at) as dia, COUNT(*) as mensagens
FROM messages WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY 1 ORDER BY 1;
```

**5.2 — Instalar recharts**
```bash
npm install recharts
```

**5.3 — Criar a página de métricas**
Criar `app/dashboard/metrics/page.tsx` (Server Component, só para gestão, com recharts para os charts). Me chame para implementar.

---

### 🟢 PRIORIDADE 5 — Fase 6: Ativar PostHog

> O código já está no projeto. Basta configurar a API key.

**6.1 — Criar conta PostHog**
1. Acesse [eu.posthog.com](https://eu.posthog.com) (região EU para LGPD)
2. Crie um projeto chamado "EduCalendário"
3. Copie as chaves

**6.2 — Adicionar ao `.env.local` e Vercel**
```
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
POSTHOG_API_KEY=phx_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=/ingest
```

**6.3 — Adicionar o provider ao layout**
Em `app/layout.tsx`, envolver o `{children}` com `<PostHogProvider>`:
```tsx
import PostHogProvider from '@/app/components/PostHogProvider'
import ErrorBoundary from '@/app/components/ErrorBoundary'

// No RootLayout:
<body>
  <PostHogProvider>
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </PostHogProvider>
</body>
```

**6.4 — Desabilitar session recording para alunos**
No `PostHogProvider.tsx`, o `maskAllInputs: true` já está ativo. Para desabilitar recording para alunos, você precisará passar o papel do usuário como prop após a Fase 2 estar completa.

---

### 🔵 PRIORIDADE 6 — Fase 7: Deploy no Vercel

**7.1 — Configurar variáveis de ambiente no Vercel**
No painel do Vercel, vá em **Settings → Environment Variables** e adicione:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_POSTHOG_KEY        (quando tiver)
POSTHOG_API_KEY                (quando tiver)
NEXT_PUBLIC_POSTHOG_HOST       (valor: /ingest)
UPSTASH_REDIS_REST_URL         (quando tiver)
UPSTASH_REDIS_REST_TOKEN       (quando tiver)
```

**7.2 — Verificar Root Directory no Vercel**
O deploy estava falhando porque o Root Directory estava errado. Verifique em **Settings → General → Root Directory** que está em `.` (ponto, raiz do repositório).

**7.3 — Deploy**
```bash
git push origin main
# O Vercel faz deploy automaticamente ao dar push na main
```

**7.4 — Configurar Supabase para produção**
Em **Supabase → Authentication → URL Configuration**:
- Site URL: `https://seu-projeto.vercel.app`
- Redirect URLs: `https://seu-projeto.vercel.app/**`

---

## Resumo do estado atual do código

```
O app funciona localmente com .env.local configurado.
O build passa sem erros (npm run build).
Sem Supabase, as páginas carregam mas as rotas API retornam erro.
```

### Logins de demo
| Login | Senha | Papel |
|---|---|---|
| `prof.rafael` | `prof123` | Professor |
| `aluno.joao` | `aluno123` | Aluno |
| `gestao.escola` | `gestao123` | Gestão |

### Estrutura de arquivos relevante
```
calendario-sazonal/
├── supabase/schema.sql          ← RODE ESTE NO SUPABASE
├── .env.local.example           ← COPIE PARA .env.local E PREENCHA
├── lib/
│   ├── supabase.ts              ← cliente Supabase (lazy init)
│   ├── validation.ts            ← schemas Zod
│   └── posthog.ts               ← cliente PostHog (lazy init)
├── proxy.ts                     ← proteção de rotas (equiv. middleware)
├── app/
│   ├── layout.tsx               ← Nunito font, pt-BR
│   ├── login/page.tsx           ← login redesenhado
│   ├── dashboard/page.tsx       ← dashboard novo
│   ├── api/
│   │   ├── auth/{login,logout,validate}/route.ts
│   │   ├── events/route.ts
│   │   ├── events/[id]/approve/route.ts
│   │   ├── chat/route.ts
│   │   └── schedule/route.ts
│   └── components/
│       ├── layout/{Shell,Sidebar,Topbar}.tsx
│       ├── Calendar.tsx
│       ├── EventModal.tsx
│       ├── ApprovalPanel.tsx
│       ├── ChatPanel.tsx
│       ├── ScheduleView.tsx
│       ├── RightPanel.tsx
│       ├── PostHogProvider.tsx
│       └── ErrorBoundary.tsx
```

---

## Quando retomar com o Claude

Ao retomar, diga uma das frases:
- **"Configurei o Supabase, pode começar a Fase 2"** → implementa Supabase Auth + RLS
- **"Pode fazer a Fase 5 de métricas"** → dashboard com recharts (após Supabase configurado)
- **"Configura o rate limiting"** → adiciona Upstash no login
- **"Ativa o PostHog"** → adiciona o provider no layout + eventos

O Claude tem memória do projeto e vai saber de onde parou.
