"use client";
import { useEffect, useRef } from "react";

interface Props {
  scriptSrc?: string;
}

export default function AdBanner({ scriptSrc }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  const src = scriptSrc ?? process.env.NEXT_PUBLIC_AD_BANNER_SRC;

  useEffect(() => {
    if (!src || !containerRef.current || injected.current) return;
    injected.current = true;

    // Adsterra needs the script injected into document.body, not a div
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = src;
    containerRef.current.appendChild(script);
  }, [src]);

  if (!src) return null;

  return (
    <div className="w-full flex justify-center my-4 min-h-[100px]">
      <div ref={containerRef} className="w-full max-w-xl" />
    </div>
  );
}
