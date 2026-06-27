"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FeaturesModal({ open, onClose }: Props) {
  const { t } = useT();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
      <div className="bg-bg rounded-2xl w-full max-w-sm space-y-5 p-6 shadow-xl">
        <div className="space-y-1">
          <p className="text-xs text-accent uppercase tracking-widest font-medium">{t.featuresModalTag}</p>
          <h2 className="text-lg font-bold">{t.featuresModalTitle}</h2>
          <p className="text-sm text-fg/65 leading-relaxed">{t.featuresModalDesc}</p>
        </div>

        <div className="space-y-2">
          {(t.featuresModalItems as { icon: string; label: string; desc: string }[]).map((item, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-border px-4 py-3">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted hover:text-fg transition-colors"
          >
            {t.featuresModalSkip}
          </button>
          <Link
            href="/about"
            onClick={onClose}
            className="flex-1 py-2.5 bg-accent text-black rounded-xl text-sm font-semibold text-center hover:opacity-90 transition-opacity"
          >
            {t.featuresModalCTA}
          </Link>
        </div>
      </div>
    </div>
  );
}
