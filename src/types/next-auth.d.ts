// ─────────────────────────────────────────────────────────────
// src/types/next-auth.d.ts
// TypeScript module augmentation for NextAuth v5.
//
// Extends the default Session and JWT types so that
// session.user.id, session.user.name, and token.id
// are fully typed without any `as` casts anywhere in the app.
// ─────────────────────────────────────────────────────────────

import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      /** MongoDB ObjectId of the authenticated admin */
      id: string;
      /** Admin username (e.g. "admin") */
      name: string;
    } & Omit<DefaultSession["user"], "name" | "email" | "image">;
  }

  interface User extends DefaultUser {
    /** MongoDB ObjectId — populated by CredentialsProvider.authorize() */
    id: string;
    /** Admin username */
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    /** MongoDB ObjectId persisted into the token in the jwt() callback */
    id: string;
    /** Admin username persisted into the token in the jwt() callback */
    username: string;
  }
}
