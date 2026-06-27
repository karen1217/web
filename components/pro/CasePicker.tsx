"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Case } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n";

interface Props {
  cases:     Case[];
  onSelect:  (c: Case) => void;
  onNew:     (c: Case) => void;
  onBack?:   () => void;
}

export default function CasePicker({ cases, onSelect, onNew, onBack }: Props) {
  const { t } = useT();
  const [creating, setCreating] = useState(cases.length === 0);
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const supabase = createClient();

  async function handleCreate() {
    if (!name.trim()) { setError(t.casePickerNameRequired); return; }
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("cases")
      .insert({ name: name.trim(), description: desc.trim() || null })
      .select()
      .single();

    setSaving(false);
    if (error || !data) {
      setError(error?.message ?? t.casePickerCreateFailed);
      return;
    }
    onNew(data);
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">{t.casePickerTitle}</h2>
        <p className="text-xs text-muted">{t.casePickerDesc}</p>
      </div>

      {/* Existing cases */}
      {cases.length > 0 && !creating && (
        <div className="space-y-2">
          {cases.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="w-full text-left bg-surface border border-border rounded-lg px-4 py-3
                         hover:border-fg/30 transition-colors"
            >
              <p className="text-sm font-medium">{c.name}</p>
              {c.description && (
                <p className="text-xs text-muted mt-0.5">{c.description}</p>
              )}
            </button>
          ))}
          <button
            onClick={() => setCreating(true)}
            className="w-full text-center py-2.5 border border-dashed border-border rounded-lg
                       text-sm text-muted hover:text-fg hover:border-fg/30 transition-colors"
          >
            {t.casePickerNewButton}
          </button>
        </div>
      )}

      {/* Create new case form */}
      {creating && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-fg/70">{t.casePickerCaseNameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
              placeholder={t.casePickerCaseNamePlaceholder}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-fg/70">{t.casePickerMemoLabel}</label>
            <input
              type="text"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className={inputClass}
              placeholder={t.casePickerMemoPlaceholder}
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-2">
            {cases.length > 0 && (
              <button
                onClick={() => setCreating(false)}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm text-muted
                           hover:text-fg hover:border-fg/30 transition-colors"
              >
                {t.casePickerBackButton}
              </button>
            )}
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 py-2.5 bg-accent text-black rounded-lg text-sm font-semibold
                         hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {saving ? t.casePickerCreatingText : t.casePickerCreateButton}
            </button>
          </div>
        </div>
      )}

      {onBack && (
        <button
          onClick={onBack}
          className="w-full py-2 text-xs text-muted hover:text-fg transition-colors"
        >
          {t.casePickerBackToPreview}
        </button>
      )}
    </div>
  );
}

const inputClass =
  "w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-fg " +
  "placeholder-muted focus:outline-none focus:border-fg/40 transition-colors";
