// Full Auth.js v5 configuration — Node.js runtime only (bcrypt not Edge-safe).
// Middleware uses the slimmer authConfig from auth.config.ts instead.
//
// Credentials provider: email + password checked against public.users (bcrypt hash).
// Session strategy: JWT stored in an HttpOnly cookie — no database session table.
// The userId in the JWT token is the same UUID used as app.current_user_id in RLS.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import type { DefaultSession } from "next-auth";
import { authConfig } from "@/auth.config";

// Extend the built-in session type so session.user.id is typed throughout the app.
declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      // `authorize` runs on the server — safe to query the database directly.
      // Uses ADMIN_DATABASE_URL because the user isn't authenticated yet, so
      // RLS would block the lookup-by-email. The owner role bypasses RLS,
      // which is correct here: auth IS the privileged step that establishes
      // who the user is. Every subsequent query goes through DATABASE_URL
      // (enclave_app, RLS-enforcing).
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        if (!email || !password) return null;

        const adminUrl = process.env.ADMIN_DATABASE_URL ?? process.env.DATABASE_URL!;
        const sql = neon(adminUrl);
        const rows = await sql`
          SELECT id, email, full_name, password_hash
          FROM public.users
          WHERE email = ${email.toLowerCase().trim()}
          LIMIT 1
        `;

        const user = rows[0] as
          | { id: string; email: string; full_name: string; password_hash: string }
          | undefined;

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.full_name };
      },
    }),
  ],
});
