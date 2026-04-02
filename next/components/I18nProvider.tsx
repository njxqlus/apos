"use client";

import { ReactNode, useEffect, useState } from "react";
import "@/lib/i18n";
import i18n from "@/lib/i18n";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const lang = i18n.language || "en";
    document.documentElement.lang = lang;
    // Delay setMounted to avoid synchronous cascading renders during hydration
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Avoid hydration mismatch by waiting for client-side mount before translating
  // though react-i18next handles it ok, sometimes it causes flash
  // For SSG we usually want a stable first render
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
