// ─────────────────────────────────────────────────────────────
// src/components/store/StoreFooter.tsx
// Public store footer — Server Component (no interactivity).
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import Image from "next/image";
import type { CategoryDTO, SettingsDTO } from "@/types";

interface StoreFooterProps {
  settings:   SettingsDTO;
  categories: CategoryDTO[];
}

export function StoreFooter({ settings, categories }: StoreFooterProps) {
  const wa = settings.whatsappNumber.replace(/\D/g, "");

  return (
    <footer className="bg-primary-900 text-white mt-16">
      <div className="container-store py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="أم النور"
                  width={44}
                  height={44}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-cairo font-black text-lg leading-tight">أم النور</p>
                <p className="font-cairo text-gold text-sm leading-tight">للأدوات المنزلية</p>
              </div>
            </div>
            <p className="font-cairo text-sm text-white/60 leading-relaxed mb-4">
              كل احتياجات منزلك في مكان واحد — جودة عالية بأسعار مناسبة في منفلوط، أسيوط.
            </p>
            <p className="font-cairo text-xs text-white/40">📍 منفلوط — أسيوط — مصر</p>
          </div>

          {/* Categories column */}
          <div>
            <h3 className="font-cairo font-black text-sm text-gold mb-4 uppercase tracking-wide">
              الأقسام
            </h3>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="font-cairo text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="font-cairo font-black text-sm text-gold mb-4 uppercase tracking-wide">
              تواصل معنا
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-cairo text-sm text-white/60 hover:text-white transition-colors"
                >
                  <span className="text-green-400">📱</span>
                  {settings.whatsappNumber}
                </a>
              </li>
              {settings.facebookUrl && (
                <li>
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 font-cairo text-sm text-white/60 hover:text-white transition-colors">
                    <span>📘</span> فيسبوك
                  </a>
                </li>
              )}
              {settings.instagramUrl && (
                <li>
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 font-cairo text-sm text-white/60 hover:text-white transition-colors">
                    <span>📸</span> إنستجرام
                  </a>
                </li>
              )}
              {settings.tiktokUrl && (
                <li>
                  <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 font-cairo text-sm text-white/60 hover:text-white transition-colors">
                    <span>🎵</span> تيك توك
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-cairo text-xs text-white/30">
            © {new Date().getFullYear()} أم النور للأدوات المنزلية — جميع الحقوق محفوظة
          </p>
          <div className="flex gap-4">
            <Link href="/"          className="font-cairo text-xs text-white/30 hover:text-white/60 transition-colors">الرئيسية</Link>
            <Link href="/categories" className="font-cairo text-xs text-white/30 hover:text-white/60 transition-colors">الأقسام</Link>
            <Link href="/offers"    className="font-cairo text-xs text-white/30 hover:text-white/60 transition-colors">العروض</Link>
            <Link href="/contact"   className="font-cairo text-xs text-white/30 hover:text-white/60 transition-colors">تواصل</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
