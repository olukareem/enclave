// Auth.js v5 catch-all route handler.
// This single file handles all Auth.js HTTP operations:
//   GET  /api/auth/session          — read current session
//   POST /api/auth/signin/credentials — sign in with email + password
//   POST /api/auth/signout          — sign out
//   GET  /api/auth/csrf             — CSRF token for forms

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
