// ─────────────────────────────────────────────────────────────
// src/app/admin/loading.tsx
// Loading skeleton for admin pages while data fetches.
// ─────────────────────────────────────────────────────────────

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page title */}
      <div className="skeleton h-8 w-48 rounded-xl" />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-card flex items-center gap-4">
            <div className="skeleton w-12 h-12 rounded-2xl flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-7 w-16 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="skeleton h-4 w-32 rounded" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
            <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
            <div className="skeleton h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
