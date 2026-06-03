// ─────────────────────────────────────────────────────────────
// src/lib/auth.ts
// NextAuth v5 (Auth.js) configuration.
//
// Strategy: CredentialsProvider only — admins log in with
// username + bcrypt-hashed password stored in MongoDB.
// Sessions are stored in MongoDB via PrismaAdapter.
// ─────────────────────────────────────────────────────────────

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { NextAuthConfig } from "next-auth";

// ── NextAuth configuration object ────────────────────────────
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as NextAuthConfig["adapter"],

  // Use JWT strategy for credentials provider
  // (Prisma adapter + credentials requires JWT session)
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: "/admin/login",
    error:  "/admin/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "اسم المستخدم", type: "text" },
        password: { label: "كلمة المرور",  type: "password" },
      },

      async authorize(credentials) {
        // Validate inputs exist
        if (
          !credentials?.username ||
          !credentials?.password ||
          typeof credentials.username !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        // Look up admin by username
        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username.trim() },
        });

        if (!admin) return null;

        // Verify bcrypt hash
        const isValid = await bcrypt.compare(
          credentials.password,
          admin.password
        );

        if (!isValid) return null;

        // Return the shape NextAuth expects
        return {
          id:       admin.id,
          name:     admin.username,
          email:    null,  // not used, but satisfies type
        };
      },
    }),
  ],

  callbacks: {
    // Persist admin id and username into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id;
        token.username = user.name;
      }
      return token;
    },

    // Expose admin id and username on the session — fully typed via next-auth.d.ts
    async session({ session, token }) {
      session.user.id   = token.id;
      session.user.name = token.username;
      return session;
    },
  },

  // Restrict access — only allow known admins
  // (additional protection layer on top of middleware)
  events: {},

  debug: process.env.NODE_ENV === "development",
};

// ── Export handlers and helpers ───────────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
