-- Family Chat storage for Sam's website
-- Run this in Supabase SQL Editor.
-- Keep RLS enabled. The website server uses the secret key; the browser never receives it.

create extension if not exists pgcrypto;

create table if not exists public.family_messages (
  id uuid primary key default gen_random_uuid(),
  sender text not null check (sender in ('mum','dad','sam')),
  kind text not null default 'text',
  body text,
  media_url text,
  whatsapp_message_id text,
  created_at timestamptz not null default now()
);

create index if not exists family_messages_created_at_idx
  on public.family_messages (created_at);

create unique index if not exists family_messages_whatsapp_id_idx
  on public.family_messages (whatsapp_message_id)
  where whatsapp_message_id is not null;

alter table public.family_messages enable row level security;

-- No public browser access. The Vercel server uses the Supabase secret key.
revoke all on public.family_messages from anon, authenticated;
grant all on public.family_messages to service_role;
