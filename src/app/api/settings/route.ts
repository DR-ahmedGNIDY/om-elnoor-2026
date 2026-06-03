// ─────────────────────────────────────────────────────────────
// src/app/api/settings/route.ts
// GET /api/settings  — public, returns the singleton settings doc
// PUT /api/settings  — protected, updates the singleton doc
//
// Settings uses a fixed document id = "main".
// Upsert on GET ensures the document always exists.
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validations";
import { apiSuccess, apiError } from "@/lib/utils";
import type { SettingsDTO } from "@/types";

const SETTINGS_ID = "main";

// ── Shared mapper ─────────────────────────────────────────────

function toSettingsDTO(s: {
  id:             string;
  whatsappNumber: string;
  facebookUrl:    string;
  instagramUrl:   string;
  tiktokUrl:      string;
  updatedAt:      Date;
}): SettingsDTO {
  return {
    id:             s.id,
    whatsappNumber: s.whatsappNumber,
    facebookUrl:    s.facebookUrl,
    instagramUrl:   s.instagramUrl,
    tiktokUrl:      s.tiktokUrl,
    updatedAt:      s.updatedAt.toISOString(),
  };
}

// ── GET /api/settings ─────────────────────────────────────────
export async function GET() {
  try {
    // Upsert guarantees the singleton row always exists,
    // even before the seed script has run.
    const settings = await prisma.settings.upsert({
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

    return apiSuccess(toSettingsDTO(settings));
  } catch (err) {
    console.error("[GET /api/settings]", err);
    return apiError("حدث خطأ أثناء جلب الإعدادات", 500);
  }
}

// ── PUT /api/settings ─────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return apiError("غير مصرح", 401);

  try {
    const body   = await req.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
      return apiError("بيانات غير صالحة", 422, fieldErrors);
    }

    const { whatsappNumber, facebookUrl, instagramUrl, tiktokUrl } = parsed.data;

    const settings = await prisma.settings.upsert({
      where:  { id: SETTINGS_ID },
      update: { whatsappNumber, facebookUrl, instagramUrl, tiktokUrl },
      create: {
        id: SETTINGS_ID,
        whatsappNumber,
        facebookUrl,
        instagramUrl,
        tiktokUrl,
      },
    });

    return apiSuccess(toSettingsDTO(settings));
  } catch (err) {
    console.error("[PUT /api/settings]", err);
    return apiError("حدث خطأ أثناء حفظ الإعدادات", 500);
  }
}
