-- Criar tabela de perfis atrelada aos usuários da Autenticação
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  nickname TEXT,
  force_password_change BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ativar RLS (mesmo que nossa API Cloud pule com Service Role, é boa prática)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Atualiza a tabela tasks antiga adicionando colunas da Eisenhower e TimeTracking
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('high', 'low')),
ADD COLUMN IF NOT EXISTS importance TEXT CHECK (importance IN ('high', 'low')),
ADD COLUMN IF NOT EXISTS estimated_time INT,
ADD COLUMN IF NOT EXISTS actual_time INT,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
