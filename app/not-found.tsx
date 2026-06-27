"use client";

import Link from "next/link";
import Image from "next/image";
import { useT } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useT();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-sm">
        <Image
          src="/icon.png"
          alt="Angle Log"
          width={72}
          height={72}
          className="mx-auto opacity-60"
        />
        <div className="space-y-2">
          <p className="text-5xl font-bold text-fg/20">404</p>
          <h1 className="text-lg font-semibold">{t.notFoundTitle}</h1>
          <p className="text-sm text-muted leading-relaxed">{t.notFoundDesc}</p>
        </div>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-accent text-black text-sm font-semibold
                     rounded-lg hover:opacity-90 transition-opacity"
        >
          {t.notFoundHome}
        </Link>
      </div>
    </div>
  );
}
