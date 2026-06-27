"use client";

import { LanguageProvider } from "@/lib/i18n";
import ConsentBanner from "@/components/ConsentBanner";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <ConsentBanner />
    </LanguageProvider>
  );
}
