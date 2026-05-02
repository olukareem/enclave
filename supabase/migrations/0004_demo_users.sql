-- Enclave — demo users
--
-- Creates three auth users (Sarah, Mike, Alex) with hand-picked UUIDs that
-- match the foreign keys baked into 0003_seed.sql.
--
-- Password for all three: enclave-demo
-- Rotate via the Supabase dashboard before any real-world use.
--
-- This migration must run AFTER 0003_seed.sql because the user_entity inserts
-- below reference entity UUIDs created there.
--
-- Why direct auth.users INSERT works: Supabase's auth.users table uses
-- pgcrypto's crypt(password, gen_salt('bf')) for password hashing — the same
-- function the GoTrue auth server uses internally. As long as the bcrypt hash
-- is valid, the user can sign in via the standard /token endpoint.

create extension if not exists pgcrypto;

-- ── Helper: insert user + identity in one shot ──────────────────────────

create or replace function _enclave_create_demo_user(
  p_id uuid,
  p_email text,
  p_full_name text,
  p_password text
) returns void language plpgsql as $$
begin
  -- Skip if already exists (idempotent)
  if exists (select 1 from auth.users where id = p_id) then
    return;
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    p_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name),
    now(), now(),
    '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) values (
    uuid_generate_v4(),
    p_id,
    jsonb_build_object('sub', p_id::text, 'email', p_email, 'email_verified', true),
    'email',
    p_id::text,
    now(), now(), now()
  );

  -- Note: the on_auth_user_created trigger (defined in 0001_schema.sql)
  -- automatically creates the matching public.users row.
end;
$$;

-- ── Create the three demo users ─────────────────────────────────────────

select _enclave_create_demo_user(
  'b0000000-0000-4000-8000-000000000001',
  'sarah.chen@enclave.demo',
  'Sarah Chen',
  'enclave-demo'
);

select _enclave_create_demo_user(
  'b0000000-0000-4000-8000-000000000002',
  'mike.torres@enclave.demo',
  'Mike Torres',
  'enclave-demo'
);

select _enclave_create_demo_user(
  'b0000000-0000-4000-8000-000000000003',
  'alex.park@enclave.demo',
  'Alex Park',
  'enclave-demo'
);

drop function _enclave_create_demo_user(uuid, text, text, text);

-- ── Membership graph ────────────────────────────────────────────────────
-- Mirrors src/lib/mock-data.ts userEntity[].
--
--   Sarah (admin)   → Acme, Northwind
--   Mike  (viewer)  → Torres
--   Alex  (advisor) → Acme, Riverside, Chen

insert into public.user_entity (user_id, entity_id, role) values
  -- Sarah: admin on Acme + Northwind
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'admin'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'admin'),
  -- Mike: viewer on Torres
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000005', 'viewer'),
  -- Alex: advisor on Acme, Riverside, Chen
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'advisor'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'advisor'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004', 'advisor')
on conflict (user_id, entity_id) do nothing;

-- Verification query (for the buyer to run after applying)
-- expected: 3 users, 5 entities, 6 user_entity rows.
do $$
declare
  user_count int;
  entity_count int;
  membership_count int;
begin
  select count(*) into user_count from public.users;
  select count(*) into entity_count from public.entities;
  select count(*) into membership_count from public.user_entity;
  raise notice 'Enclave seeded: % users, % entities, % memberships',
    user_count, entity_count, membership_count;
  if user_count <> 3 or entity_count <> 5 or membership_count <> 6 then
    raise warning 'Counts do not match expected (3 users / 5 entities / 6 memberships).';
  end if;
end $$;
