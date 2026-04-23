-- Create priority enum
CREATE TYPE public.task_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Add new columns to tasks
ALTER TABLE public.tasks
  ADD COLUMN description text,
  ADD COLUMN due_date timestamptz,
  ADD COLUMN priority public.task_priority NOT NULL DEFAULT 'media';

-- Index to speed up due-date queries per user
CREATE INDEX idx_tasks_user_due ON public.tasks (user_id, due_date);