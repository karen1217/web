"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getOverallLevel } from "@/lib/thresholds";
import type { AnalysisResult } from "@/lib/api";
import { useT } from "@/lib/i18n";

interface Props {
  result:     AnalysisResult;
  beforeFile: File | null;
  afterFile:  File | null;
}

type SaveState = "idle" | "saving" | "done" | "error";

export default function SaveCTA({ result, beforeFile, afterFile }: Props) {
  const { t } = useT();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSave() {
    if (!beforeFile || !afterFile) return;
    setSaveState("saving");
    setErrorDetail(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErrorDetail(t.saveErrorLoginRequired); setSaveState("error"); return; }

    const id = crypto.randomUUID();
    const beforePath = `${user.id}/checker/${id}/before.jpg`;
    const afterPath  = `${user.id}/checker/${id}/after.jpg`;

    const [beforeJpeg, afterJpeg] = await Promise.all([
      toJpeg(beforeFile),
      toJpeg(afterFile),
    ]);

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.storage.from("shots").upload(beforePath, beforeJpeg, { contentType: "image/jpeg", upsert: true }),
      supabase.storage.from("shots").upload(afterPath,  afterJpeg,  { contentType: "image/jpeg", upsert: true }),
    ]);
    if (e1 || e2) {
      setErrorDetail(t.saveErrorUploadFailed);
      setSaveState("error");
      return;
    }

    const overall = getOverallLevel(result);
    const { error: dbErr } = await supabase.from("checker_results").insert({
      id,
      user_id:           user.id,
      before_path:       beforePath,
      after_path:        afterPath,
      yaw_diff:          result.yaw_diff,
      pitch_diff:        result.pitch_diff,
      roll_diff:         result.roll_diff,
      brightness_diff:   result.brightness_diff,
      partial_detection: result.partial_detection,
      overall_level:     overall,
    });

    if (dbErr) {
      setErrorDetail(t.saveErrorDbFailed);
      setSaveState("error");
      return;
    }
    setSaveState("done");
  }

  if (loggedIn === null) return null;

  if (loggedIn) {
    if (saveState === "done") {
      return (
        <div className="rounded-xl border border-ok/30 bg-ok/10 px-5 py-4 flex items-center gap-3">
          <span className="text-ok text-lg">✓</span>
          <div>
            <p className="text-sm font-semibold text-ok">{t.savedTitle}</p>
            <Link href="/pro/timeline" className="text-xs font-medium text-accent hover:opacity-80 transition-opacity">
              {t.timelineLink}
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-border bg-surface px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{t.savePrompt}</p>
          <p className="text-xs text-muted mt-0.5">{t.saveSubtext}</p>
          {saveState === "error" && (
            <p className="text-xs text-danger mt-1">
              {errorDetail ?? t.saveErrorGeneric}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="flex-shrink-0 px-4 py-2 bg-accent text-black rounded-lg text-sm font-semibold
                     hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {saveState === "saving" ? t.saving : t.saveButton}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-surface px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{t.savePromptGuest}</p>
          <p className="text-xs text-muted mt-0.5">{t.saveSubtextGuest}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 px-4 py-2 bg-accent text-black rounded-lg text-sm font-semibold
                     hover:opacity-90 transition-colors"
        >
          {t.saveButton}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
             onClick={() => setShowModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-xs space-y-5"
               onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-1">
              <p className="font-semibold text-base">{t.signupModalTitle}</p>
              <p className="text-xs text-muted">{t.signupModalDesc}</p>
            </div>
            <div className="space-y-2">
              <Link
                href="/pro/signup"
                className="block w-full py-2.5 bg-accent text-black rounded-lg text-sm font-semibold
                           text-center hover:opacity-90 transition-colors"
              >
                {t.signupButton}
              </Link>
              <Link
                href="/pro/login"
                className="block w-full py-2.5 border border-border rounded-lg text-sm text-muted
                           text-center hover:text-fg hover:border-fg/30 transition-colors"
              >
                {t.loginLink}
              </Link>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full text-xs text-muted hover:text-fg transition-colors text-center"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function toJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error("変換失敗")),
        "image/jpeg",
        0.92,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("画像読み込み失敗")); };
    img.src = url;
  });
}
