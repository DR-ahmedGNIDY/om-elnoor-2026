"use client";

// ─────────────────────────────────────────────────────────────
// src/components/ui/ErrorBoundary.tsx
// React error boundary — catches client-side render errors.
// Wraps sections that might fail (e.g. cart, product grid).
// ─────────────────────────────────────────────────────────────

import { Component, type ReactNode } from "react";

interface Props {
  children:  ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError:   boolean;
  errorMsg:   string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // In production you'd send this to Sentry / Datadog etc.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="text-center py-12 px-4">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="font-cairo font-bold text-brand-text mb-2">
            حدث خطأ غير متوقع
          </p>
          <p className="font-cairo text-sm text-brand-text/50 mb-4">
            يرجى تحديث الصفحة أو العودة لاحقاً
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMsg: "" })}
            className="btn-primary btn-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
