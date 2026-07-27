-- EduCalendário — Schema SQL para Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase
-- https://supabase.com/dashboard/project/_/sql/new

-- =============================================================
-- TABELAS
-- =============================================================

create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  auth_id    uuid references auth.users(id) on delete cascade,
  login      text unique not null,
  nome       text not null,
  papel      text not null check (papel in ('professor','aluno','gestao')),
  initials   text,
  escola     text,
  turma      text,
  ra         text,
  cargo      text,
  -- senha_hash é temporário: usado em Fase 1 (bcrypt+JWT) e removido na Fase 2 (Supabase Auth)
  senha_hash text,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  date         date not null,
  title        text not null,
  category     text not null check (category in ('red','yellow','green','blue','purple','orange')),
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  nota         text,
  autor_login  text,
  approved_by  text,
  approved_at  timestamptz,
  motivo       text,
  created_at   timestamptz default now()
);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  text       text not null,
  from_login text not null,
  to_login   text,
  created_at timestamptz default now()
);

create table if not exists public.schedules (
  id              uuid primary key default gen_random_uuid(),
  turma           text not null,
  dia             smallint not null check (dia between 0 and 6),
  slot            smallint not null check (slot between 1 and 7),
  disciplina      text not null,
  professor_login text,
  created_at      timestamptz default now()
);

-- =============================================================
-- RLS: DESABILITADO NA FASE 1, HABILITADO NA FASE 2
-- =============================================================

alter table public.users    disable row level security;
alter table public.events   disable row level security;
alter table public.messages disable row level security;
alter table public.schedules disable row level security;

-- =============================================================
-- SEED: DADOS INICIAIS
-- =============================================================

-- Usuários demo — senha_hash é bcrypt das senhas: prof123, aluno123, gestao123
-- auth_id será preenchido na Fase 2 após criar contas no Supabase Auth
insert into public.users (login, nome, papel, initials, escola, senha_hash) values
  ('prof.rafael', 'Rafael F. Bonfim', 'professor', 'RF', 'ETEC Zona Sul',
   '$2b$10$A00lpdd2HjeFETS.NUkobeYsQ9yTmGe8M.CloxlNnXbtsXotWnQoS')
on conflict (login) do nothing;

insert into public.users (login, nome, papel, initials, turma, ra, senha_hash) values
  ('aluno.joao', 'João P. Silva', 'aluno', 'JS', '3º Ano TI', '2024001',
   '$2b$10$Z193uBsa6fF791NCK6nageXXScmfpOGOVc7GVEqSgNgzcOp4wfuhi')
on conflict (login) do nothing;

insert into public.users (login, nome, papel, initials, cargo, senha_hash) values
  ('gestao.escola', 'Maria S. Costa', 'gestao', 'MC', 'Coordenadora Pedagógica',
   '$2b$10$H2Qg/bcJmAPnGUXSTj9cM.r0EkMdHmL6//IC29m1xhAqjET/ludTO')
on conflict (login) do nothing;

-- Eventos iniciais
insert into public.events (date, title, category, status, nota, autor_login, approved_by) values
  (current_date + 5,  'Prova de Matemática',   'red',    'approved', 'Capítulos 3 ao 7', 'prof.rafael', 'gestao.escola'),
  (current_date + 12, 'Reunião de Pais',        'yellow', 'approved', 'Auditório às 19h', 'gestao.escola', 'gestao.escola'),
  (current_date + 20, 'Semana Cultural',        'purple', 'pending',  'Aguardando aprovação da diretoria', 'prof.rafael', null)
on conflict do nothing;

-- Mensagens iniciais
insert into public.messages (text, from_login, to_login) values
  ('Bom dia a todos! Não esqueçam da reunião de amanhã.', 'gestao.escola', null),
  ('Obrigado pelo aviso! Estarei presente.', 'prof.rafael', null)
on conflict do nothing;

-- Grade horária completa do 3º TI (baseada no app original)
-- dia: 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta
-- slot: 1-7 (07:30 ao 13:50)
insert into public.schedules (turma, dia, slot, disciplina, professor_login) values
  -- Segunda
  ('3º TI', 1, 1, 'Matemática',      'prof.rafael'),
  ('3º TI', 1, 2, 'Matemática',      'prof.rafael'),
  ('3º TI', 1, 3, 'Português',       'prof.rafael'),
  ('3º TI', 1, 4, 'Programação',     'prof.rafael'),
  ('3º TI', 1, 5, 'Programação',     'prof.rafael'),
  ('3º TI', 1, 6, 'Banco de Dados',  'prof.rafael'),
  ('3º TI', 1, 7, 'Banco de Dados',  'prof.rafael'),
  -- Terça
  ('3º TI', 2, 1, 'Física',          'prof.rafael'),
  ('3º TI', 2, 2, 'Física',          'prof.rafael'),
  ('3º TI', 2, 3, 'Inglês',          'prof.rafael'),
  ('3º TI', 2, 4, 'Redes',           'prof.rafael'),
  ('3º TI', 2, 5, 'Redes',           'prof.rafael'),
  ('3º TI', 2, 6, 'E. Física',       'prof.rafael'),
  ('3º TI', 2, 7, 'E. Física',       'prof.rafael'),
  -- Quarta
  ('3º TI', 3, 1, 'Português',       'prof.rafael'),
  ('3º TI', 3, 2, 'Português',       'prof.rafael'),
  ('3º TI', 3, 3, 'História',        'prof.rafael'),
  ('3º TI', 3, 4, 'Programação Web', 'prof.rafael'),
  ('3º TI', 3, 5, 'Programação Web', 'prof.rafael'),
  ('3º TI', 3, 6, 'Matemática',      'prof.rafael'),
  ('3º TI', 3, 7, 'Matemática',      'prof.rafael'),
  -- Quinta
  ('3º TI', 4, 1, 'Química',         'prof.rafael'),
  ('3º TI', 4, 2, 'Química',         'prof.rafael'),
  ('3º TI', 4, 3, 'Geografia',       'prof.rafael'),
  ('3º TI', 4, 4, 'S.O.',            'prof.rafael'),
  ('3º TI', 4, 5, 'S.O.',            'prof.rafael'),
  ('3º TI', 4, 6, 'Inglês',          'prof.rafael'),
  ('3º TI', 4, 7, 'Inglês',          'prof.rafael'),
  -- Sexta
  ('3º TI', 5, 1, 'Artes',           'prof.rafael'),
  ('3º TI', 5, 2, 'Artes',           'prof.rafael'),
  ('3º TI', 5, 3, 'Filosofia',       'prof.rafael'),
  ('3º TI', 5, 4, 'TCC',             'prof.rafael'),
  ('3º TI', 5, 5, 'TCC',             'prof.rafael'),
  ('3º TI', 5, 6, 'Proj. Integrador','prof.rafael'),
  ('3º TI', 5, 7, 'Proj. Integrador','prof.rafael')
on conflict do nothing;
