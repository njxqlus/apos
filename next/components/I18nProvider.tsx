"use client";

import { ReactNode, useEffect, useState } from "react";
import "@/lib/i18n";
import i18n from "@/lib/i18n";
import { cn } from "@/lib/utils";

function Loader() {
  return (
    <div className="apos-loader-container">
      <div className="apos-loader-grid" />
      <div className="apos-loader-content">
        <div className="apos-loader-logo tracking-tighter">
          <span className="text-[#ff5023]">A</span>POS
        </div>
        <div className="apos-loader-bar">
          <div className="apos-loader-progress" />
        </div>
        <div className="apos-loader-status font-mono">
          Initializing System Performance Model...
        </div>
      </div>
    </div>
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Detect and set language immediately on mount
    const lang = i18n.language || "en";
    document.documentElement.lang = lang;

    // Small delay for the loader to feel "premium" and ensure i18n is ready
    const timer = setTimeout(() => {
      setInitialized(true);
      // Allow fade animation to play before showing content
      setTimeout(() => setShowContent(true), 500);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Server AND first client pass render Loader only to ensure perfect hydration match
  // After initialization, we switch to children
  if (!showContent) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-500",
          initialized ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}
