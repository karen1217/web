"use client";
import { useEffect, useRef } from "react";

interface Props {
  scriptSrc?: string;
}

export default function AdBanner({ scriptSrc }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const src = scriptSrc ?? process.env.NEXT_PUBLIC_AD_BANNER_SRC;

  useEffect(() => {
    if (!src || !containerRef.current || containerRef.current.childElementCount > 0) return;
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = src;
    containerRef.current.appendChild(script);
  }, [src]);

  if (!src) return null;

  return (
    <div className="flex justify-center my-2">
      <div ref={containerRef} />
    </div>
  );
}
