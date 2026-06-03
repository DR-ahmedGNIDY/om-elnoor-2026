// ─────────────────────────────────────────────────────────────
// src/app/api/auth/[...nextauth]/route.ts
// NextAuth v5 catch-all API route.
// Handles: POST /api/auth/signin, GET /api/auth/session,
//          POST /api/auth/signout, GET /api/auth/csrf, etc.
// ─────────────────────────────────────────────────────────────

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
