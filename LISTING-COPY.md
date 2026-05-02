# Enclave — Listing Copy

Paste-ready copy for SideProjectors, BuySellStartups, and /r/SaaS.
Screenshots live in `screenshots/`. Swap the placeholder URL once deployed.

---

## SideProjectors

**Title**
Enclave — Multi-tenant B2B client portal starter (Next.js 14 + Neon Postgres RLS)

**Price**
$2,500

**Short description** (shown in listing card)
Production-ready portal infrastructure with database-enforced multi-tenancy. Three demo users, real signed-URL document storage, a visual schema viewer, and an RLS demo page where you can watch Postgres reject unauthorized writes in real time.

**Full description**

Most multi-tenant starters filter rows in the application layer. A developer writes a WHERE clause, wires it to the session, and hopes nobody forgets it. Enclave enforces isolation at the database level with Postgres Row-Level Security — if someone forgets a WHERE clause, Postgres still returns nothing.

The differentiator is provable. There is a live demo at [DEPLOY_URL] with three seeded accounts at different permission levels. Log in as Mike (viewer), hit the Documents page, and you see only his entity's data. Log in as Sarah (admin), and you see two entities. Visit /dashboard/rls-demo and click "Try a write as Mike" — the button calls the real /api/data endpoint, Postgres evaluates the WITH CHECK policy, and returns a genuine 42501 error. You are not clicking a mock. You are watching the database say no.

**What's in the repo**

Seven-table schema (users, entities, user_entity, documents, transactions, assets, obligations) with RLS policies on every domain table. Four SQL migration files you paste into any Postgres 14+ database — Neon, Railway, or your own hosted instance. Auth.js v5 with a Credentials provider, bcrypt-hashed demo passwords, and JWT session cookies. Vercel Blob document storage with entity-gated upload. A schema viewer page that renders the FK graph and policy SQL. An RLS demo page with a split-panel view showing the same query returning different rows for different users.

**Stack**
Next.js 14 (App Router) — Neon serverless Postgres — Auth.js v5 — Vercel Blob — Tailwind CSS — shadcn/ui

**What's not included**
Stripe or any payment integration. Email notifications. Real-time subscriptions. A custom domain. The buyer needs a Neon account (free tier covers this), a Vercel account (free tier covers this), and a Vercel Blob store (free tier covers this). Estimated setup time following the included DEPLOY.md is 30 minutes.

**Demo**
[DEPLOY_URL]

**GitHub**
[GITHUB_URL]

---

## BuySellStartups.com

**Listing title**
Enclave — Multi-Tenant B2B Client Portal Starter | Next.js 14 + Postgres RLS

**Category**
SaaS / Starter / Developer Tool

**Asking price**
$2,500

**Revenue**
$0 (pre-revenue starter)

**Description**

Enclave is a deployable client portal starter built for agencies, accountants, law firms, family offices, and any B2B product where customers manage data on behalf of multiple "entities." Users belong to entities with per-relationship roles (admin, advisor, viewer). Access control is enforced at the database level, not the application layer.

The architecture is complete: schema, migrations, auth, document storage, and two diagnostic pages — a schema viewer and an RLS demo — that let a buyer verify the isolation actually works before shipping a single line of their own product code.

The stack is Neon serverless Postgres (connection pooling included, free tier handles ~500 concurrent users), Auth.js v5 with a Credentials provider (swap for OAuth providers in one file), and Vercel Blob for document storage. The four SQL migration files work on any Postgres 14+ host — not locked to any platform.

The RLS demo page is the most honest proof of value. It shows the same SELECT query returning different rows for two users simultaneously, and includes a write-violation test that calls the real database endpoint and returns the actual Postgres error code 42501. No mock, no simulation — the database is doing the enforcement.

**What transfers with the sale**
Full source code. Four database migration files (schema, RLS policies, seed data, demo users). One-click deploy guide for Neon + Vercel. Three seeded demo accounts with bcrypt-hashed passwords. All existing screenshots. No SLAs, no post-sale support (negotiable separately).

**What does not transfer**
Domain name (buyer registers their own). Cloud accounts (buyer uses their own Neon and Vercel). No MRR or user base.

**Technology**
- Next.js 14 App Router with server components and server actions
- Neon serverless Postgres (@neondatabase/serverless HTTP driver)
- Auth.js v5 (Credentials provider, JWT sessions, edge-safe middleware split)
- Vercel Blob document storage
- Tailwind CSS + shadcn/ui component library
- TypeScript throughout

**Live demo**
[DEPLOY_URL]

**Source**
[GITHUB_URL]

---

## /r/SaaS and /r/SideProject post

**Title**
I built a multi-tenant B2B portal starter with real Postgres RLS — selling it for $2,500

**Body**

Built this as a portfolio piece and it ended up being more complete than I expected, so I'm selling it.

It's a client portal where each user can belong to multiple "entities" (think client accounts, legal matters, fund trusts, whatever) with a role per relationship. The access control is enforced by Postgres Row-Level Security, not application-layer WHERE clauses. The difference matters: a forgotten WHERE clause leaks data; a forgotten RLS policy returns empty.

There's a demo at [DEPLOY_URL]. Log in as Mike (viewer) and you see one entity. Log in as Sarah (admin) and you see two. Visit the RLS demo page and click the write-violation button — it hits the real database and returns the actual Postgres 42501 error. Worth clicking just to see it.

Stack: Next.js 14 App Router, Neon Postgres, Auth.js v5, Vercel Blob, shadcn/ui.

Includes the full source, four SQL migration files that work on any Postgres 14+ host, a deploy guide, and three seeded demo accounts. Asking $2,500. Listing is on SideProjectors: [SIDEPROJECTORS_URL]

DMs open.

---

## Outbound DM template (for dev agency Slack groups / Discord)

If you want to go direct — post this in relevant #jobs, #tools, or #marketplace channels.

---

Building a portal product and don't want to wire multi-tenancy from scratch? I'm selling a Next.js 14 starter with working Postgres RLS, Auth.js v5, and Vercel Blob document storage. The RLS isolation is actually provable — there's a demo page where you can watch Postgres reject unauthorized writes in real time.

$2,500. Full source + deploy guide. [DEPLOY_URL] | [GITHUB_URL]

---

## After deploying — checklist before pasting these anywhere

- [ ] Replace all `[DEPLOY_URL]` placeholders with the live Vercel URL
- [ ] Replace all `[GITHUB_URL]` placeholders with the public GitHub repo URL
- [ ] Replace `[SIDEPROJECTORS_URL]` in the Reddit post once the SideProjectors listing is live
- [ ] Run the 12-step smoke test in DEPLOY.md against the live URL
- [ ] Take the 8 screenshots listed below and upload to each listing

## Screenshot checklist

1. Landing page (`/`) — marketing hero, wordmark, "Try the demo" CTA
2. Login page (`/login`) — three demo account cards with role badges
3. Dashboard overview (`/dashboard`) — stat cards, entity switcher active
4. Documents page (`/dashboard/documents`) — table rows with file types and sizes
5. Schema viewer (`/dashboard/schema`) — FK graph with all 7 tables
6. RLS demo split-view (`/dashboard/rls-demo`) — two panels with different row counts
7. Signed-URL dialog — dialog open over a document row
8. Mobile view — dashboard at 390px viewport width
