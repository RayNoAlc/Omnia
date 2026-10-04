-- Habilitar a extensão "uuid-ossp" (opcional, o Supabase já tem nativo)
create extension if not exists "uuid-ossp";

-- 1. routines
create table public.routines (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  dormir text,
  acordar text,
  periodo_preferido text,
  duracao_preferida integer,
  lazer_minimo_min integer,
  dias_sono jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. routine_blocks
create table public.routine_blocks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  titulo text not null,
  tipo text default 'outro',
  dia_semana text,
  hora_inicio text,
  hora_fim text,
  cor text default '#2DD4A0',
  recorrente boolean default true,
  observacoes text
);

-- 3. routine_exceptions
create table public.routine_exceptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  routine_block_id uuid references public.routine_blocks on delete cascade,
  data date,
  tipo_excecao text,
  titulo text,
  tipo text,
  hora_inicio text,
  hora_fim text,
  cor text,
  observacoes text
);

-- 4. commitments
create table public.commitments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  tipo text,
  disciplina text,
  assunto text,
  prazo date,
  prioridade text,
  origem_texto text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. study_blocks
create table public.study_blocks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  commitment_id uuid references public.commitments on delete cascade,
  disciplina text,
  assunto text,
  date date,
  periodo text,
  tipo text,
  done boolean default false
);

-- 6. notes
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  disciplina text,
  texto text not null,
  commitment_id uuid references public.commitments on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. summaries
create table public.summaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  disciplina text,
  commitment_id uuid references public.commitments on delete cascade,
  texto text not null
);

-- Índices únicos para a lógica de upsert de resumos descrita no código
create unique index unique_summary_commitment on public.summaries(user_id, commitment_id) where commitment_id is not null;
create unique index unique_summary_disciplina on public.summaries(user_id, disciplina) where commitment_id is null;

-- 8. quiz_attempts
create table public.quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  disciplina text,
  commitment_id uuid references public.commitments on delete cascade,
  date date,
  acertos integer,
  total integer
);

-- 9. professor_attempts
create table public.professor_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  disciplina text,
  commitment_id uuid references public.commitments on delete cascade,
  nota numeric,
  date date
);

-- 10. sessions
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  disciplina text,
  commitment_id uuid references public.commitments on delete set null,
  minutos integer,
  duracao_preset_min integer,
  interrupcoes integer,
  date date
);

-- 11. materials
create table public.materials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  disciplina text,
  commitment_id uuid references public.commitments on delete set null,
  tipo_arquivo text,
  nome_arquivo text,
  storage_path text,
  texto_extraido text,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. study_goals
create table public.study_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  meta_minutos integer,
  constraint study_goals_user_id_date_key unique (user_id, date)
);


-- =======================================================================
-- CONFIGURANDO ROW LEVEL SECURITY (RLS) - SEGURANÇA
-- =======================================================================

-- Habilitar RLS em todas as tabelas
alter table public.routines enable row level security;
alter table public.routine_blocks enable row level security;
alter table public.routine_exceptions enable row level security;
alter table public.commitments enable row level security;
alter table public.study_blocks enable row level security;
alter table public.notes enable row level security;
alter table public.summaries enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.professor_attempts enable row level security;
alter table public.sessions enable row level security;
alter table public.materials enable row level security;
alter table public.study_goals enable row level security;

-- Criar políticas de acesso básico (usuário só pode ver, inserir, atualizar e deletar os próprios dados)
-- Usaremos uma função auxiliar (DO block) para aplicar em todas de uma vez
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN (
            'routines', 'routine_blocks', 'routine_exceptions', 'commitments', 
            'study_blocks', 'notes', 'summaries', 'quiz_attempts', 
            'professor_attempts', 'sessions', 'materials', 'study_goals'
          )
    LOOP
        EXECUTE format('CREATE POLICY "Acesso proprio select" ON public.%I FOR SELECT USING (auth.uid() = user_id);', t);
        EXECUTE format('CREATE POLICY "Acesso proprio insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);', t);
        EXECUTE format('CREATE POLICY "Acesso proprio update" ON public.%I FOR UPDATE USING (auth.uid() = user_id);', t);
        EXECUTE format('CREATE POLICY "Acesso proprio delete" ON public.%I FOR DELETE USING (auth.uid() = user_id);', t);
    END LOOP;
END $$;
