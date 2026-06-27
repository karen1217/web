"use client";
import { useEffect, useRef } from "react";

export default function AdBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || containerRef.current.childElementCount > 0) return;
    // Adsterraのバナー広告スクリプトをここに貼る
    // ダッシュボード → Ad Units → Banner → Get Code でURLを取得
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = "//ADSTERRA_BANNER_SCRIPT_URL"; // ← ここを置き換える
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center my-2">
      <div ref={containerRef} />
    </div>
  );
}
