// ─────────────────────────────────────────────────────────────
// src/app/(store)/loading.tsx
// Shown by Next.js App Router while any (store) page is loading.
// Matches the rough layout of a product grid page.
// ─────────────────────────────────────────────────────────────

export default function StoreLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="bg-hero-gradient h-64 animate-pulse" />

      {/* Grid skeleton */}
      <div className="container-store py-10">
        <div className="skeleton h-8 w-48 rounded-xl mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-product" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton h-8 w-full rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
