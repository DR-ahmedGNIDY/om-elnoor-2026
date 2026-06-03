// ─────────────────────────────────────────────────────────────
// src/app/robots.ts
// robots.txt — generated via Next.js App Router convention.
// ─────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  [
          "/admin",
          "/admin/",
          "/api/",
          "/uploads/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
