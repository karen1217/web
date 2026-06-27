"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useT, type Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ja", label: "JA" },
  { code: "en", label: "EN" },
  { code: "ko", label: "KO" },
];

export default function ForgotPasswordPage() {
  const { lang, setLang, t } = useT();
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/pro/reset-password`;
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Language switcher */}
        <div className="flex justify-end gap-0.5">
          {LANGS.map(({ code, label }) => (
            <button key={code} onClick={() => setLang(code)}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors
                ${lang === code ? "text-accent font-semibold" : "text-muted hover:text-fg"}`}>
              {label}
            </button>
          ))}
        </div>

        {sent ? (
          <div className="text-center space-y-5">
            <div className="text-4xl">📨</div>
            <h1 className="text-lg font-semibold">{t.forgotPasswordSentTitle}</h1>
            <p className="text-sm text-muted leading-relaxed">{t.forgotPasswordSentDesc(email)}</p>
            <Link href="/pro/login"
              className="block w-full py-2.5 bg-accent text-black rounded-lg text-sm
                         font-semibold text-center hover:opacity-90 transition-colors">
              {t.forgotPasswordBackToLogin}
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold">Angle Log</h1>
              <p className="text-sm text-muted">{t.forgotPasswordTitle}</p>
            </div>

            <p className="text-xs text-muted text-center leading-relaxed">{t.forgotPasswordDesc}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-fg/70">{t.loginEmail}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg bg-accent text-black font-semibold text-sm
                           hover:opacity-90 disabled:opacity-50 transition-colors">
                {loading ? t.forgotPasswordLoading : t.forgotPasswordButton}
              </button>
            </form>

            <p className="text-center text-sm text-muted">
              <Link href="/pro/login" className="text-fg underline underline-offset-2">
                {t.forgotPasswordBackToLogin}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-fg " +
  "placeholder-muted focus:outline-none focus:border-fg/40 transition-colors";
