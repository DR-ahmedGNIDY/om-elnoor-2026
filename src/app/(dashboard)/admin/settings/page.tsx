// ─────────────────────────────────────────────────────────────
// src/app/admin/settings/page.tsx
// Settings management page — Server Component.
//
// Fetches the current settings directly via Prisma (not via
// fetch) for zero-latency initial render, then hands the
// snapshot to the SettingsForm client component.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { SettingsDTO } from "@/types";

export const metadata: Metadata = { title: "إعدادات المتجر" };
export const dynamic = "force-dynamic";

const SETTINGS_ID = "main";

export default async function AdminSettingsPage() {
  // Upsert so we always have a document to show, even pre-seed
  const raw = await prisma.settings.upsert({
    where:  { id: SETTINGS_ID },
    update: {},
    create: {
      id:             SETTINGS_ID,
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+201012506517",
      facebookUrl:    "",
      instagramUrl:   "",
      tiktokUrl:      "",
    },
  });

  const settings: SettingsDTO = {
    id:             raw.id,
    whatsappNumber: raw.whatsappNumber,
    facebookUrl:    raw.facebookUrl,
    instagramUrl:   raw.instagramUrl,
    tiktokUrl:      raw.tiktokUrl,
    updatedAt:      raw.updatedAt.toISOString(),
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Page header */}
      <div>
        <h1 className="font-cairo font-black text-2xl text-brand-text">
          إعدادات المتجر
        </h1>
        <p className="font-cairo text-sm text-brand-text/50 mt-0.5">
          آخر تحديث: {new Intl.DateTimeFormat("ar-EG", {
            year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit",
          }).format(new Date(settings.updatedAt))}
        </p>
      </div>

      {/* Form */}
      <SettingsForm initial={settings} />
    </div>
  );
}
