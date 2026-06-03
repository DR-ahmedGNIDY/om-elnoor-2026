"use client";

// ─────────────────────────────────────────────────────────────
// src/components/admin/AdminSidebar.tsx
// Admin sidebar navigation — Client Component.
// Handles active route highlighting and logout.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ── Nav items ─────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/admin",            label: "الرئيسية",    icon: HomeIcon,       exact: true  },
  { href: "/admin/categories", label: "الأقسام",     icon: FolderIcon,     exact: false },
  { href: "/admin/products",   label: "المنتجات",    icon: BoxIcon,        exact: false },
  { href: "/admin/settings",   label: "الإعدادات",   icon: SettingsIcon,   exact: false },
] as const;

// ── Component ────────────────────────────────────────────────

interface AdminSidebarProps {
  username: string;
  /** Controls mobile drawer open/close */
  open:    boolean;
  onClose: () => void;
}

export function AdminSidebar({ username, open, onClose }: AdminSidebarProps) {
  const pathname   = usePathname();
  const router     = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  function isActive(href: string, exact: boolean): boolean {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await signOut({ redirect: false });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Base layout
          "fixed top-0 end-0 z-30 h-full w-64 flex flex-col",
          "bg-primary shadow-2xl transition-transform duration-300 ease-in-out",
          // Mobile: slide in/out; Desktop: always visible
          "lg:static lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/15 flex-shrink-0 flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="أم النور"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="font-cairo font-black text-white text-sm leading-tight truncate">
              أم النور
            </p>
            <p className="font-cairo text-white/50 text-xs leading-tight">
              لوحة التحكم
            </p>
          </div>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="ms-auto lg:hidden text-white/60 hover:text-white transition-colors p-1"
            aria-label="إغلاق القائمة"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Admin info */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <span className="font-cairo font-black text-gold text-sm">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-cairo font-bold text-white text-sm truncate">
              {username}
            </p>
            <p className="font-cairo text-white/40 text-xs">مدير النظام</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl",
                  "font-cairo font-bold text-sm transition-all duration-150",
                  active
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    active ? "text-gold" : "text-white/50"
                  )}
                />
                {label}
                {active && (
                  <span className="ms-auto w-1.5 h-1.5 rounded-full bg-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: view store + logout */}
        <div className="border-t border-white/10 p-3 space-y-1">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-cairo font-bold text-sm text-white/65 hover:bg-white/8 hover:text-white transition-all"
          >
            <ExternalLinkIcon className="w-5 h-5 flex-shrink-0 text-white/50" />
            عرض الموقع
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
              "font-cairo font-bold text-sm text-white/65 hover:bg-red-500/20 hover:text-red-300",
              "transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <LogoutIcon className="w-5 h-5 flex-shrink-0" />
            {loggingOut ? "جاري الخروج…" : "تسجيل الخروج"}
          </button>
        </div>
      </aside>
    </>
  );
}

// ── SVG icons ─────────────────────────────────────────────────

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function FolderIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
}

function BoxIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function LogoutIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
