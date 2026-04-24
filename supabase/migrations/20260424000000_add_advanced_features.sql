-- Add new columns to the existing tasks table for advanced features
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS recurrence text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;

-- Add indexes for performance on the new filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON public.tasks (archived);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON public.tasks USING GIN (tags);

-- We won't restrict user preferences to the DB yet to keep the UI snappy
-- Preferences will be handled by Zustand persist (localStorage)
