"use client";

// ─────────────────────────────────────────────────────────────
// src/components/store/StoreHeader.tsx
// Sticky top navigation for the public store.
// Shows logo, nav links, categories, cart icon, and CartDrawer.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { CartDrawer } from "@/components/store/CartDrawer";
import { cn } from "@/lib/utils";
import type { CategoryDTO, SettingsDTO } from "@/types";

interface StoreHeaderProps {
  categories: CategoryDTO[];
  settings:   SettingsDTO;
}

const NAV = [
  { href: "/",           label: "الرئيسية",    exact: true  },
  { href: "/categories", label: "الأقسام",     exact: false },
  { href: "/offers",     label: "العروض",      exact: false },
  { href: "/about",      label: "من نحن",      exact: false },
  { href: "/contact",    label: "تواصل معنا",  exact: false },
];

export function StoreHeader({ categories, settings }: StoreHeaderProps) {
  const pathname    = usePathname();
  const count       = useCartStore((s) => s.count);
  const [menuOpen,   setMenuOpen  ] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled,   setScrolled  ] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-shadow duration-200",
        "bg-primary",
        scrolled && "shadow-lg"
      )}
    >
      <div className="container-store">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/15 flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="كوكي هوم"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-cairo font-black text-white text-base leading-tight">
                كوكي هوم
              </p>
              <p className="font-cairo text-gold text-xs leading-tight">
                COKIE HOME
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV.map(({ href, label, exact }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-cairo font-bold text-sm transition-colors",
                  isActive(href, exact)
                    ? "bg-white/15 text-gold"
                    : "text-white/80 hover:text-white hover:bg-white/8"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ms-auto">
            {/* Cart — opens drawer on click */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              aria-label={`السلة (${count} منتج)`}
            >
              <CartIcon />
              {count > 0 && (
                <span className="absolute -top-1 -start-1 w-5 h-5 rounded-full bg-gold text-gold-foreground font-cairo font-black text-[10px] flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="القائمة"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-secondary">
          <div className="container-store py-3 space-y-0.5">
            {NAV.map(({ href, label, exact }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center py-2.5 px-3 rounded-lg font-cairo font-bold text-sm",
                  isActive(href, exact)
                    ? "text-gold bg-white/10"
                    : "text-white/80 hover:text-white hover:bg-white/8"
                )}
              >
                {label}
              </Link>
            ))}

            {/* Categories in mobile menu */}
            {categories.length > 0 && (
              <div className="pt-2 border-t border-white/10 mt-2">
                <p className="font-cairo text-xs text-white/40 px-3 mb-1">الأقسام</p>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="flex items-center py-2 px-3 rounded-lg font-cairo text-sm text-white/70 hover:text-white hover:bg-white/8"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart drawer */}
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}

// ── Icons ─────────────────────────────────────────────────────

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9"  cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6"  y2="18" />
      <line x1="6"  y1="6" x2="18" y2="18" />
    </svg>
  );
}
