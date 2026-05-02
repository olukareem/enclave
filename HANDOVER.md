# Enclave — Ownership Transfer

This document covers everything a buyer needs to take full control of the asset.
Work through each section in order. Estimated total time: 45–60 minutes.

---

## 1. What you receive

- Full source code (this repository)
- Four SQL migration files (`db/migrations/`)
- Deploy guide (`DEPLOY.md`)
- Three seeded demo accounts
- This handover document

You do **not** receive:
- A domain name (register your own)
- Cloud accounts (create your own Neon, Vercel, and GitHub accounts)
- Post-sale support (contact the seller to negotiate a paid support hour block if needed)

---

## 2. Fork and rename the repository

1. On GitHub, fork this repository into your own account
2. Rename the fork to whatever fits your product (Settings → Repository name)
3. Update `package.json` → `"name"` to match
4. Update the `title` and `description` in `src/app/layout.tsx`

---

## 3. Neon database

**Create the project**

1. Go to [neon.tech](https://neon.tech) and create a free project
2. Name it whatever you like — it is your database, not a dependency
3. In the project dashboard, go to **Connection Details**
4. Copy the **Connection string** — it looks like:
   `postgresql://user:pass@ep-xxx-yyy.us-east-2.aws.neon.tech/neondb?sslmode=require`

**Run the migrations**

Open the Neon SQL editor and run each file in order:

```
db/migrations/0001_schema.sql   — creates all tables and enums
db/migrations/0002_rls.sql      — enables RLS and creates all policies
db/migrations/0003_seed.sql     — inserts entities, documents, transactions, assets, obligations
db/migrations/0004_demo_users.sql — creates the three demo users with bcrypt-hashed passwords
```

**Verify**

```sql
SELECT email, full_name FROM public.users;
-- should return three rows: sarah.chen, mike.torres, alex.park
```

**Rotate the demo passwords before launching to real users**

The demo password `enclave-demo` is documented publicly. Replace the hashes:

```sql
UPDATE public.users
SET password_hash = crypt('your-new-password', gen_salt('bf', 10))
WHERE email IN (
  'sarah.chen@enclave.demo',
  'mike.torres@enclave.demo',
  'alex.park@enclave.demo'
);
```

Or delete the demo users entirely and add your real users instead.

---

## 4. Environment variables

Create a `.env.local` file at the repo root (never commit this file):

```
DATABASE_URL=postgresql://...          # from Neon Connection Details
AUTH_SECRET=<output of: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.com   # your Vercel deployment URL
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_... # from Vercel Storage dashboard
```

Add the same four variables to your Vercel project (Settings → Environment Variables).

---

## 5. Vercel Blob store

1. In the Vercel dashboard, go to **Storage** → **Create Database** → **Blob**
2. Name the store (e.g. `enclave-documents`)
3. After creation, click the store → **env.local tab** → copy `BLOB_READ_WRITE_TOKEN`
4. Paste it into both your local `.env.local` and Vercel environment variables

The Blob store is scoped to your Vercel account. The bucket named `documents` is created
automatically on first upload.

---

## 6. Vercel deployment

1. Push your fork to GitHub
2. In the Vercel dashboard, click **Add New Project** → import your fork
3. Framework preset: **Next.js** (auto-detected)
4. Add the four environment variables from Section 4
5. Deploy

First build takes ~90 seconds. After deploy, copy the production URL and set it as
`NEXTAUTH_URL` in Vercel (Settings → Environment Variables → redeploy after updating).

---

## 7. Smoke test

Run through the checklist in `DEPLOY.md` (Section: Smoke test). Key steps:

- Land on `/` — marketing hero loads
- Log in as Sarah (admin) — entity switcher shows Acme Holdings + Northwind Capital
- Documents page — rows appear, only for the active entity
- Upload a small PDF — appears in table after refresh
- Log out, log in as Mike (viewer) — only Torres Ventures
- Upload button disabled for Mike
- `/dashboard/rls-demo` → "Try a write as Mike" → Postgres returns 42501 toast
- `/dashboard/schema` → all 7 tables render with FK arrows

---

## 8. Removing the demo branding

Before launching to real users:

- Update `src/app/login/page.tsx` — change `demoAccounts` array or remove the demo panel entirely
- Update `src/app/page.tsx` — replace marketing copy with your product description
- Update metadata in `src/app/layout.tsx` — title, description, Open Graph
- Update `public/brand/wordmark.svg` — swap for your own wordmark
- Delete `db/migrations/0004_demo_users.sql` after rotating demo passwords

---

## 9. Adding your own auth providers

`src/auth.ts` — add any Auth.js-supported provider alongside the Credentials provider.
Examples: GitHub, Google, Azure AD. See [authjs.dev/reference/nextjs](https://authjs.dev/reference/nextjs).

No other files need to change. The session shape (`session.user.id`) stays the same regardless
of which provider authenticated the user.

---

## 10. Swapping document storage

Vercel Blob is the default but not required. The upload and retrieval logic lives entirely in
`src/app/api/blob/route.ts`. Replace the `@vercel/blob` calls with any compatible SDK:

- AWS S3: `@aws-sdk/client-s3` + `createPresignedPost`
- Cloudflare R2: same S3 SDK, different endpoint
- Uploadthing: `@uploadthing/next`
- Backblaze B2: S3-compatible, same SDK pattern

The entity-membership check before upload (lines ~20–40 in `route.ts`) stays the same — it
is not storage-provider-specific.

---

## 11. Scaling beyond the free tier

| Service | Free tier limit | When to upgrade |
|---|---|---|
| Neon | 0.5 GB storage, 1 compute unit | >500 active users or >500 MB data |
| Vercel Functions | 100 GB-hours/month | High API traffic |
| Vercel Blob | 500 MB storage | Significant document uploads |

All three services scale without code changes — just upgrade the plan in each dashboard.

---

## 12. Seller contact

Include seller email or preferred contact method when distributing this document to the buyer.
