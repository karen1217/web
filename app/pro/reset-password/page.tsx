"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT, type Lang } from "@/lib/i18n";
import { Suspense } from "react";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ja", label: "JA" },
  { code: "en", label: "EN" },
  { code: "ko", label: "KO" },
];

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { lang, setLang, t } = useT();

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [ready, setReady]         = useState(false);

  useEffect(() => {
    const code = params.get("code");
    if (!code) { setError(t.resetPasswordErrorExpired); setReady(true); return; }

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setError(t.resetPasswordErrorExpired);
      setReady(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError(t.resetPasswordErrorMismatch); return; }
    if (password.length < 8)  { setError(t.resetPasswordErrorTooShort); return; }

    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) { setError(t.resetPasswordErrorFailed); return; }
    setSuccess(true);
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

        {success ? (
          <div className="text-center space-y-5">
            <div className="text-4xl">✅</div>
            <h1 className="text-lg font-semibold">{t.resetPasswordSuccessTitle}</h1>
            <p className="text-sm text-muted">{t.resetPasswordSuccessDesc}</p>
            <Link href="/pro/login"
              className="block w-full py-2.5 bg-accent text-black rounded-lg text-sm
                         font-semibold text-center hover:opacity-90 transition-colors">
              {t.resetPasswordGoToLogin}
            </Link>
          </div>
        ) : !ready ? (
          <p className="text-center text-sm text-muted">…</p>
        ) : error && !password ? (
          <div className="text-center space-y-5">
            <p className="text-sm text-danger">{error}</p>
            <Link href="/pro/forgot-password"
              className="block w-full py-2.5 bg-accent text-black rounded-lg text-sm
                         font-semibold text-center hover:opacity-90 transition-colors">
              {t.forgotPasswordButton}
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold">Angle Log</h1>
              <p className="text-sm text-muted">{t.resetPasswordTitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-fg/70">{t.resetPasswordNew}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="new-password" className={inputClass} placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-fg/70">{t.resetPasswordConfirm}</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  required autoComplete="new-password" className={inputClass} placeholder="••••••••" />
              </div>

              {error && <p className="text-sm text-danger text-center">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg bg-accent text-black font-semibold text-sm
                           hover:opacity-90 disabled:opacity-50 transition-colors">
                {loading ? t.resetPasswordLoading : t.resetPasswordButton}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

const inputClass =
  "w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-fg " +
  "placeholder-muted focus:outline-none focus:border-fg/40 transition-colors";
