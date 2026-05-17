"use client";

import { useEffect } from "react";
import { useBrgrStore } from "@/lib/store";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useBrgrStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return children;
}
