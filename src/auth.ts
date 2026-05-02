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
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        if (!email || !password) return null;

        const sql = neon(process.env.DATABASE_URL!);
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
