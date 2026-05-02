// Protect /dashboard/* routes using Auth.js v5's edge-safe auth handler.
// Imports from auth.config.ts (no Node.js-only imports like bcrypt) so this
// file is safe to run in the Vercel Edge Runtime.

import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// The `auth` middleware from the edge-safe config handles JWT decoding only —
// no database calls, no bcrypt. It just reads the cookie and checks auth.user.
export default NextAuth(authConfig).auth;

export const config = {
  // Run middleware on every dashboard sub-route. Skip static assets and API routes.
  matcher: ["/dashboard/:path*"],
};
