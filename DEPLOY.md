# Deployment guide

Step-by-step from a fresh clone to a live URL. Total time: about 30 minutes.

---

## 1. Create the Neon project (5 min)

1. Sign in at [neon.tech](https://neon.tech) and click **New project**.
2. Name it `enclave-prod` (or whatever you like). Pick the region closest to your users.
3. Click **Create project**.
4. Copy the **connection string** from the dashboard — it looks like `postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`. You'll need this for `DATABASE_URL`.

Free tier includes 0.5 GB storage, 10 database branches, and serverless compute that scales to zero — no idle cost.

---

## 2. Apply the database migrations (10 min)

Open the **SQL Editor** in the Neon dashboard (or use psql, TablePlus, or any Postgres client pointing at your connection string). Run each file from `db/migrations/` in order, pasting the contents and clicking **Run**:

| Order | File | What it does |
|---|---|---|
| 1 | `0001_schema.sql` | Creates seven tables, enums, and foreign keys |
| 2 | `0002_rls.sql` | Enables RLS and creates the access policies |
| 3 | `0003_seed.sql` | Inserts five demo entities, 51 transactions, and their child rows |
| 4 | `0004_demo_users.sql` | Creates three demo users with bcrypt-hashed passwords and their entity memberships |

After step 4 you should see a `NOTICE` line confirming `3 users, 5 entities, 6 memberships`.

To verify the seed worked, run this query:

```sql
select email, role, e.name as entity
from users u
join user_entity ue on ue.user_id = u.id
join entities e on e.id = ue.entity_id
order by email, e.name;
```

You should see Sarah on Acme + Northwind, Mike on Torres, Alex on Acme + Riverside + Chen.

---

## 3. Set environment variables (3 min)

In the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in three values:

```
DATABASE_URL=postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb
AUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=<from Vercel Blob — see step 4>
```

For `AUTH_SECRET`, run `openssl rand -base64 32` in your terminal or `npx auth secret` — either works.

Run the dev server to verify before deploying:

```bash
pnpm dev
```

Open `http://localhost:3000`, click **Try the demo**, and sign in as Sarah (admin). You should see the Acme dashboard with documents, transactions, and stat cards. Switch entities to Northwind — the data changes. Switch to Mike (viewer) — entity switcher shows only Torres Ventures.

---

## 4. Create the Vercel Blob store (2 min)

1. In the [Vercel dashboard](https://vercel.com/dashboard), go to **Storage → Create**.
2. Choose **Blob** and name the store `enclave-docs`.
3. Click **Create**.
4. Copy the `BLOB_READ_WRITE_TOKEN` from the store's settings page and add it to `.env.local`.

The blob store handles document uploads. Entity-gating is enforced in the upload route — viewers cannot upload regardless of how the request is formed.

---

## 5. Push to GitHub and deploy to Vercel (5 min)

Create a new repo on GitHub, then:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:YOUR-USERNAME/enclave.git
git push -u origin main
```

Make sure `.env.local` is gitignored — it is by default.

In the Vercel dashboard: **Add New → Project**, import the repo. Vercel auto-detects Next.js. Under **Environment Variables**, add:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL` (set to your Vercel deployment URL, e.g. `https://tryenclave.vercel.app`)
- `BLOB_READ_WRITE_TOKEN`

Click **Deploy**. After about 90 seconds you get a live URL.

---

## 6. Smoke test (5 min)

Open the deployed URL and run through this checklist:

1. Land on `/` — see Enclave wordmark, hero, feature cards, schema diagram
2. Click **Try the demo** — `/login` page loads
3. Click **Login as Sarah** — dashboard loads; entity switcher shows Acme + Northwind
4. Open Documents — list shows docs for Acme; switch entity to Northwind, list changes
5. Click a document — signed URL dialog opens
6. As Sarah (admin), upload a small PDF — file appears in the list
7. Sign out, sign in as Mike (viewer) — entity switcher shows only Torres Ventures
8. Documents page — Upload button is disabled with a "Viewer access: read only" tooltip
9. Visit `/dashboard/rls-demo` — split view between Sarah and Mike shows different row counts
10. Click "Try a write as Mike" — toast appears with the RLS violation message
11. Visit `/dashboard/schema` — all seven tables render; click any table to see its policy SQL
12. Refresh any dashboard page — session persists

All 12 passing means the database, auth, and blob storage are all wired up correctly.

---

## Cost estimate at small scale

| Service | Free tier | Monthly cost |
|---|---|---|
| Neon | 500 MB database, serverless compute | $0 until scale |
| Vercel | 100 GB bandwidth, hobby projects | $0 until scale |
| **Total** | | **$0** |

When you outgrow free tiers, Neon's Launch plan is $19/mo and Vercel Pro is $20/mo. The architecture scales without code changes.

---

## Production hardening

Before real customers use the app:

- Rotate the demo passwords from `enclave-demo` to something real, or delete the seeded accounts and create new ones through your onboarding flow.
- Set up a custom domain in Vercel and update `NEXTAUTH_URL` to match.
- Enable Neon connection pooling (PgBouncer) if you expect high concurrent traffic — toggle it in the Neon dashboard under **Connection pooling**.
- Add Sentry or a similar error tracker — none is wired up by default.
- Implement a proper signup flow. The current auth setup handles credentials login; signup with invite or self-serve is the logical next piece.
