"use client";
import Script from "next/script";
import { useState } from "react";

interface Props {
  scriptSrc?: string;
}

export default function AdBanner({ scriptSrc }: Props) {
  const src = scriptSrc ?? process.env.NEXT_PUBLIC_AD_BANNER_SRC;
  const [loaded, setLoaded] = useState(false);

  if (!src) return null;

  return (
    <div className="w-full my-4">
      <div
        id={`ad-${src.slice(-8)}`}
        className={`w-full min-h-[100px] flex justify-center transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      <Script
        src={src.startsWith("//") ? `https:${src}` : src}
        strategy="lazyOnload"
        data-cfasync="false"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
