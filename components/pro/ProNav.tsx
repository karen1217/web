"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUnsaved } from "@/lib/unsavedStore";
import { APP_NAME } from "@/lib/constants";
import { useT, type Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ja", label: "JA" },
  { code: "en", label: "EN" },
  { code: "ko", label: "KO" },
];

export default function ProNav({ email, displayName }: { email: string; displayName: string }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { lang, setLang, t } = useT();

  function confirmNav(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (getUnsaved()) {
      const ok = window.confirm(t.navUnsavedLeave);
      if (!ok) { e.preventDefault(); return; }
    }
    void href;
  }

  async function handleSignOut() {
    if (getUnsaved()) {
      const ok = window.confirm(t.navUnsavedLogout);
      if (!ok) return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/pro/login");
  }

  const links = [
    { href: "/",             label: t.navChecker },
    { href: "/pro/capture",  label: t.navCapture },
    { href: "/pro/timeline", label: t.navTimeline },
    { href: "/pro/settings", label: t.navSettings },
  ];

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <nav className="border-b border-border px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Left: brand + nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/pro/dashboard"
            onClick={(e) => confirmNav(e, "/pro/dashboard")}
            className="flex items-center gap-2"
          >
            <div className="h-7 w-7 rounded overflow-hidden flex-shrink-0">
              <img src="/icon.png" alt="" className="h-full w-full object-contain" />
            </div>
            <span className="font-semibold text-sm tracking-tight">{APP_NAME}</span>
          </Link>

          <div className="flex items-center gap-4 text-sm">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={(e) => confirmNav(e, href)}
                className={`whitespace-nowrap transition-colors pb-0.5
                  ${isActive(href)
                    ? "text-fg border-b-2 border-accent"
                    : "text-muted hover:text-fg"}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: language switcher + user + logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`text-xs px-1.5 py-0.5 rounded transition-colors
                  ${lang === code ? "text-accent font-semibold" : "text-muted hover:text-fg"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="hidden sm:block text-xs text-muted truncate max-w-[140px]">
            {displayName || email}
          </span>
          <button onClick={handleSignOut}
            className="text-xs text-muted hover:text-fg transition-colors">
            {t.navLogout}
          </button>
        </div>
      </div>
    </nav>
  );
}
