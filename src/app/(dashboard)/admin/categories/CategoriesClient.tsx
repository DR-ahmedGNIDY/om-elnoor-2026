"use client";

// ─────────────────────────────────────────────────────────────
// src/app/admin/categories/CategoriesClient.tsx
// Interactive categories management table.
// Receives initial data from the Server Component and manages
// all CRUD mutations client-side via fetch → /api/categories.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import Image from "next/image";
import { CategoryForm   } from "@/components/admin/CategoryForm";
import { ConfirmDialog  } from "@/components/admin/ConfirmDialog";
import { Modal          } from "@/components/admin/Modal";
import { formatDateAr   } from "@/lib/utils";
import type { CategoryWithCountDTO } from "@/types";

interface Props {
  initialCategories: CategoryWithCountDTO[];
}

export function CategoriesClient({ initialCategories }: Props) {
  const [categories, setCategories] = useState<CategoryWithCountDTO[]>(initialCategories);
  const [modalMode,  setModalMode ] = useState<"create" | "edit" | null>(null);
  const [selected,   setSelected  ] = useState<CategoryWithCountDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryWithCountDTO | null>(null);
  const [deleting,   setDeleting  ] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── CRUD handlers ──────────────────────────────────────────

  const handleCreated = useCallback((cat: CategoryWithCountDTO) => {
    setCategories((prev) => [...prev, cat]);
    setModalMode(null);
  }, []);

  const handleUpdated = useCallback((cat: CategoryWithCountDTO) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? cat : c))
    );
    setModalMode(null);
    setSelected(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res  = await fetch(`/api/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "فشل الحذف");
      }

      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "حدث خطأ أثناء الحذف");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const openCreate = () => {
    setSelected(null);
    setModalMode("create");
  };

  const openEdit = (cat: CategoryWithCountDTO) => {
    setSelected(cat);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-cairo font-black text-2xl text-brand-text">
            الأقسام
          </h1>
          <p className="font-cairo text-sm text-brand-text/50 mt-0.5">
            {categories.length} قسم
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2">
          <PlusIcon />
          إضافة قسم
        </button>
      </div>

      {/* Table / empty state */}
      {categories.length === 0 ? (
        <EmptyState onAdd={openCreate} />
      ) : (
        <div className="admin-card overflow-hidden p-0">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3 text-start font-cairo font-bold text-xs text-brand-text/50 uppercase tracking-wide">
                    القسم
                  </th>
                  <th className="px-5 py-3 text-start font-cairo font-bold text-xs text-brand-text/50 uppercase tracking-wide">
                    الرابط (Slug)
                  </th>
                  <th className="px-5 py-3 text-center font-cairo font-bold text-xs text-brand-text/50 uppercase tracking-wide">
                    المنتجات
                  </th>
                  <th className="px-5 py-3 text-start font-cairo font-bold text-xs text-brand-text/50 uppercase tracking-wide">
                    تاريخ الإنشاء
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    onEdit={() => openEdit(cat)}
                    onDelete={() => { setDeleteTarget(cat); setDeleteError(null); }}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-gray-100">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onEdit={() => openEdit(cat)}
                onDelete={() => { setDeleteTarget(cat); setDeleteError(null); }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={modalMode !== null}
        title={modalMode === "edit" ? "تعديل القسم" : "إضافة قسم جديد"}
        onClose={closeModal}
      >
        <CategoryForm
          category={modalMode === "edit" ? selected ?? undefined : undefined}
          onSuccess={modalMode === "edit" ? handleUpdated : handleCreated}
          onCancel={closeModal}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="حذف القسم"
        description={
          deleteError
            ? deleteError
            : `هل أنت متأكد من حذف قسم "${deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
        }
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
      />
    </div>
  );
}

// ── Desktop table row ────────────────────────────────────────

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryWithCountDTO;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      {/* Name + image */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-xl">
            {category.imageUrl ? (
              <Image
                src={category.imageUrl}
                alt={category.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              "📂"
            )}
          </div>
          <span className="font-cairo font-bold text-sm text-brand-text">
            {category.name}
          </span>
        </div>
      </td>

      {/* Slug */}
      <td className="px-5 py-4">
        <code className="font-mono text-xs bg-gray-100 text-brand-text/60 px-2 py-1 rounded-lg">
          {category.slug}
        </code>
      </td>

      {/* Product count */}
      <td className="px-5 py-4 text-center">
        <span className={`badge ${category.productCount > 0 ? "badge-primary" : "badge-gray"}`}>
          {category.productCount} منتج
        </span>
      </td>

      {/* Date */}
      <td className="px-5 py-4">
        <span className="font-cairo text-xs text-brand-text/40">
          {formatDateAr(category.createdAt)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className="btn-icon text-primary hover:bg-primary/10"
            aria-label={`تعديل ${category.name}`}
          >
            <EditIcon />
          </button>
          <button
            onClick={onDelete}
            className="btn-icon text-red-500 hover:bg-red-50"
            aria-label={`حذف ${category.name}`}
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Mobile card ──────────────────────────────────────────────

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryWithCountDTO;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-2xl">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          "📂"
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-cairo font-bold text-sm text-brand-text truncate">
          {category.name}
        </p>
        <p className="font-cairo text-xs text-brand-text/40 mt-0.5 truncate">
          {category.slug} · {category.productCount} منتج
        </p>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onEdit}
          className="btn-icon text-primary hover:bg-primary/10"
          aria-label={`تعديل ${category.name}`}
        >
          <EditIcon />
        </button>
        <button
          onClick={onDelete}
          className="btn-icon text-red-500 hover:bg-red-50"
          aria-label={`حذف ${category.name}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="admin-card flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="text-6xl">📂</div>
      <div>
        <h3 className="font-cairo font-black text-lg text-brand-text mb-1">
          لا توجد أقسام بعد
        </h3>
        <p className="font-cairo text-sm text-brand-text/50">
          أنشئ أول قسم لتنظيم منتجاتك
        </p>
      </div>
      <button onClick={onAdd} className="btn-primary gap-2 mt-2">
        <PlusIcon />
        إضافة أول قسم
      </button>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5"  y1="12" x2="19" y2="12" />
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
