-- Enclave — Row-Level Security policies
-- Compatible with Neon Postgres (and any vanilla Postgres 14+)
--
-- RLS enforced by setting app.current_user_id before each query via the API layer.
-- The API layer runs: SET LOCAL app.current_user_id = '<uuid>' inside each transaction.
-- Policies read that setting via nullif(current_setting('app.current_user_id', true), '')::uuid.
--
-- Pattern: every domain row has an `entity_id`. A user can SELECT a row only
-- when they have a `user_entity` membership for that entity. Writes
-- (INSERT/UPDATE/DELETE) further require the membership role to be 'admin'.

-- ── SECURITY DEFINER helper ──────────────────────────────────────────────
-- Returns the entity IDs the current session user belongs to, bypassing
-- user_entity RLS. Required because policies that recurse into user_entity
-- (e.g. "show me users who share an entity with me") would otherwise hit
-- their own RLS predicate and return nothing.
-- Safe to expose: a caller can already see their own user_entity rows via
-- the user_entity_co_members policy below, so this function gives nothing extra.

create or replace function public.current_user_entity_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select entity_id from user_entity
  where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
$$;

-- ── users ────────────────────────────────────────────────────────────────

alter table public.users enable row level security;

-- Users can see their own row plus other users who share at least one entity.
-- This lets the UI render names on rows like "uploaded_by", "assigned_to".
create policy "users_co_members"
  on public.users
  for select
  using (
    id = nullif(current_setting('app.current_user_id', true), '')::uuid
    or id in (
      select user_id from public.user_entity
      where entity_id in (select public.current_user_entity_ids())
    )
  );

-- ── entities ─────────────────────────────────────────────────────────────

alter table public.entities enable row level security;

create policy "entities_member_visible"
  on public.entities
  for select
  using (id in (select public.current_user_entity_ids()));

-- Entity creation is service-role only in this demo (run via SQL editor or
-- onboarding flow). End users cannot insert entities directly.

-- ── user_entity (the access-control core) ────────────────────────────────

alter table public.user_entity enable row level security;

-- Members of an entity can see other memberships in that entity. Required
-- so admins can audit who has access, and so the users_co_members policy
-- has the data it needs to evaluate.
create policy "user_entity_co_members"
  on public.user_entity
  for select
  using (
    user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    or entity_id in (select public.current_user_entity_ids())
  );

create policy "user_entity_admin_writes"
  on public.user_entity
  for insert
  with check (
    exists (
      select 1 from public.user_entity me
      where me.user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        and me.entity_id = user_entity.entity_id
        and me.role = 'admin'
    )
  );

-- ── documents ────────────────────────────────────────────────────────────

alter table public.documents enable row level security;

create policy "documents_entity_isolation"
  on public.documents
  for select
  using (
    entity_id in (
      select entity_id from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    )
  );

create policy "documents_admin_writes"
  on public.documents
  for insert
  with check (
    exists (
      select 1 from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        and entity_id = documents.entity_id
        and role = 'admin'
    )
  );

create policy "documents_admin_updates"
  on public.documents
  for update
  using (
    exists (
      select 1 from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        and entity_id = documents.entity_id
        and role = 'admin'
    )
  );

-- ── transactions ─────────────────────────────────────────────────────────

alter table public.transactions enable row level security;

create policy "transactions_entity_isolation"
  on public.transactions
  for select
  using (
    entity_id in (
      select entity_id from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    )
  );

create policy "transactions_admin_writes"
  on public.transactions
  for insert
  with check (
    exists (
      select 1 from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        and entity_id = transactions.entity_id
        and role = 'admin'
    )
  );

create policy "transactions_admin_updates"
  on public.transactions
  for update
  using (
    exists (
      select 1 from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        and entity_id = transactions.entity_id
        and role = 'admin'
    )
  );

-- ── assets ───────────────────────────────────────────────────────────────

alter table public.assets enable row level security;

create policy "assets_entity_isolation"
  on public.assets
  for select
  using (
    entity_id in (
      select entity_id from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    )
  );

create policy "assets_admin_writes"
  on public.assets
  for insert
  with check (
    exists (
      select 1 from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        and entity_id = assets.entity_id
        and role = 'admin'
    )
  );

create policy "assets_admin_updates"
  on public.assets
  for update
  using (
    exists (
      select 1 from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        and entity_id = assets.entity_id
        and role = 'admin'
    )
  );

-- ── obligations ──────────────────────────────────────────────────────────

alter table public.obligations enable row level security;

create policy "obligations_entity_isolation"
  on public.obligations
  for select
  using (
    entity_id in (
      select entity_id from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    )
  );

create policy "obligations_admin_writes"
  on public.obligations
  for insert
  with check (
    exists (
      select 1 from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        and entity_id = obligations.entity_id
        and role = 'admin'
    )
  );

create policy "obligations_admin_updates"
  on public.obligations
  for update
  using (
    exists (
      select 1 from public.user_entity
      where user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        and entity_id = obligations.entity_id
        and role = 'admin'
    )
  );
