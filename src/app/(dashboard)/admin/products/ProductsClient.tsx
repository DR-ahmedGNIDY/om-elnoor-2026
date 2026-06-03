"use client";

// ─────────────────────────────────────────────────────────────
// src/app/admin/products/ProductsClient.tsx
// Interactive products management table.
// Search, category filter, and full CRUD via /api/products.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { ProductForm    } from "@/components/admin/ProductForm";
import { ConfirmDialog  } from "@/components/admin/ConfirmDialog";
import { Modal          } from "@/components/admin/Modal";
import { formatPrice, formatDateAr, cn } from "@/lib/utils";
import type { ProductWithCategoryDTO, CategoryWithCountDTO } from "@/types";

interface Props {
  initialProducts: ProductWithCategoryDTO[];
  categories:      CategoryWithCountDTO[];
}

export function ProductsClient({ initialProducts, categories }: Props) {
  const [products,     setProducts    ] = useState<ProductWithCategoryDTO[]>(initialProducts);
  const [modalMode,    setModalMode   ] = useState<"create" | "edit" | null>(null);
  const [selected,     setSelected    ] = useState<ProductWithCategoryDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductWithCategoryDTO | null>(null);
  const [deleting,     setDeleting    ] = useState(false);
  const [deleteError,  setDeleteError ] = useState<string | null>(null);

  // ── Filter state ───────────────────────────────────────────
  const [search,      setSearch     ] = useState("");
  const [filterCat,   setFilterCat  ] = useState<string>("all");
  const [filterStatus,setFilterStatus] = useState<
    "all" | "available" | "unavailable" | "offer" | "featured"
  >("all");

  // ── Derived filtered list ──────────────────────────────────
  const filtered = useMemo(() => {
    let list = products;

    if (filterCat !== "all") {
      list = list.filter((p) => p.categoryId === filterCat);
    }

    if (filterStatus === "available")   list = list.filter((p) =>  p.available);
    if (filterStatus === "unavailable") list = list.filter((p) => !p.available);
    if (filterStatus === "offer")       list = list.filter((p) =>  p.isOffer);
    if (filterStatus === "featured")    list = list.filter((p) =>  p.isFeatured);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, search, filterCat, filterStatus]);

  // ── CRUD handlers ──────────────────────────────────────────
  const handleCreated = useCallback((p: ProductWithCategoryDTO) => {
    setProducts((prev) => [p, ...prev]);
    setModalMode(null);
  }, []);

  const handleUpdated = useCallback((p: ProductWithCategoryDTO) => {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    setModalMode(null);
    setSelected(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res  = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "فشل الحذف");
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "حدث خطأ أثناء الحذف");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const openCreate = () => { setSelected(null); setModalMode("create"); };
  const openEdit   = (p: ProductWithCategoryDTO) => { setSelected(p); setModalMode("edit"); };
  const closeModal = () => { setModalMode(null); setSelected(null); };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-cairo font-black text-2xl text-brand-text">المنتجات</h1>
          <p className="font-cairo text-sm text-brand-text/50 mt-0.5">
            {filtered.length} من {products.length} منتج
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2">
          <PlusIcon />
          إضافة منتج
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {(
          [
            { value: "all",         label: "الكل" },
            { value: "available",   label: "متوفر" },
            { value: "unavailable", label: "غير متوفر" },
            { value: "offer",       label: "عروض" },
            { value: "featured",    label: "مميزة" },
          ] as const
        ).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-lg font-cairo font-bold text-sm transition-all",
              filterStatus === value
                ? "bg-white text-primary shadow-sm"
                : "text-brand-text/50 hover:text-brand-text"
            )}
          >
            {label}
            <span className={cn(
              "ms-1.5 text-xs",
              filterStatus === value ? "text-primary/70" : "text-brand-text/30"
            )}>
              {value === "all"         ? products.length
               : value === "available"   ? products.filter(p =>  p.available).length
               : value === "unavailable" ? products.filter(p => !p.available).length
               : value === "offer"       ? products.filter(p =>  p.isOffer).length
               :                          products.filter(p =>  p.isFeatured).length}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar: search + category filter */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-brand-text/30 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في المنتجات…"
            className="form-input ps-9"
          />
        </div>

        {/* Category filter */}
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="form-select w-auto min-w-[160px]"
        >
          <option value="all">جميع الأقسام</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table / empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          hasProducts={products.length > 0}
          onAdd={openCreate}
          onClear={() => { setSearch(""); setFilterCat("all"); setFilterStatus("all"); }}
        />
      ) : (
        <div className="admin-card overflow-hidden p-0">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {["المنتج", "القسم", "السعر", "الحالة", "التاريخ", ""].map((h, i) => (
                    <th key={i} className={cn(
                      "px-4 py-3 font-cairo font-bold text-xs text-brand-text/50 uppercase tracking-wide",
                      i === 0 ? "text-start" : i === 5 ? "" : "text-center"
                    )}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    onEdit={() => openEdit(p)}
                    onDelete={() => { setDeleteTarget(p); setDeleteError(null); }}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={() => openEdit(p)}
                onDelete={() => { setDeleteTarget(p); setDeleteError(null); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={modalMode !== null}
        title={modalMode === "edit" ? "تعديل المنتج" : "إضافة منتج جديد"}
        onClose={closeModal}
        maxWidth="max-w-2xl"
      >
        <ProductForm
          product={modalMode === "edit" ? selected ?? undefined : undefined}
          categories={categories}
          onSuccess={modalMode === "edit" ? handleUpdated : handleCreated}
          onCancel={closeModal}
        />
      </Modal>

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف المنتج"
        description={
          deleteError
            ? deleteError
            : `هل أنت متأكد من حذف "${deleteTarget?.name}"؟ لا يمكن التراجع.`
        }
        confirmLabel="حذف"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
      />
    </div>
  );
}

// ── Desktop row ───────────────────────────────────────────────

function ProductRow({
  product: p,
  onEdit,
  onDelete,
}: {
  product:  ProductWithCategoryDTO;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      {/* Product */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-xl">
            {p.images[0] ? (
              <Image src={p.images[0]} alt={p.name} width={44} height={44} className="w-full h-full object-cover" />
            ) : "🏠"}
          </div>
          <div className="min-w-0">
            <p className="font-cairo font-bold text-sm text-brand-text truncate max-w-[180px]">
              {p.name}
            </p>
            <p className="font-cairo text-xs text-brand-text/40 mt-0.5 truncate max-w-[180px]">
              {p.images.length} {p.images.length === 1 ? "صورة" : "صور"}
            </p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3 text-center">
        <span className="badge badge-gray">{p.category.name}</span>
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-center">
        <p className="font-cairo font-black text-sm text-primary">
          {formatPrice(p.discountPrice ?? p.originalPrice)}
        </p>
        {p.discountPercent > 0 && (
          <p className="font-cairo text-xs text-brand-text/40 line-through mt-0.5">
            {formatPrice(p.originalPrice)}
          </p>
        )}
      </td>

      {/* Flags */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <span className={cn("badge", p.available ? "badge-success" : "badge-danger")}>
            {p.available ? "متوفر" : "غير متوفر"}
          </span>
          {p.isFeatured && <span className="badge badge-gold">مميز</span>}
          {p.isOffer    && <span className="badge badge-primary">عرض</span>}
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-center">
        <span className="font-cairo text-xs text-brand-text/40">
          {formatDateAr(p.createdAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button onClick={onEdit}   className="btn-icon text-primary hover:bg-primary/10" aria-label={`تعديل ${p.name}`}><EditIcon /></button>
          <button onClick={onDelete} className="btn-icon text-red-500 hover:bg-red-50"     aria-label={`حذف ${p.name}`}><TrashIcon /></button>
        </div>
      </td>
    </tr>
  );
}

// ── Mobile card ───────────────────────────────────────────────

function ProductCard({
  product: p,
  onEdit,
  onDelete,
}: {
  product:  ProductWithCategoryDTO;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-2xl">
        {p.images[0] ? (
          <Image src={p.images[0]} alt={p.name} width={56} height={56} className="w-full h-full object-cover" />
        ) : "🏠"}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-cairo font-bold text-sm text-brand-text truncate">{p.name}</p>
        <p className="font-cairo text-xs text-brand-text/40 mt-0.5">{p.category.name}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="font-cairo font-black text-sm text-primary">
            {formatPrice(p.discountPrice ?? p.originalPrice)}
          </span>
          <span className={cn("badge text-[10px]", p.available ? "badge-success" : "badge-danger")}>
            {p.available ? "متوفر" : "غير متوفر"}
          </span>
          {p.isFeatured && <span className="badge badge-gold text-[10px]">مميز</span>}
          {p.isOffer    && <span className="badge badge-primary text-[10px]">عرض</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0">
        <button onClick={onEdit}   className="btn-icon text-primary hover:bg-primary/10" aria-label="تعديل"><EditIcon /></button>
        <button onClick={onDelete} className="btn-icon text-red-500 hover:bg-red-50"     aria-label="حذف"><TrashIcon /></button>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────

function EmptyState({
  hasProducts,
  onAdd,
  onClear,
}: {
  hasProducts: boolean;
  onAdd:       () => void;
  onClear:     () => void;
}) {
  return (
    <div className="admin-card flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="text-6xl">{hasProducts ? "🔍" : "📦"}</div>
      <div>
        <h3 className="font-cairo font-black text-lg text-brand-text mb-1">
          {hasProducts ? "لا توجد نتائج" : "لا توجد منتجات بعد"}
        </h3>
        <p className="font-cairo text-sm text-brand-text/50">
          {hasProducts
            ? "جرّب تغيير كلمة البحث أو الفلتر"
            : "أضف أول منتج لبدء عرض مخزونك"}
        </p>
      </div>
      {hasProducts ? (
        <button onClick={onClear} className="btn btn-outline btn-sm">
          إلغاء الفلاتر
        </button>
      ) : (
        <button onClick={onAdd} className="btn-primary gap-2 mt-2">
          <PlusIcon />
          إضافة أول منتج
        </button>
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}
