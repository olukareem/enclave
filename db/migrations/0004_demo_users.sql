-- Enclave — demo users
-- Compatible with Neon Postgres (and any vanilla Postgres 14+)
--
-- Creates three users directly in public.users with bcrypt-hashed passwords.
-- Password for all three: enclave-demo
-- Run this AFTER 0003_seed.sql.
--
-- Uses pgcrypto for bcrypt hashing at migration time.

create extension if not exists pgcrypto;

insert into public.users (id, email, full_name, password_hash) values
  (
    'b0000000-0000-4000-8000-000000000001',
    'sarah.chen@enclave.demo',
    'Sarah Chen',
    crypt('enclave-demo', gen_salt('bf', 10))
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    'mike.torres@enclave.demo',
    'Mike Torres',
    crypt('enclave-demo', gen_salt('bf', 10))
  ),
  (
    'b0000000-0000-4000-8000-000000000003',
    'alex.park@enclave.demo',
    'Alex Park',
    crypt('enclave-demo', gen_salt('bf', 10))
  )
on conflict (id) do nothing;

-- Membership graph (same as before):
--   Sarah (admin)   → Acme, Northwind
--   Mike  (viewer)  → Torres
--   Alex  (advisor) → Acme, Riverside, Chen
insert into public.user_entity (user_id, entity_id, role) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'admin'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'admin'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000005', 'viewer'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'advisor'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'advisor'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004', 'advisor')
on conflict (user_id, entity_id) do nothing;

-- Verification
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
