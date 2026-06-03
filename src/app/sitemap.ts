// ─────────────────────────────────────────────────────────────
// src/app/sitemap.ts
// Dynamic sitemap — Next.js App Router convention.
// Returns all public URLs for Google/Bing indexing.
// ─────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({
      where:  { available: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/categories`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/offers`,      lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/about`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Category pages
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url:             `${BASE}/category/${c.slug}`,
    lastModified:    c.updatedAt,
    changeFrequency: "weekly",
    priority:        0.8,
  }));

  // Product pages
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url:             `${BASE}/product/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: "weekly",
    priority:        0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
