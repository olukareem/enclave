// Edge-safe Auth.js configuration — no Node.js-only imports.
// Used by src/middleware.ts which runs in the Edge Runtime.
// The full configuration (with bcryptjs Credentials) lives in src/auth.ts.

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    // `authorized` runs in the Edge Runtime on every matched request.
    // It only needs to decode the JWT (no DB round-trip) to decide if
    // the user can access a dashboard route.
    authorized({ auth, request }) {
      const isAuthed = !!auth?.user?.id;
      const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard && !isAuthed) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.userId) {
        (session.user as typeof session.user & { id: string }).id = token.userId as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  providers: [], // Credentials provider is added in auth.ts (Node.js only)
} satisfies NextAuthConfig;
