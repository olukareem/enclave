#!/usr/bin/env node
// One-shot migration runner — reads ADMIN_DATABASE_URL from .env.local and
// applies db/migrations/0001 through 0005 in order.
// Run from repo root: node db/migrate.mjs
//
// Uses ADMIN_DATABASE_URL (the owner connection, which has BYPASSRLS) rather
// than DATABASE_URL (the enclave_app connection, which doesn't). Migrations
// must run as the database owner so they can create roles, set up RLS, and
// insert seed data without hitting the policies they're creating.

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Pool, neon } from "@neondatabase/serverless";

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, "..");

// Read ADMIN_DATABASE_URL from .env.local (falls back to DATABASE_URL so the
// runner still works on a fresh clone before 0005 creates the app role).
const envPath = join(repoRoot, ".env.local");
const envContent = readFileSync(envPath, "utf8");

const adminMatch =
  envContent.match(/^ADMIN_DATABASE_URL=(.+)$/m) ||
  envContent.match(/^DATABASE_URL=(.+)$/m);
if (!adminMatch) {
  console.error("ADMIN_DATABASE_URL (or DATABASE_URL) not found in .env.local");
  process.exit(1);
}
const ADMIN_URL = adminMatch[1].trim();

// Use Pool for raw SQL (migrations); Pool.query(string) runs arbitrary SQL
// unlike the neon() tagged template which only accepts parameterized queries.
const pool = new Pool({ connectionString: ADMIN_URL });
const sql = neon(ADMIN_URL); // kept for the verification query at the end

const migrations = [
  "0001_schema.sql",
  "0002_rls.sql",
  "0003_seed.sql",
  "0004_demo_users.sql",
  "0005_app_role.sql",
];

console.log("Connecting to Neon…\n");

for (const file of migrations) {
  const filePath = join(__dir, "migrations", file);
  const query = readFileSync(filePath, "utf8");
  console.log(`Running ${file}…`);
  try {
    await pool.query(query);
    console.log(`  ✓ ${file} applied\n`);
  } catch (err) {
    console.error(`  ✗ ${file} failed:\n  ${err.message}\n`);
    await pool.end();
    process.exit(1);
  }
}

await pool.end();
console.log("All migrations applied. Verifying demo users…");
const users = await sql`SELECT email, full_name FROM public.users ORDER BY email`;
console.log("\nDemo users:");
users.forEach((u) => console.log(`  ${u.email}  (${u.full_name})`));
console.log("\nDone.\n");
console.log("Next step: update DATABASE_URL in .env.local and Vercel to use");
console.log("the enclave_app connection string (see 0005_app_role.sql for details).");
