"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useT } from "@/lib/i18n";

const CONSENT_KEY = "angle-log-consent";

export default function ConsentModal() {
  const { t } = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  function agree() {
    localStorage.setItem(CONSENT_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-border">
          <Image src="/icon.png" alt="Angle Log" width={32} height={32} className="rounded-md flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Angle Log</p>
            <p className="text-xs text-muted">{t.consentModalTitle}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-fg/80 leading-relaxed">{t.consentModalDesc}</p>

          <ul className="space-y-2">
            {t.consentModalBullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-fg/80">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
                {bullet}
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted leading-relaxed">
            {t.consentPre}
            <Link href="/terms" onClick={agree} className="underline underline-offset-2 hover:text-fg transition-colors">
              {t.terms}
            </Link>
            {t.consentMid}
            <Link href="/privacy" onClick={agree} className="underline underline-offset-2 hover:text-fg transition-colors">
              {t.privacy}
            </Link>
            {t.consentPost}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={agree}
            className="w-full py-3 bg-accent text-black text-sm font-semibold rounded-xl
                       hover:opacity-90 active:scale-[.98] transition-all"
          >
            {t.consentAgree}
          </button>
        </div>
      </div>
    </div>
  );
}
