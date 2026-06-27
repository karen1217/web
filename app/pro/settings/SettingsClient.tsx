"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnglePresetEditor from "@/components/pro/AnglePresetEditor";
import { createClient } from "@/lib/supabase/client";
import type { AnglePreset } from "@/lib/supabase/types";
import { loadCheckerPrefs, saveCheckerPrefs, type CheckerPrefs } from "@/lib/checkerPrefs";
import { loadTheme, saveTheme, applyTheme, type Theme } from "@/lib/themePrefs";
import { useT } from "@/lib/i18n";
import { type FaceMetric } from "@/components/FaceAngleDemo";

interface Props {
  presets:     AnglePreset[];
  email:       string;
  displayName: string;
}

const CHECKER_KEYS: { key: keyof CheckerPrefs; metric: FaceMetric }[] = [
  { key: "yaw",        metric: "yaw" },
  { key: "brightness", metric: "brightness" },
  { key: "pitch",      metric: "pitch" },
  { key: "roll",       metric: "roll" },
];

export default function SettingsClient({ presets: initialPresets, email, displayName: initialName }: Props) {
  const router = useRouter();
  const { t } = useT();
  const [presets,        setPresets]        = useState(initialPresets);
  const [displayName,    setDisplayName]    = useState(initialName);
  const [nameSaving,     setNameSaving]     = useState(false);
  const [nameSaved,      setNameSaved]      = useState(false);
  const [checkerPrefs,   setCheckerPrefs]   = useState<CheckerPrefs | null>(null);
  const [theme,          setTheme]          = useState<Theme | null>(null);
  const [newPassword,    setNewPassword]    = useState("");
  const [confirmPw,      setConfirmPw]      = useState("");
  const [pwSaving,       setPwSaving]       = useState(false);
  const [pwSaved,        setPwSaved]        = useState(false);
  const [pwError,        setPwError]        = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting,        setDeleting]        = useState(false);
  const [deleteError,     setDeleteError]     = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    setCheckerPrefs(loadCheckerPrefs());
    setTheme(loadTheme());
  }, []);

  async function saveDisplayName() {
    if (!displayName.trim()) return;
    setNameSaving(true);
    await supabase.auth.updateUser({ data: { display_name: displayName.trim() } });
    setNameSaving(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }

  function toggleChecker(key: keyof CheckerPrefs) {
    if (!checkerPrefs) return;
    const next = { ...checkerPrefs, [key]: !checkerPrefs[key] };
    setCheckerPrefs(next);
    saveCheckerPrefs(next);
  }

  function handleThemeChange(th: Theme) {
    setTheme(th);
    saveTheme(th);
    applyTheme(th);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (newPassword !== confirmPw) { setPwError(t.settingsPasswordErrorMismatch); return; }
    if (newPassword.length < 8)   { setPwError(t.settingsPasswordErrorTooShort); return; }

    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);

    if (error) { setPwError(t.settingsPasswordErrorFailed); return; }
    setPwSaved(true);
    setNewPassword("");
    setConfirmPw("");
    setTimeout(() => setPwSaved(false), 3000);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    const res = await fetch("/api/delete-account", { method: "DELETE" });
    if (!res.ok) {
      setDeleteError(t.deleteAccountError);
      setDeleting(false);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-10">
      <h1 className="text-lg font-semibold">{t.settingsTitle}</h1>

      {/* Account */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-accent uppercase tracking-wider">{t.settingsAccountSection}</h2>

        <div className="space-y-1.5">
          <label className="text-sm text-fg/70">{t.settingsDisplayName}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={displayName}
              onChange={e => { setDisplayName(e.target.value); setNameSaved(false); }}
              className={inputClass + " flex-1"}
              placeholder={t.settingsDisplayNamePlaceholder}
            />
            <button
              onClick={saveDisplayName}
              disabled={nameSaving}
              className="px-4 py-2.5 bg-accent text-black rounded-lg text-sm font-semibold
                         hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
            >
              {nameSaved ? t.settingsSaved : nameSaving ? "…" : t.settingsSave}
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg px-4 py-3">
          <p className="text-xs text-muted">{t.settingsEmail}</p>
          <p className="text-sm mt-0.5">{email}</p>
        </div>
      </section>

      {/* Password change */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-accent uppercase tracking-wider">{t.settingsPasswordSection}</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm text-fg/70">{t.settingsPasswordNew}</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setPwSaved(false); setPwError(null); }}
              autoComplete="new-password"
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-fg/70">{t.settingsPasswordConfirm}</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setPwSaved(false); setPwError(null); }}
              autoComplete="new-password"
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          {pwError && <p className="text-xs text-danger">{pwError}</p>}
          <button
            type="submit"
            disabled={pwSaving || !newPassword || !confirmPw}
            className="px-4 py-2.5 bg-accent text-black rounded-lg text-sm font-semibold
                       hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {pwSaved ? t.settingsPasswordSaved : pwSaving ? t.settingsPasswordSaving : t.settingsPasswordSave}
          </button>
        </form>
      </section>

      {/* Appearance */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-accent uppercase tracking-wider">{t.settingsAppearanceSection}</h2>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-4 flex gap-4 items-center">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t.settingsTheme}</p>
              <p className="text-xs text-muted mt-0.5">{t.settingsThemeDesc}</p>
            </div>
            <div className="flex gap-1 p-1 bg-surface rounded-lg border border-border">
              {(["dark", "light"] as Theme[]).map(th => (
                <button
                  key={th}
                  onClick={() => handleThemeChange(th)}
                  disabled={theme === null}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                    ${theme === th
                      ? "bg-accent text-black"
                      : "text-muted hover:text-fg"}`}
                >
                  {th === "dark" ? t.settingsDark : t.settingsLight}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Checker scoring defaults */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xs font-medium text-accent uppercase tracking-wider">
            {t.settingsScoringSection}
          </h2>
          <p className="text-xs text-muted mt-1">{t.settingsScoringDesc}</p>
        </div>

        <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
          {CHECKER_KEYS.map(({ key, metric }) => {
            const on = checkerPrefs?.[key] ?? false;
            const m  = t.metrics[metric];
            return (
              <div key={key} className="px-4 py-4 flex gap-4 items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-muted mt-0.5">{m.sub}</p>
                </div>
                <button
                  onClick={() => toggleChecker(key)}
                  disabled={checkerPrefs === null}
                  className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors relative
                    ${on ? "bg-accent" : "bg-fg/20"} disabled:opacity-30`}
                  role="switch"
                  aria-checked={on}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-bg transition-transform
                    ${on ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Angle presets */}
      <section className="space-y-3">
        <div>
          <h2 className="text-xs font-medium text-accent uppercase tracking-wider">
            {t.settingsPresetSection}
          </h2>
          <p className="text-xs text-muted mt-1">{t.settingsPresetDesc}</p>
        </div>
        <AnglePresetEditor presets={presets} onUpdated={setPresets} />
      </section>

      {/* Account deletion */}
      <section className="space-y-3 pt-4 border-t border-border">
        <h2 className="text-xs font-medium text-danger uppercase tracking-wider">{t.deleteAccountSection}</h2>
        <p className="text-xs text-muted leading-relaxed">{t.deleteAccountDesc}</p>
        <button
          onClick={() => { setShowDeleteModal(true); setDeleteError(null); }}
          className="px-4 py-2 rounded-lg border border-danger text-danger text-sm
                     hover:bg-danger/10 transition-colors"
        >
          {t.deleteAccountButton}
        </button>
      </section>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
             onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-xs space-y-5"
               onClick={e => e.stopPropagation()}>
            <div className="space-y-2 text-center">
              <p className="font-semibold">{t.deleteAccountConfirmTitle}</p>
              <p className="text-xs text-muted leading-relaxed">{t.deleteAccountConfirmDesc}</p>
            </div>
            {deleteError && <p className="text-xs text-danger text-center">{deleteError}</p>}
            <div className="space-y-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full py-2.5 rounded-lg bg-danger text-white text-sm font-semibold
                           hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {deleting ? t.deleteAccountDeleting : t.deleteAccountConfirmButton}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="w-full py-2.5 rounded-lg border border-border text-sm text-muted
                           hover:text-fg hover:border-fg/30 transition-colors"
              >
                {t.deleteAccountCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-fg " +
  "placeholder-muted focus:outline-none focus:border-fg/40 transition-colors";
