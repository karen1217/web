"use client";
import { useEffect, useRef } from "react";

interface Props {
  visible: boolean;
}

export default function AdLoadingModal({ visible }: Props) {
  const adRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!visible || !adRef.current || loaded.current) return;
    loaded.current = true;
    // Adsterraの動画/バナー広告スクリプトをここに貼る
    // ダッシュボード → Ad Units → Video/Banner → Get Code でURLを取得
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = "//ADSTERRA_VIDEO_SCRIPT_URL"; // ← ここを置き換える
    adRef.current.appendChild(script);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-bg rounded-xl p-6 max-w-md w-full mx-4 space-y-4">
        <div ref={adRef} className="flex justify-center min-h-[250px]" />
        <div className="flex items-center justify-center gap-2 text-xs text-muted">
          <Spinner />
          <span>AI解析中...</span>
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
