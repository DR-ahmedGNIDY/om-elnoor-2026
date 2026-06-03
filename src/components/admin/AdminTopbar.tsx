"use client";

// ─────────────────────────────────────────────────────────────
// src/components/admin/AdminTopbar.tsx
// Mobile topbar — visible on small screens only.
// Renders page title + hamburger to open the sidebar drawer.
// ─────────────────────────────────────────────────────────────

interface AdminTopbarProps {
  onMenuOpen: () => void;
}

export function AdminTopbar({ onMenuOpen }: AdminTopbarProps) {
  return (
    <header className="lg:hidden sticky top-0 z-10 flex items-center justify-between h-14 px-4 bg-primary shadow-md">
      <span className="font-cairo font-black text-white text-base">
        لوحة التحكم
      </span>

      <button
        onClick={onMenuOpen}
        className="text-white/80 hover:text-white transition-colors p-1"
        aria-label="فتح القائمة"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6"  x2="21" y2="6"  />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </header>
  );
}
