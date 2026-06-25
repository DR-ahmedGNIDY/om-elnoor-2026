// ─────────────────────────────────────────────────────────────
// src/app/(auth)/admin/login/page.tsx
// Public login page.
// If already authenticated → redirect to /admin
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await auth();

  // لو المستخدم مسجل دخول بالفعل
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      {/* Decorative background circles */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {[
          "w-96 h-96 -top-20 -right-20 opacity-[0.06]",
          "w-64 h-64 bottom-10 -left-16 opacity-[0.04]",
          "w-40 h-40 top-1/2 left-1/3 opacity-[0.03]",
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-gold ${cls}`}
          />
        ))}
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Card header */}
          <div className="bg-hero-gradient px-8 pt-10 pb-8 text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/logo1.png"
                alt="كوكي هوم"
                width={72}
                height={72}
                className="object-contain"
                priority
              />
            </div>

            <h1 className="font-cairo font-black text-2xl text-white leading-snug">
              كوكي هوم
            </h1>

            <p className="font-cairo text-white/70 text-sm mt-1">
              لوحة التحكم
            </p>
          </div>

          {/* Card body */}
          <div className="px-8 py-8">
            <p className="font-cairo font-bold text-brand-text/80 text-center mb-6 text-sm">
              يرجى تسجيل الدخول للمتابعة
            </p>

            <Suspense fallback={<FormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs font-cairo mt-6">
          منفلوط — أسيوط — مصر
        </p>
      </div>
    </main>
  );
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-12 rounded-xl bg-gray-100" />
      <div className="h-12 rounded-xl bg-gray-100" />
      <div className="h-12 rounded-xl bg-gray-200 mt-2" />
    </div>
  );
}