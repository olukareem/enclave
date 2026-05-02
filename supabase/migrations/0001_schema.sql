-- Enclave — schema migration
--
-- Seven tables modeling a multi-tenant B2B portal:
--   users, entities, user_entity (the access-control core),
--   documents, transactions, assets, obligations.
--
-- Mirrors src/lib/types.ts. UUIDs throughout. Foreign keys cascade on delete
-- so removing an entity cleanly removes its child rows.

create extension if not exists "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────────────────

create type entity_type        as enum ('client', 'group', 'company');
create type role               as enum ('admin', 'viewer', 'advisor');
create type transaction_type   as enum ('income', 'expense', 'transfer');
create type transaction_status as enum ('pending', 'completed', 'cancelled');
create type obligation_type    as enum ('loan', 'lease', 'subscription', 'other');
create type obligation_status  as enum ('active', 'paid', 'overdue');

-- ── Tables ───────────────────────────────────────────────────────────────

-- Mirrors auth.users 1:1 via shared id. Created on first sign-in by a trigger
-- (defined in 0004_demo_users.sql so it runs after auth schema is ready).
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  created_at  timestamptz not null default now()
);

create table public.entities (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  type        entity_type not null,
  created_at  timestamptz not null default now()
);

-- The access-control core. (user_id, entity_id) is unique — a user has at
-- most one role per entity.
create table public.user_entity (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id)    on delete cascade,
  entity_id   uuid not null references public.entities(id) on delete cascade,
  role        role not null,
  created_at  timestamptz not null default now(),
  unique (user_id, entity_id)
);

create index user_entity_user_id_idx   on public.user_entity (user_id);
create index user_entity_entity_id_idx on public.user_entity (entity_id);

-- Domain tables. All entity-scoped via entity_id FK — the RLS policy in
-- 0002_rls.sql filters on the same column.

create table public.documents (
  id            uuid primary key default uuid_generate_v4(),
  entity_id     uuid not null references public.entities(id) on delete cascade,
  title         text not null,
  file_type     text not null,
  file_size     bigint not null,
  storage_path  text not null,
  uploaded_by   uuid not null references public.users(id),
  created_at    timestamptz not null default now()
);

create index documents_entity_id_idx on public.documents (entity_id);

create table public.transactions (
  id            uuid primary key default uuid_generate_v4(),
  entity_id     uuid not null references public.entities(id) on delete cascade,
  description   text not null,
  amount        numeric(14, 2) not null,
  type          transaction_type not null,
  status        transaction_status not null,
  date          date not null,
  created_at    timestamptz not null default now()
);

create index transactions_entity_id_idx on public.transactions (entity_id);
create index transactions_date_idx      on public.transactions (date desc);

create table public.assets (
  id            uuid primary key default uuid_generate_v4(),
  entity_id     uuid not null references public.entities(id) on delete cascade,
  name          text not null,
  category      text not null,
  value         numeric(14, 2) not null,
  currency      char(3) not null default 'USD',
  as_of_date    date not null,
  created_at    timestamptz not null default now()
);

create index assets_entity_id_idx on public.assets (entity_id);

create table public.obligations (
  id            uuid primary key default uuid_generate_v4(),
  entity_id     uuid not null references public.entities(id) on delete cascade,
  name          text not null,
  type          obligation_type not null,
  amount        numeric(14, 2) not null,
  due_date      date not null,
  status        obligation_status not null,
  created_at    timestamptz not null default now()
);

create index obligations_entity_id_idx on public.obligations (entity_id);
create index obligations_due_date_idx  on public.obligations (due_date);

-- ── public.users sync trigger ────────────────────────────────────────────
-- When a new auth.users row is created (sign-up), create a matching
-- public.users row so foreign keys can reference it.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
