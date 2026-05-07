# Enclave — Multi-tenant B2B Client Portal Starter

Postgres RLS-enforced multi-tenancy. Built on Next.js 14, Neon, Auth.js, and Vercel Blob.

Live demo: **[tryenclave.vercel.app](https://tryenclave.vercel.app)**

---

## What this is

Enclave is a production-ready starter for any B2B SaaS where customers manage data on behalf of multiple "entities" — agencies with client accounts, accountants with client books, law firms with matters, family offices with multiple trusts. Users belong to one or more entities with a role per relationship. Everything they see and touch is scoped to their current entity.

The architecture is complete: schema, access control, authentication, document storage, and two diagnostic pages that let a buyer verify the isolation actually works before they ship a single line of their own code.

---

## The differentiator

Most multi-tenant starters filter rows in the application layer. A developer writes a `where entity_id = ?` clause, wires it to the session, and hopes no one forgets it. Enclave enforces isolation at the database level with Postgres Row-Level Security policies. If a developer forgets a where-clause, Postgres still returns nothing. The access control isn't a convention — it's a constraint.

The RLS predicate uses the `current_setting('app.current_user_id', true)::uuid` pattern, which works on any Postgres 14+ database and doesn't depend on any auth provider's internal tables.

---

## What's in the repo

- Seven-table schema: `users`, `entities`, `user_entity`, `documents`, `transactions`, `assets`, `obligations` — with RLS policies on every domain table
- `db/migrations/` — four SQL files you paste into any Postgres database (Neon, Railway, Supabase, or your own hosted Postgres)
- Auth.js v5 with a Credentials provider and three seeded demo users with bcrypt-hashed passwords
- Vercel Blob document storage with entity-gated uploads — admins can upload, viewers cannot
- Schema viewer page (`/dashboard/schema`) — visual proof of foreign-key relationships and the policy SQL for each table
- RLS demo page (`/dashboard/rls-demo`) — split view of the same query run as two different users, side by side, with row counts that differ by RLS; one-click "try a write as a viewer" that surfaces a real Postgres RLS violation
- Responsive design (Tailwind + shadcn/ui) down to 375px

---

## Demo accounts

Three demo users are seeded by `db/migrations/0004_demo_users.sql`. All share the password `enclave-demo`.

| Email | Role | Entity access |
|---|---|---|
| `sarah.chen@enclave.demo` | admin | Acme Holdings, Northwind Capital |
| `mike.torres@enclave.demo` | viewer | Torres Ventures (read only) |
| `alex.park@enclave.demo` | advisor | Acme Holdings, Riverside Partners, Chen Family Office |

The login page has one-click buttons for each account. Rotate these passwords before going to production — the README's production hardening section covers it.

---

## Getting started

See [DEPLOY.md](./DEPLOY.md) for the full step-by-step guide. The short version: create a Neon project, apply the four migration files, fill in three environment variables, push to GitHub, and deploy to Vercel. Estimated time: about 30 minutes.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14.2 (App Router) |
| Language | TypeScript (strict) |
| Database | Neon (serverless Postgres) |
| Auth | Auth.js v5 (NextAuth) — Credentials provider |
| Storage | Vercel Blob |
| UI | Tailwind CSS 3.4 + shadcn/ui + Radix primitives |
| Charts | Recharts |
| Icons | lucide-react |

No vendor lock-in. The database migrations are plain Postgres SQL. Auth.js is framework-agnostic. Vercel Blob can be swapped for any S3-compatible store by changing one adapter.

---

## Rebranding

Rename in `package.json`, swap the wordmark SVG in `public/brand/`, replace the landing page copy in `src/app/page.tsx`, done. Everything else — schema, auth, RLS, document storage — is already wired up and working under whatever name you ship.

---

## What's NOT included

- Stripe or any billing integration
- Email notifications or transactional email
- Real-time subscriptions
- Custom domain (the demo runs on a free Vercel subdomain)

These are all reasonable next features. The schema is already entity-scoped so subscriptions can live on `entities`. The RLS pattern extends naturally to an `audit_log` table.

---

## License

MIT. Buyers may rebrand and resell the deployed product without restriction.
