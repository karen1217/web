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

type Phase = "form" | "check-email";

export default function SignupPage() {
  const router = useRouter();
  const { lang, setLang, t } = useT();
  const [phase, setPhase]       = useState<Phase>("form");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError(t.signupErrorMismatch); return; }
    if (password.length < 8)  { setError(t.signupErrorTooShort); return; }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("signup error:", error.status, error.message);
      const msg = error.status === 429
        ? t.signupErrorFailed                     // rate limit
        : `${t.signupErrorFailed} (${error.message})`;
      setError(msg);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setPhase("check-email");
      return;
    }

    router.push("/pro/dashboard");
    router.refresh();
  }

  const LangSwitcher = () => (
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
  );

  if (phase === "check-email") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-5 text-center">
          <LangSwitcher />
          <div className="text-4xl">📧</div>
          <h1 className="text-lg font-semibold">{t.signupCheckEmailTitle}</h1>
          <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
            {t.signupCheckEmailDesc(email)}
          </p>
          <p className="text-xs text-muted">{t.signupCheckEmailSpam}</p>
          <Link
            href="/pro/login"
            className="block w-full py-2.5 bg-accent text-black rounded-lg text-sm
                       font-semibold hover:opacity-90 transition-colors"
          >
            {t.signupGoToLogin}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        <LangSwitcher />

        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold">Angle Log</h1>
          <p className="text-sm text-muted">{t.signupTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={t.loginEmail}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" className={inputClass} placeholder="you@example.com" />
          </Field>
          <Field label={t.signupPassword}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required autoComplete="new-password" className={inputClass} placeholder="••••••••" />
          </Field>
          <Field label={t.signupPasswordConfirm}>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              required autoComplete="new-password" className={inputClass} placeholder="••••••••" />
          </Field>

          {error && <p className="text-sm text-danger text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-accent text-black font-semibold text-sm
                       hover:opacity-90 disabled:opacity-50 transition-colors">
            {loading ? t.signupLoading : t.signupSubmitButton}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          {t.signupHasAccount}{" "}
          <Link href="/pro/login" className="text-fg underline underline-offset-2">
            {t.signupLoginLink}
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
