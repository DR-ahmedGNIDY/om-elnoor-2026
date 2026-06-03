"use client";

// ─────────────────────────────────────────────────────────────
// src/components/admin/LoginForm.tsx
// Admin login form.
// Uses React Hook Form + Zod for validation.
// Calls NextAuth signIn() on submit.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema } from "@/lib/validations";
import type { LoginFormValues } from "@/types";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/admin";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading,   setIsLoading  ] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setServerError(null);

    const result = await signIn("credentials", {
      username:    values.username,
      password:    values.password,
      redirect:    false,
      callbackUrl,
    });

    setIsLoading(false);

    if (result?.error) {
      setServerError("اسم المستخدم أو كلمة المرور غير صحيحة");
      return;
    }

    if (result?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {/* Server-level error */}
      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3"
        >
          <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
          <p className="font-cairo text-sm text-red-700 font-medium">
            {serverError}
          </p>
        </div>
      )}

      {/* Username */}
      <div>
        <label htmlFor="username" className="form-label">
          اسم المستخدم
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          autoFocus
          disabled={isLoading}
          {...register("username")}
          className={cn(
            "form-input",
            errors.username && "form-input-error"
          )}
          placeholder="admin"
        />
        {errors.username && (
          <p className="form-error">{errors.username.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="form-label">
          كلمة المرور
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={isLoading}
            {...register("password")}
            className={cn(
              "form-input pe-12",
              errors.password && "form-input-error"
            )}
            placeholder="••••••••"
          />
          {/* Show/hide toggle */}
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 start-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? (
              <EyeOffIcon />
            ) : (
              <EyeIcon />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="form-error">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "btn-primary w-full mt-2 text-base h-12",
          isLoading && "opacity-70 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <SpinnerIcon />
            جاري الدخول…
          </span>
        ) : (
          "تسجيل الدخول"
        )}
      </button>
    </form>
  );
}

// ── Inline icons (no extra dependency) ───────────────────────

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" />
    </svg>
  );
}
