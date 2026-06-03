// ─────────────────────────────────────────────────────────────
// src/app/(store)/contact/page.tsx
// Contact page — loads WhatsApp number and social links
// from MongoDB settings via Prisma.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title:       "تواصل معنا",
  description: "تواصل مع أم النور للأدوات المنزلية عبر واتساب أو وسائل التواصل الاجتماعي",
};
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await prisma.settings.upsert({
    where:  { id: "main" },
    update: {},
    create: { id: "main", whatsappNumber: "+201012506517",
              facebookUrl: "", instagramUrl: "", tiktokUrl: "" },
  });

  const wa = settings.whatsappNumber.replace(/\D/g, "");

  const contactItems = [
    {
      href:  `https://wa.me/${wa}?text=${encodeURIComponent("السلام عليكم 👋\nأريد الاستفسار عن منتجاتكم")}`,
      icon:  "📱",
      color: "#e8f5e9",
      title: "واتساب",
      value: settings.whatsappNumber,
      cta:   "راسلنا الآن",
      show:  true,
    },
    {
      href:  settings.facebookUrl,
      icon:  "📘",
      color: "#e8f0fe",
      title: "فيسبوك",
      value: "تابعنا على فيسبوك",
      cta:   "زيارة الصفحة",
      show:  !!settings.facebookUrl,
    },
    {
      href:  settings.instagramUrl,
      icon:  "📸",
      color: "#fce4ec",
      title: "إنستجرام",
      value: "تابعنا على إنستجرام",
      cta:   "زيارة الحساب",
      show:  !!settings.instagramUrl,
    },
    {
      href:  settings.tiktokUrl,
      icon:  "🎵",
      color: "#f3e5f5",
      title: "تيك توك",
      value: "تابعنا على تيك توك",
      cta:   "زيارة الحساب",
      show:  !!settings.tiktokUrl,
    },
    {
      href:  null,
      icon:  "📍",
      color: "#fff8e1",
      title: "موقعنا",
      value: "منفلوط — أسيوط — مصر",
      cta:   null,
      show:  true,
    },
  ].filter((i) => i.show);

  return (
    <div>
      <div className="page-hero">
        <h1 className="page-hero-title">تواصل معنا</h1>
        <p className="page-hero-sub">نحن هنا للمساعدة دائماً — تواصل معنا عبر أي قناة</p>
      </div>

      <div className="container-store py-12">
        <div className="max-w-xl mx-auto space-y-4">
          {contactItems.map(({ href, icon, color, title, value, cta }) =>
            href ? (
              <a
                key={title}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 shadow-card hover:shadow-card-lg hover:-translate-y-0.5 transition-all group"
                style={{ background: color }}
              >
                <span className="text-3xl flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-cairo font-black text-brand-text">{title}</p>
                  <p className="font-cairo text-sm text-brand-text/60 truncate">{value}</p>
                </div>
                {cta && (
                  <span className="font-cairo text-sm font-bold text-primary group-hover:underline flex-shrink-0">
                    {cta} ←
                  </span>
                )}
              </a>
            ) : (
              <div
                key={title}
                className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100"
                style={{ background: color }}
              >
                <span className="text-3xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="font-cairo font-black text-brand-text">{title}</p>
                  <p className="font-cairo text-sm text-brand-text/60">{value}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
