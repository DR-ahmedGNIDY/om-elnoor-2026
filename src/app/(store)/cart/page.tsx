// ─────────────────────────────────────────────────────────────
// src/app/(store)/cart/page.tsx
// Cart page — reads items from Zustand store (localStorage).
// WhatsApp checkout integration is wired in Phase 8.
// This page only handles the item list and quantity UI.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { CartPageClient } from "./CartPageClient";

export const metadata: Metadata = {
  title:  "سلة التسوق",
  robots: { index: false },
};

export default function CartPage() {
  // Cart state lives client-side (localStorage via Zustand).
  // The Server Component is just a thin shell.
  return <CartPageClient />;
}
