#!/usr/bin/env node
// One-shot migration runner — reads DATABASE_URL from .env.local and applies
// db/migrations/0001 through 0004 in order.
// Run from repo root: node db/migrate.mjs

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Pool, neon } from "@neondatabase/serverless";

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, "..");

// Read DATABASE_URL from .env.local (never from environment so we don't
// accidentally hit a production database).
const envPath = join(repoRoot, ".env.local");
const envContent = readFileSync(envPath, "utf8");
const match = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!match) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}
const DATABASE_URL = match[1].trim();

// Use Pool for raw SQL (migrations); Pool.query(string) runs arbitrary SQL
// unlike the neon() tagged template which only accepts parameterized queries.
const pool = new Pool({ connectionString: DATABASE_URL });
const sql = neon(DATABASE_URL);   // kept for the verification query at the end

const migrations = [
  "0001_schema.sql",
  "0002_rls.sql",
  "0003_seed.sql",
  "0004_demo_users.sql",
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
console.log("\nDone.");
