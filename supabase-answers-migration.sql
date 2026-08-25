-- Esegui questa query nello SQL Editor di Supabase.
-- Aggiunge il riepilogo delle risposte a ogni partecipante.
alter table public.quiz_results
  add column if not exists answers jsonb not null default '[]'::jsonb;
