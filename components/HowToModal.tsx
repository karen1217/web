"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";

const STORAGE_KEY = "angle_log_how_to_seen";

export default function HowToModal() {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  function close() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
      <div className="bg-bg rounded-2xl w-full max-w-sm space-y-5 p-6 shadow-xl">
        <div className="space-y-1">
          <p className="text-xs text-accent uppercase tracking-widest font-medium">{t.howToTag}</p>
          <h2 className="text-lg font-bold">{t.howToTitle}</h2>
        </div>

        <ol className="space-y-3">
          {(t.howToSteps as string[]).map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-fg/80 leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <button
          onClick={close}
          className="w-full py-2.5 bg-accent text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {t.howToClose}
        </button>
      </div>
    </div>
  );
}
