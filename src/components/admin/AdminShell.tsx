"use client";

// ─────────────────────────────────────────────────────────────
// src/components/admin/AdminShell.tsx
// Client wrapper that manages the sidebar open/close state.
// Keeps the admin layout Server Component while delegating
// interactive state to this thin client shell.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar  } from "@/components/admin/AdminTopbar";

interface AdminShellProps {
  username: string;
  children: React.ReactNode;
}

export function AdminShell({ username, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar (desktop: always visible, mobile: drawer) */}
      <AdminSidebar
        username={username}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* Mobile topbar */}
        <AdminTopbar onMenuOpen={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
