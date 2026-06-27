"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";
import { getUnsaved } from "@/lib/unsavedStore";
import { useT, type Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ja", label: "JA" },
  { code: "en", label: "EN" },
  { code: "ko", label: "KO" },
];

export default function SiteHeader() {
  const router   = useRouter();
  const pathname = usePathname();
  const { lang, setLang, t } = useT();
  const [loggedIn,    setLoggedIn]    = useState<boolean | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
      if (user) setDisplayName(user.user_metadata?.display_name || user.email || "");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session?.user);
      if (session?.user) {
        setDisplayName(session.user.user_metadata?.display_name || session.user.email || "");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  function confirmNav(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (getUnsaved()) {
      const ok = window.confirm(t.unsavedLeave);
      if (!ok) { e.preventDefault(); }
    }
    void href;
  }

  async function handleSignOut() {
    if (getUnsaved()) {
      const ok = window.confirm(t.unsavedLogout);
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
    <header className="border-b border-border px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Left: brand + nav */}
        <div className="flex items-center gap-6">
          {/* Logo icon placeholder (replace src when asset is ready) */}
          <Link
            href="/about"
            onClick={(e) => confirmNav(e, "/about")}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="h-7 w-7 rounded overflow-hidden flex-shrink-0">
              <img src="/icon.png" alt="" className="h-full w-full object-contain" />
            </div>
            <span className="font-semibold text-sm tracking-tight">{APP_NAME}</span>
          </Link>

          {/* Nav */}
          <nav
            className={`flex items-center gap-4 text-sm transition-opacity duration-150
              ${loggedIn === null ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            {loggedIn !== false ? (
              links.map(({ href, label }) => (
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
              ))
            ) : null}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Language switcher — cycle button on mobile, all 3 on desktop */}
          <button
            onClick={() => {
              const idx = LANGS.findIndex(l => l.code === lang);
              setLang(LANGS[(idx + 1) % LANGS.length].code);
            }}
            className="sm:hidden text-xs text-accent font-semibold px-1.5 py-0.5"
          >
            {lang.toUpperCase()}
          </button>
          <div className="hidden sm:flex items-center gap-0.5">
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

          {/* Login / logout */}
          {loggedIn === false && (
            <Link href="/pro/login"
              className="text-xs text-muted hover:text-fg transition-colors whitespace-nowrap">
              {t.navLogin}
            </Link>
          )}
          <div className={`flex items-center gap-3 transition-opacity duration-150
            ${loggedIn === true ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <span className="hidden sm:block text-xs text-muted truncate max-w-[140px]">
              {displayName}
            </span>
            <button onClick={handleSignOut}
              className="text-xs text-muted hover:text-fg transition-colors whitespace-nowrap">
              {t.navLogout}
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
