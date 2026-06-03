"use client";

// ─────────────────────────────────────────────────────────────
// src/components/admin/CategoryForm.tsx
// Create and edit form for categories.
// Handles image upload via /api/upload then submits to
// /api/categories or /api/categories/:id.
// ─────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { categorySchema } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type { CategoryFormValues, CategoryWithCountDTO } from "@/types";

interface CategoryFormProps {
  /** When provided, the form is in edit mode */
  category?: CategoryWithCountDTO;
  onSuccess: (category: CategoryWithCountDTO) => void;
  onCancel:  () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const isEditing = !!category;
  const fileRef   = useRef<HTMLInputElement>(null);

  const [uploading,   setUploading  ] = useState(false);
  const [submitting,  setSubmitting ] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [previewUrl,  setPreviewUrl ] = useState<string>(category?.imageUrl ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver:      zodResolver(categorySchema),
    defaultValues: {
      name:     category?.name     ?? "",
      imageUrl: category?.imageUrl ?? "",
    },
  });

  const imageUrl = watch("imageUrl");

  // ── Image upload ────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploading(true);
    setServerError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res  = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "فشل رفع الصورة");
      }

      setValue("imageUrl", json.data.url, { shouldValidate: true });
      setPreviewUrl(json.data.url);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "فشل رفع الصورة");
      setPreviewUrl(category?.imageUrl ?? "");
      setValue("imageUrl", category?.imageUrl ?? "");
    } finally {
      setUploading(false);
    }
  }

  // ── Form submit ─────────────────────────────────────────────
  const onSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const url    = isEditing ? `/api/categories/${category.id}` : "/api/categories";
      const method = isEditing ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(values),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "حدث خطأ غير متوقع");
      }

      onSuccess(json.data as CategoryWithCountDTO);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  };

  const busy = uploading || submitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

      {/* Server error */}
      {serverError && (
        <div role="alert" className="flex gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <span className="text-red-500 flex-shrink-0">⚠️</span>
          <p className="font-cairo text-sm text-red-700">{serverError}</p>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="cat-name" className="form-label">
          اسم القسم <span className="text-red-500">*</span>
        </label>
        <input
          id="cat-name"
          type="text"
          autoFocus
          disabled={busy}
          {...register("name")}
          className={cn("form-input", errors.name && "form-input-error")}
          placeholder="مثال: أطقم الحلل"
        />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
        <p className="font-cairo text-xs text-brand-text/40 mt-1">
          سيتم إنشاء رابط URL للقسم تلقائياً من الاسم
        </p>
      </div>

      {/* Image */}
      <div>
        <label className="form-label">صورة القسم</label>

        {/* Preview */}
        {previewUrl && (
          <div className="mb-3 relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <Image
              src={previewUrl}
              alt="معاينة الصورة"
              fill
              className="object-cover"
              unoptimized={previewUrl.startsWith("blob:")}
            />
            <button
              type="button"
              onClick={() => {
                setPreviewUrl("");
                setValue("imageUrl", "");
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors text-sm"
              aria-label="إزالة الصورة"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className={cn(
              "btn btn-outline btn-sm gap-2",
              busy && "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? (
              <>
                <SpinnerIcon />
                جاري الرفع…
              </>
            ) : (
              <>
                <UploadIcon />
                {previewUrl ? "تغيير الصورة" : "رفع صورة"}
              </>
            )}
          </button>

          {/* Manual URL input as alternative */}
          <input
            type="url"
            {...register("imageUrl")}
            disabled={busy}
            className="form-input flex-1 text-sm"
            placeholder="أو أدخل رابط الصورة مباشرة"
            onChange={(e) => {
              setValue("imageUrl", e.target.value);
              setPreviewUrl(e.target.value);
            }}
          />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {errors.imageUrl && (
          <p className="form-error">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={busy}
          className={cn("btn-primary", busy && "opacity-70 cursor-not-allowed")}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <SpinnerIcon />
              {isEditing ? "جاري الحفظ…" : "جاري الإنشاء…"}
            </span>
          ) : (
            isEditing ? "حفظ التعديلات" : "إنشاء القسم"
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="btn btn-ghost"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

// ── Icons ─────────────────────────────────────────────────────

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" />
    </svg>
  );
}
