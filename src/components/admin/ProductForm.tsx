"use client";

// ─────────────────────────────────────────────────────────────
// src/components/admin/ProductForm.tsx
// Create and edit form for products.
// Supports multiple image upload, category select,
// all product fields with Arabic validation messages.
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { productSchema } from "@/lib/validations";
import { cn, calcDiscountPercent, formatPrice } from "@/lib/utils";
import type { ProductFormValues, ProductWithCategoryDTO, CategoryWithCountDTO } from "@/types";

interface ProductFormProps {
  product?:    ProductWithCategoryDTO;
  categories:  CategoryWithCountDTO[];
  onSuccess:   (product: ProductWithCategoryDTO) => void;
  onCancel:    () => void;
}

export function ProductForm({
  product,
  categories,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const isEditing = !!product;
  const fileRef   = useRef<HTMLInputElement>(null);

  const [submitting,  setSubmitting ] = useState(false);
  const [uploading,   setUploading  ] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
  register,
  handleSubmit,
  control,
  watch,
  setValue,
  formState: { errors },
} = useForm<ProductFormValues>({
  resolver: zodResolver(productSchema),
  defaultValues: {
    name: product?.name ?? "",
    description: product?.description ?? "",
    categoryId: product?.categoryId ?? (categories[0]?.id ?? ""),
    images: product?.images ?? [],
    originalPrice: product?.originalPrice ?? null,
    discountPrice: product?.discountPrice ?? null,
    available: product?.available ?? true,
    isFeatured: product?.isFeatured ?? false,
    isOffer: product?.isOffer ?? false,
  },
});

  const images       = watch("images");
  const origPrice    = watch("originalPrice");
  const discPrice    = watch("discountPrice");
  const discPercent  = calcDiscountPercent(origPrice, discPrice);
  const previewPrice = discPrice ?? origPrice;

  // ── Multi-image upload ──────────────────────────────────────
  const handleFilesChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;

      setUploading(true);
      setServerError(null);

      const urls: string[] = [];

      for (const file of files) {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res  = await fetch("/api/upload", { method: "POST", body: fd });
          const json = await res.json();
          if (!res.ok || !json.success) throw new Error(json.error ?? "فشل رفع الصورة");
          urls.push(json.data.url as string);
        } catch (err) {
          setServerError(err instanceof Error ? err.message : "فشل رفع إحدى الصور");
        }
      }

      if (urls.length) {
        setValue("images", [...images, ...urls], { shouldValidate: true });
      }

      // Reset input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
      setUploading(false);
    },
    [images, setValue]
  );

  // Removes the image URL from the product's images array.
  // The uploaded file in /public/uploads/ is intentionally NOT deleted —
  // physical file cleanup is a separate maintenance concern (or manual task).
  const removeImage = (index: number) => {
    setValue(
      "images",
      images.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    [next[from], next[to]] = [next[to], next[from]];
    setValue("images", next);
  };

  // ── Submit ──────────────────────────────────────────────────
  const onSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const url    = isEditing ? `/api/products/${product.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(values),
      });
      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.error ?? "حدث خطأ غير متوقع");

      onSuccess(json.data as ProductWithCategoryDTO);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  };

  const busy = uploading || submitting;

  // ── Field style helpers ─────────────────────────────────────
  const field  = (name: keyof typeof errors) =>
    cn("form-input", errors[name] && "form-input-error");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">


      {/* ── Section: Basic info ─────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="font-cairo font-black text-sm text-brand-text/60 uppercase tracking-wide mb-3">
          المعلومات الأساسية
        </legend>

        {/* Name */}
        <div>
          <label htmlFor="p-name" className="form-label">
            اسم المنتج <span className="text-red-500">*</span>
          </label>
          <input
            id="p-name"
            type="text"
            autoFocus
            disabled={busy}
            {...register("name")}
            className={field("name")}
            placeholder="مثال: طقم حلل جرانيت 7 قطع"
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="p-category" className="form-label">
            القسم <span className="text-red-500">*</span>
          </label>
          <select
            id="p-category"
            disabled={busy}
            {...register("categoryId")}
            className={field("categoryId")}
          >
            <option value="">اختر القسم…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="form-error">{errors.categoryId.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="p-desc" className="form-label">الوصف</label>
          <textarea
            id="p-desc"
            disabled={busy}
            {...register("description")}
            className={cn("form-textarea", errors.description && "form-input-error")}
            placeholder="وصف المنتج، المواصفات، المواد…"
            rows={3}
          />
          {errors.description && (
            <p className="form-error">{errors.description.message}</p>
          )}
        </div>
      </fieldset>

      <div className="divider" />

      {/* ── Section: Images ─────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="font-cairo font-black text-sm text-brand-text/60 uppercase tracking-wide mb-3">
          صور المنتج
        </legend>

        {/* Image grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((url, i) => (
              <div key={url + i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <Image
                  src={url}
                  alt={`صورة ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={url.startsWith("/uploads/")}
                />
                {/* First image badge */}
                {i === 0 && (
                  <span className="absolute top-1 start-1 badge badge-primary text-[10px] px-1.5">
                    رئيسية
                  </span>
                )}
                {/* Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    disabled={i === 0}
                    className="w-7 h-7 rounded-lg bg-white/90 text-brand-text text-xs flex items-center justify-center disabled:opacity-30"
                    title="تقديم"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="w-7 h-7 rounded-lg bg-red-500 text-white text-xs flex items-center justify-center"
                    title="حذف"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    disabled={i === images.length - 1}
                    className="w-7 h-7 rounded-lg bg-white/90 text-brand-text text-xs flex items-center justify-center disabled:opacity-30"
                    title="تأخير"
                  >
                    ←
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {serverError && (
  <div
    role="alert"
    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
  >
    <p className="font-cairo text-sm text-red-700">
      {serverError}
    </p>
  </div>
)}

        {/* Upload trigger */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className={cn(
            "w-full border-2 border-dashed border-gray-200 rounded-xl py-6",
            "flex flex-col items-center gap-2 text-brand-text/40",
            "hover:border-primary hover:text-primary transition-colors",
            busy && "opacity-50 cursor-not-allowed"
          )}
        >
          {uploading ? (
            <>
              <SpinnerIcon className="w-6 h-6 animate-spin" />
              <span className="font-cairo text-sm">جاري رفع الصور…</span>
            </>
          ) : (
            <>
              <UploadIcon className="w-6 h-6" />
              <span className="font-cairo text-sm font-bold">
                {images.length > 0 ? "إضافة صور أخرى" : "رفع صور المنتج"}
              </span>
              <span className="font-cairo text-xs">
                JPEG, PNG, WebP — حتى 5 MB لكل صورة
              </span>
            </>
          )}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />
      </fieldset>

      <div className="divider" />

      {/* ── Section: Pricing ────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="font-cairo font-black text-sm text-brand-text/60 uppercase tracking-wide mb-3">
          السعر
        </legend>

        <div className="grid grid-cols-2 gap-4">
          {/* Original price */}
          <div>
            <label htmlFor="p-orig" className="form-label">
              السعر الأصلي (ج.م)
            </label>
            <Controller
              name="originalPrice"
              control={control}
              render={({ field: f }) => (
                <input
                  id="p-orig"
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={busy}
                  value={f.value ?? ""}
                  onChange={(e) =>
                    f.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                  className={cn(field("originalPrice"), "text-center")}
                  placeholder="اتركه فارغاً إن لم يكن هناك سعر"
                />
              )}
            />
            {errors.originalPrice && (
              <p className="form-error">{errors.originalPrice.message}</p>
            )}
          </div>

          {/* Discount price */}
          <div>
            <label htmlFor="p-disc" className="form-label">
              سعر الخصم (ج.م)
              {discPercent > 0 && (
                <span className="ms-2 badge badge-gold text-xs">
                  خصم {discPercent}%
                </span>
              )}
            </label>
            <Controller
              name="discountPrice"
              control={control}
              render={({ field: f }) => (
                <input
                  id="p-disc"
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={busy}
                  value={f.value ?? ""}
                  onChange={(e) =>
                    f.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                  className={cn(field("discountPrice"), "text-center")}
                  placeholder="اتركه فارغاً إن لم يكن هناك خصم"
                />
              )}
            />
            {errors.discountPrice && (
              <p className="form-error">{errors.discountPrice.message}</p>
            )}
          </div>
        </div>

        {/* Price preview — hidden entirely when neither price is set */}
        {previewPrice !== null && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center gap-4 flex-wrap">
            <span className="font-cairo text-sm text-brand-text/60">معاينة:</span>
            <span className="font-cairo font-black text-lg text-primary">
              {formatPrice(previewPrice)}
            </span>
            {discPercent > 0 && origPrice !== null && (
              <>
                <span className="font-cairo text-sm line-through text-brand-text/30">
                  {formatPrice(origPrice)}
                </span>
                <span className="badge badge-gold">وفّر {discPercent}%</span>
              </>
            )}
          </div>
        )}
      </fieldset>

      <div className="divider" />

      {/* ── Section: Flags ───────────────────────────────────── */}
      <fieldset>
        <legend className="font-cairo font-black text-sm text-brand-text/60 uppercase tracking-wide mb-4">
          الحالة والتصنيف
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ToggleField
            name="available"
            label="متوفر"
            description="يظهر للعملاء"
            icon="✅"
            control={control}
            disabled={busy}
          />
          <ToggleField
            name="isFeatured"
            label="منتج مميز"
            description="يظهر في قسم المميزة"
            icon="⭐"
            control={control}
            disabled={busy}
          />
          <ToggleField
            name="isOffer"
            label="عرض خاص"
            description="يظهر في قسم العروض"
            icon="🏷️"
            control={control}
            disabled={busy}
          />
        </div>
      </fieldset>

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={busy}
          className={cn("btn-primary flex-1 sm:flex-none", busy && "opacity-70 cursor-not-allowed")}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <SpinnerIcon className="w-4 h-4" />
              {isEditing ? "جاري الحفظ…" : "جاري الإنشاء…"}
            </span>
          ) : (
            isEditing ? "حفظ التعديلات" : "إنشاء المنتج"
          )}
        </button>

        <button type="button" onClick={onCancel} disabled={busy} className="btn btn-ghost">
          إلغاء
        </button>
      </div>
    </form>
  );
}

// ── Toggle field component ────────────────────────────────────

function ToggleField({
  name,
  label,
  description,
  icon,
  control,
  disabled,
}: {
  name:        "available" | "isFeatured" | "isOffer";
  label:       string;
  description: string;
  icon:        string;
  control:     ReturnType<typeof useForm<ProductFormValues>>["control"];
  disabled:    boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <button
          type="button"
          role="switch"
          aria-checked={field.value}
          onClick={() => field.onChange(!field.value)}
          disabled={disabled}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border-2 text-start transition-all",
            field.value
              ? "border-primary bg-primary/5 text-primary"
              : "border-gray-200 bg-gray-50 text-brand-text/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <p className="font-cairo font-bold text-sm leading-tight">{label}</p>
            <p className="font-cairo text-xs leading-tight mt-0.5 opacity-70">{description}</p>
          </div>
          {/* Toggle indicator */}
          <div className={cn(
            "ms-auto w-9 h-5 rounded-full flex-shrink-0 transition-colors relative",
            field.value ? "bg-primary" : "bg-gray-300"
          )}>
            <div className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all",
              field.value ? "start-[18px]" : "start-0.5"
            )} />
          </div>
        </button>
      )}
    />
  );
}

// ── Icons ─────────────────────────────────────────────────────

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" />
    </svg>
  );
}
