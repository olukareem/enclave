-- Enclave — Row-Level Security policies
--
-- Lifted verbatim from src/lib/rls-policies.ts. The TypeScript predicate in
-- that file encodes the same logic; the two cannot drift because the policy
-- SQL there IS what gets pasted here.
--
-- Pattern: every domain row has an `entity_id`. A user can SELECT a row only
-- when they have a `user_entity` membership for that entity. Writes
-- (INSERT/UPDATE/DELETE) further require the membership role to be 'admin'.

-- ── users ────────────────────────────────────────────────────────────────

alter table public.users enable row level security;

create policy "users_self"
  on public.users
  for select
  using (id = auth.uid());

-- Inserts to public.users happen via the on_auth_user_created trigger
-- (security definer), not via end-user RLS. No INSERT policy exposed.

-- ── entities ─────────────────────────────────────────────────────────────

alter table public.entities enable row level security;

create policy "entities_member_visible"
  on public.entities
  for select
  using (
    id in (
      select entity_id from public.user_entity
      where user_id = auth.uid()
    )
  );

-- Entity creation is service-role only in this demo (run via SQL editor or
-- onboarding flow). End users cannot insert entities directly.

-- ── user_entity (the access-control core) ────────────────────────────────

alter table public.user_entity enable row level security;

create policy "user_entity_self"
  on public.user_entity
  for select
  using (user_id = auth.uid());

create policy "user_entity_admin_writes"
  on public.user_entity
  for insert
  with check (
    exists (
      select 1 from public.user_entity me
      where me.user_id = auth.uid()
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
      where user_id = auth.uid()
    )
  );

create policy "documents_admin_writes"
  on public.documents
  for insert
  with check (
    exists (
      select 1 from public.user_entity
      where user_id = auth.uid()
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
      where user_id = auth.uid()
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
      where user_id = auth.uid()
    )
  );

create policy "transactions_admin_writes"
  on public.transactions
  for insert
  with check (
    exists (
      select 1 from public.user_entity
      where user_id = auth.uid()
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
      where user_id = auth.uid()
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
      where user_id = auth.uid()
    )
  );

create policy "assets_admin_writes"
  on public.assets
  for insert
  with check (
    exists (
      select 1 from public.user_entity
      where user_id = auth.uid()
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
      where user_id = auth.uid()
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
      where user_id = auth.uid()
    )
  );

create policy "obligations_admin_writes"
  on public.obligations
  for insert
  with check (
    exists (
      select 1 from public.user_entity
      where user_id = auth.uid()
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
      where user_id = auth.uid()
        and entity_id = obligations.entity_id
        and role = 'admin'
    )
  );

-- ── Storage RLS for the documents bucket ─────────────────────────────────
-- Files are organized as `{entity_id}/{document_id}.{ext}`.
-- A user can read/write a file only when they have membership on the entity
-- whose UUID is the first path segment.

create policy "documents_bucket_select"
  on storage.objects
  for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select entity_id from public.user_entity
      where user_id = auth.uid()
    )
  );

create policy "documents_bucket_insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from public.user_entity
      where user_id = auth.uid()
        and entity_id = (storage.foldername(name))[1]::uuid
        and role = 'admin'
    )
  );

create policy "documents_bucket_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.user_entity
      where user_id = auth.uid()
        and entity_id = (storage.foldername(name))[1]::uuid
        and role = 'admin'
    )
  );
