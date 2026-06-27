"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT, type Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ja", label: "JA" },
  { code: "en", label: "EN" },
  { code: "ko", label: "KO" },
];

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang, t } = useT();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [notConfirmed, setNotConfirmed] = useState(false);
  const [resending, setResending]   = useState(false);
  const [resendSent, setResendSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotConfirmed(false);
    setResendSent(false);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setNotConfirmed(true);
        setError(t.loginErrorNotConfirmed);
      } else {
        setError(t.loginErrorFailed);
      }
      setLoading(false);
      return;
    }

    router.push("/pro/dashboard");
    router.refresh();
  }

  async function handleResend() {
    if (!email) return;
    setResending(true);
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    setResendSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Language switcher */}
        <div className="flex justify-end gap-0.5">
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

        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold">Angle Log</h1>
          <p className="text-sm text-muted">{t.loginTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={t.loginEmail}>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setNotConfirmed(false); setResendSent(false); }}
              required
              autoComplete="email"
              className={inputClass}
              placeholder="you@example.com"
            />
          </Field>

          <Field label={t.loginPassword}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <div className="space-y-2">
              <p className="text-sm text-danger text-center">{error}</p>
              {notConfirmed && (
                resendSent ? (
                  <p className="text-xs text-ok text-center">{t.loginResendSent}</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full py-2 rounded-lg border border-border text-xs text-muted
                               hover:text-fg hover:border-fg/30 disabled:opacity-50 transition-colors"
                  >
                    {resending ? t.loginResendLoading : t.loginResendButton}
                  </button>
                )
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-accent text-black font-semibold text-sm
                       hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            {loading ? t.loginLoading : t.loginButton}
          </button>
        </form>

        <p className="text-center text-xs text-muted">
          <Link href="/pro/forgot-password" className="underline underline-offset-2 hover:text-fg transition-colors">
            {t.loginForgotLink}
          </Link>
        </p>

        <p className="text-center text-sm text-muted">
          {t.loginNoAccount}{" "}
          <Link href="/pro/signup" className="text-fg underline underline-offset-2">
            {t.loginSignupLink}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-fg/70">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-fg " +
  "placeholder-muted focus:outline-none focus:border-fg/40 transition-colors";
