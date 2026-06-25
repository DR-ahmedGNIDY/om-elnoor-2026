// ─────────────────────────────────────────────────────────────
// src/app/(store)/about/page.tsx
// About page — static content, no DB queries needed.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title:       "من نحن",
  description: "تعرف على كوكي هوم في منفلوط، أسيوط",
};

export default function AboutPage() {
  return (
    <div>
      <div className="page-hero">
        <h1 className="page-hero-title">من نحن</h1>
        <p className="page-hero-sub">قصة كوكي هوم</p>
      </div>

      <div className="container-store py-12">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Logo card */}
          <div className="admin-card flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="كوكي هوم"
                width={88}
                height={88}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-cairo font-black text-xl text-brand-text mb-1">
                كوكي هوم
              </h2>
              <p className="font-cairo text-brand-text/60 text-sm">
                كل احتياجات منزلك في مكان واحد
              </p>
              <p className="font-cairo text-brand-text/40 text-xs mt-1">
                📍 منفلوط — أسيوط — مصر
              </p>
            </div>
          </div>

          {/* Story sections */}
          {[
            {
              icon: "📖",
              title: "قصتنا",
              body: "كوكي هوم هي وجهتك الأولى لكل ما يحتاجه منزلك من أدوات ومفروشات عالية الجودة بأسعار تنافسية. نحرص على تقديم أفضل المنتجات المنزلية المتنوعة لتلبية احتياجات كل أسرة.",
            },
            {
              icon: "🎯",
              title: "رسالتنا",
              body: "نسعى دائماً لتوفير أجود المنتجات المنزلية بأسعار في متناول الجميع، مع خدمة عملاء متميزة عبر واتساب لضمان رضا كل عميل ورسم الابتسامة على وجهه.",
            },
            {
              icon: "📍",
              title: "موقعنا",
              body: "نتمركز في منفلوط — أسيوط — مصر، ونخدم جميع أنحاء محافظة أسيوط والمحافظات المجاورة.",
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="admin-card">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-cairo font-black text-lg text-brand-text">{title}</h3>
              </div>
              <p className="font-cairo text-brand-text/70 leading-relaxed">{body}</p>
            </div>
          ))}

          {/* Values grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: "✅", title: "جودة عالية", sub: "منتجات مختارة بعناية" },
              { icon: "💰", title: "أسعار مناسبة", sub: "أفضل الأسعار دائماً" },
              { icon: "⚡", title: "توصيل سريع",  sub: "خدمة توصيل موثوقة"   },
              { icon: "💬", title: "دعم واتساب",  sub: "استجابة فورية دائماً" },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="admin-card text-center p-4">
                <p className="text-3xl mb-2">{icon}</p>
                <p className="font-cairo font-black text-sm text-brand-text">{title}</p>
                <p className="font-cairo text-xs text-brand-text/50 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/contact" className="btn-primary">
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
