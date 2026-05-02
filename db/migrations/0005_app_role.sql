-- Enclave — application database role
--
-- Creates a limited-privilege role for the Next.js server.
-- This role does NOT have BYPASSRLS, so all Row-Level Security
-- policies defined in 0002_rls.sql are enforced at the database layer.
--
-- The owner connection (neondb_owner / postgres) bypasses RLS and should
-- only be used for migrations. The app connection (enclave_app) is used
-- at runtime and sees only what RLS allows.
--
-- Run this AFTER 0004_demo_users.sql.
-- Then update DATABASE_URL in your .env.local and Vercel env vars
-- to use the enclave_app credentials.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select from pg_roles where rolname = 'enclave_app') then
    -- IMPORTANT: rotate this password before launching to real users.
    create role enclave_app with login password 'enclave-app-change-me';
    raise notice 'Created role enclave_app';
  else
    raise notice 'Role enclave_app already exists, skipping creation';
  end if;
end
$$;

grant usage on schema public to enclave_app;
grant select, insert, update, delete on all tables in schema public to enclave_app;
grant usage, select on all sequences in schema public to enclave_app;

-- Ensure future tables/sequences also get the grants (run-once idempotent)
alter default privileges in schema public
  grant select, insert, update, delete on tables to enclave_app;
alter default privileges in schema public
  grant usage, select on sequences to enclave_app;

-- Verify
do $$
declare
  bypass boolean;
begin
  select rolbypassrls into bypass from pg_roles where rolname = 'enclave_app';
  if bypass then
    raise exception 'enclave_app has BYPASSRLS — RLS will not enforce! Fix before deploying.';
  else
    raise notice 'enclave_app confirmed: bypassrls=false, RLS will enforce correctly.';
  end if;
end
$$;
