// ─────────────────────────────────────────────────────────────
// src/app/(store)/layout.tsx
// Public store layout — wraps all customer-facing pages.
// Renders the Header and Footer around page content.
// The (store) route group does not add a URL segment.
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import type { CategoryDTO, SettingsDTO } from "@/types";

// Fetch nav data once at the layout level so every page
// gets categories + settings without redundant queries.
async function getLayoutData(): Promise<{
  categories: CategoryDTO[];
  settings:   SettingsDTO;
}> {
  const [rawCats, rawSettings] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      select:  { id: true, name: true, slug: true, imageUrl: true,
                 createdAt: true, updatedAt: true },
    }),
    prisma.settings.upsert({
      where:  { id: "main" },
      update: {},
      create: {
        id:             "main",
        whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+201012506517",
        facebookUrl:    "",
        instagramUrl:   "",
        tiktokUrl:      "",
        telegramUrl:    "",
      },
    }),
  ]);

  const categories: CategoryDTO[] = rawCats.map((c) => ({
    id:        c.id,
    name:      c.name,
    slug:      c.slug,
    imageUrl:  c.imageUrl,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  const settings: SettingsDTO = {
    id:             rawSettings.id,
    whatsappNumber: rawSettings.whatsappNumber,
    facebookUrl:    rawSettings.facebookUrl,
    instagramUrl:   rawSettings.instagramUrl,
    tiktokUrl:      rawSettings.tiktokUrl,
    telegramUrl:    rawSettings.telegramUrl,
    updatedAt:      rawSettings.updatedAt.toISOString(),
  };

  return { categories, settings };
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { categories, settings } = await getLayoutData();

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader categories={categories} settings={settings} />
      <main className="flex-1">{children}</main>
      <StoreFooter settings={settings} categories={categories} />
    </div>
  );
}
