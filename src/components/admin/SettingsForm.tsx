"use client";

// ─────────────────────────────────────────────────────────────
// src/components/admin/SettingsForm.tsx
// Settings form — loads current settings, submits updates.
// Manages its own fetch lifecycle so the page stays a pure
// Server Component that only passes the initial snapshot.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaTelegramPlane } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type { SettingsFormValues, SettingsDTO } from "@/types";

interface SettingsFormProps {
  /** Initial snapshot from the Server Component (avoids a loading flash) */
  initial: SettingsDTO;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function SettingsForm({ initial }: SettingsFormProps) {
  const [saveState,   setSaveState  ] = useState<SaveState>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver:      zodResolver(settingsSchema),
    defaultValues: {
      whatsappNumber: initial.whatsappNumber,
      facebookUrl:    initial.facebookUrl,
      instagramUrl:   initial.instagramUrl,
      tiktokUrl:      initial.tiktokUrl,
      telegramUrl:    initial.telegramUrl,
    },
  });

  // Auto-clear "saved" banner after 3 s
  useEffect(() => {
    if (saveState !== "saved") return;
    const t = setTimeout(() => setSaveState("idle"), 3000);
    return () => clearTimeout(t);
  }, [saveState]);

  const onSubmit = async (values: SettingsFormValues) => {
    setSaveState("saving");
    setServerError(null);

    try {
      const res  = await fetch("/api/settings", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(values),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "حدث خطأ غير متوقع");
      }

      // Re-sync form default values so isDirty resets to false
      reset(values);
      setSaveState("saved");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
      setSaveState("error");
    }
  };

  const isSaving = saveState === "saving";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">

      {/* Success banner */}
      {saveState === "saved" && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-5 py-4 animate-fade-in"
        >
          <span className="text-green-600 text-xl flex-shrink-0">✅</span>
          <div>
            <p className="font-cairo font-bold text-sm text-green-800">
              تم حفظ الإعدادات بنجاح
            </p>
            <p className="font-cairo text-xs text-green-600 mt-0.5">
              جميع التغييرات محفوظة في قاعدة البيانات
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {saveState === "error" && serverError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-5 py-4"
        >
          <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
          <p className="font-cairo text-sm text-red-700">{serverError}</p>
        </div>
      )}

      {/* ── WhatsApp ─────────────────────────────────────────── */}
      <section className="admin-card space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
               style={{ background: "#e8f5e9" }}>
            📱
          </div>
          <div>
            <h2 className="font-cairo font-black text-base text-brand-text">
              واتساب
            </h2>
            <p className="font-cairo text-xs text-brand-text/50 mt-0.5">
              رقم الواتساب الذي تُرسل إليه الطلبات من العملاء
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="s-whatsapp" className="form-label">
            رقم الواتساب <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 end-4 flex items-center font-cairo text-sm text-brand-text/40 pointer-events-none">
              مثال: +201012506517
            </span>
            <input
              id="s-whatsapp"
              type="tel"
              dir="ltr"
              disabled={isSaving}
              {...register("whatsappNumber")}
              className={cn(
                "form-input text-start",
                errors.whatsappNumber && "form-input-error"
              )}
              placeholder="+201012506517"
            />
          </div>
          {errors.whatsappNumber && (
            <p className="form-error">{errors.whatsappNumber.message}</p>
          )}
          <p className="font-cairo text-xs text-brand-text/40 mt-1.5">
            تضمين رمز الدولة. مثال: +20 للمملكة العربية المصرية
          </p>
        </div>
      </section>

      {/* ── Social Media ─────────────────────────────────────── */}
      <section className="admin-card space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-blue-50">
            🌐
          </div>
          <div>
            <h2 className="font-cairo font-black text-base text-brand-text">
              وسائل التواصل الاجتماعي
            </h2>
            <p className="font-cairo text-xs text-brand-text/50 mt-0.5">
              روابط صفحات المتجر على منصات التواصل. اتركها فارغة إن لم تكن موجودة.
            </p>
          </div>
        </div>

        {/* Facebook */}
        <SocialField
          id="s-facebook"
          label="فيسبوك"
          icon="📘"
          placeholder="https://facebook.com/your-page"
          disabled={isSaving}
          registration={register("facebookUrl")}
          error={errors.facebookUrl?.message}
        />

        {/* Instagram */}
        <SocialField
          id="s-instagram"
          label="إنستجرام"
          icon="📸"
          placeholder="https://instagram.com/your-handle"
          disabled={isSaving}
          registration={register("instagramUrl")}
          error={errors.instagramUrl?.message}
        />

        {/* TikTok */}
        <SocialField
          id="s-tiktok"
          label="تيك توك"
          icon="🎵"
          placeholder="https://tiktok.com/@your-handle"
          disabled={isSaving}
          registration={register("tiktokUrl")}
          error={errors.tiktokUrl?.message}
        />

        {/* Telegram */}
        <SocialField
          id="s-telegram"
          label="تليجرام"
          icon={<FaTelegramPlane className="text-[#229ED9]" />}
          placeholder="https://t.me/username"
          disabled={isSaving}
          registration={register("telegramUrl")}
          error={errors.telegramUrl?.message}
        />
      </section>

      {/* ── Submit ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSaving || !isDirty}
          className={cn(
            "btn-primary min-w-[160px]",
            (isSaving || !isDirty) && "opacity-60 cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <SpinnerIcon />
              جاري الحفظ…
            </span>
          ) : saveState === "saved" ? (
            "✓ محفوظ"
          ) : (
            "حفظ الإعدادات"
          )}
        </button>

        {!isDirty && saveState === "idle" && (
          <p className="font-cairo text-sm text-brand-text/40">
            لا توجد تغييرات غير محفوظة
          </p>
        )}

        {isDirty && (
          <p className="font-cairo text-sm text-amber-600 font-medium">
            ● يوجد تغييرات غير محفوظة
          </p>
        )}
      </div>
    </form>
  );
}

// ── Social field sub-component ────────────────────────────────

function SocialField({
  id,
  label,
  icon,
  placeholder,
  disabled,
  registration,
  error,
}: {
  id:           string;
  label:        string;
  icon:         React.ReactNode;
  placeholder:  string;
  disabled:     boolean;
  registration: ReturnType<ReturnType<typeof useForm<SettingsFormValues>>["register"]>;
  error?:       string;
}) {
  return (
    <div>
      <label htmlFor={id} className="form-label flex items-center gap-1.5">
        <span>{icon}</span>
        {label}
      </label>
      <input
        id={id}
        type="url"
        dir="ltr"
        disabled={disabled}
        {...registration}
        className={cn(
          "form-input text-start",
          error && "form-input-error"
        )}
        placeholder={placeholder}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" />
    </svg>
  );
}
