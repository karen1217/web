"use client";

import { useEffect } from "react";
import FaceAngleDemo, { type FaceMetric } from "./FaceAngleDemo";
import { useT } from "@/lib/i18n";

const METRIC_KEYS: FaceMetric[] = ["yaw", "brightness", "pitch", "roll"];

interface Props {
  onClose: () => void;
}

export default function MetricInfoModal({ onClose }: Props) {
  const { t } = useT();
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg bg-bg border-t border-border rounded-t-2xl
                   max-h-[85dvh] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: "al-sheet-up 0.28s cubic-bezier(0.22,1,0.36,1)" }}
      >
        <style>{`
          @keyframes al-sheet-up {
            from { transform: translateY(100%); opacity: 0.4; }
            to   { transform: translateY(0);    opacity: 1;   }
          }
        `}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold">{t.modalTitle}</h2>
            <p className="text-xs text-muted mt-0.5">{t.modalSubtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-fg text-sm transition-colors px-2 py-1"
          >
            {t.close}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {METRIC_KEYS.map(key => {
            const m = t.metrics[key];
            return (
              <div key={key} className="flex gap-4 p-4 rounded-xl border border-border bg-surface">
                <div className="flex-shrink-0 flex items-center justify-center">
                  <FaceAngleDemo metric={key} size={64} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">{m.title}</p>
                  <p className="text-xs text-muted mt-0.5 mb-2">{m.sub}</p>
                  <p className="text-xs text-fg/70 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            );
          })}

          {/* Bottom padding for safe area */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
