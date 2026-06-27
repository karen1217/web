"use client";
import { useEffect, useRef } from "react";
import { useT } from "@/lib/i18n";

interface Props {
  visible: boolean;
}

export default function AdLoadingModal({ visible }: Props) {
  const { t } = useT();
  const adRef  = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  const src = process.env.NEXT_PUBLIC_AD_LOADING_SRC;

  useEffect(() => {
    if (!visible || !src || !adRef.current || loaded.current) return;
    loaded.current = true;
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = src;
    adRef.current.appendChild(script);
  }, [visible, src]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-bg rounded-xl p-6 max-w-md w-full mx-4 space-y-4">
        {src && <div ref={adRef} className="flex justify-center min-h-[250px]" />}
        <div className="flex items-center justify-center gap-2 text-sm text-muted">
          <Spinner />
          <span>{t.analyzing}</span>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg"
         fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
