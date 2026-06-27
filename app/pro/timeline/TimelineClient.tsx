"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import TimelineGrid, {
  type SessionWithShots, type CaseWithSessions,
} from "@/components/pro/TimelineGrid";
import CheckerTimeline from "@/components/pro/CheckerTimeline";
import CompareView from "@/components/pro/CompareView";
import type { CheckerResult } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n";

type Tab = "diary" | "checker";

interface Props {
  initialCases:           CaseWithSessions[];
  initialUncased:         SessionWithShots[];
  initialImageUrls:       Record<string, string>;
  initialCheckerResults:  CheckerResult[];
}

export default function TimelineClient({
  initialCases, initialUncased, initialImageUrls, initialCheckerResults,
}: Props) {
  const { t } = useT();
  const [tab, setTab]             = useState<Tab>("diary");
  const [cases, setCases]         = useState(initialCases);
  const [uncased, setUncased]     = useState(initialUncased);
  const [imageUrls]               = useState(initialImageUrls);
  const [checkerResults, setCheckerResults] = useState(initialCheckerResults);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [comparing, setComparing] = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [search, setSearch]       = useState("");

  const supabase = createClient();

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleDeleteSession(session: SessionWithShots) {
    if (!confirm(t.timelineDeleteSessionConfirm(session.label || t.timelineUnlabeled))) return;
    setDeleting(session.id);

    const paths = session.shots.map(s => s.image_path);
    if (paths.length > 0) await supabase.storage.from("shots").remove(paths);
    await supabase.from("capture_sessions").delete().eq("id", session.id);

    setCases(prev => prev.map(c => ({
      ...c, sessions: c.sessions.filter(s => s.id !== session.id),
    })));
    setUncased(prev => prev.filter(s => s.id !== session.id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(session.id); return n; });
    setDeleting(null);
  }

  async function handleDeleteCase(c: CaseWithSessions) {
    if (!confirm(t.timelineDeleteCaseConfirm(c.name))) return;
    setDeleting(`case-${c.id}`);

    const paths = c.sessions.flatMap(s => s.shots.map(sh => sh.image_path));
    if (paths.length > 0) await supabase.storage.from("shots").remove(paths);
    await supabase.from("cases").delete().eq("id", c.id);

    const removedIds = new Set(c.sessions.map(s => s.id));
    setCases(prev => prev.filter(x => x.id !== c.id));
    setSelectedIds(prev => {
      const n = new Set(prev);
      removedIds.forEach(id => n.delete(id));
      return n;
    });
    setDeleting(null);
  }

  async function handleDeleteChecker(result: CheckerResult) {
    if (!confirm(t.timelineDeleteCheckerConfirm)) return;
    setDeleting(result.id);

    await supabase.storage.from("shots").remove([result.before_path, result.after_path]);
    await supabase.from("checker_results").delete().eq("id", result.id);

    setCheckerResults(prev => prev.filter(r => r.id !== result.id));
    setDeleting(null);
  }

  const q = search.trim().toLowerCase();
  const filteredCases = q
    ? cases.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
      )
    : cases;

  const allSessions = [...cases.flatMap(c => c.sessions), ...uncased];
  const selectedSessions = allSessions.filter(s => selectedIds.has(s.id));

  return (
    <>
      {comparing && selectedSessions.length >= 2 && (
        <CompareView
          sessions={selectedSessions}
          imageUrls={imageUrls}
          onClose={() => setComparing(false)}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-lg font-semibold mb-6">{t.timelineTitle}</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface rounded-lg p-1 border border-border w-fit">
          <TabButton active={tab === "diary"} onClick={() => { setTab("diary"); setSearch(""); }}>
            {t.timelineDiaryTab}
          </TabButton>
          <TabButton active={tab === "checker"} onClick={() => { setTab("checker"); }}>
            {t.timelineCheckerTab}
            {checkerResults.length > 0 && (
              <span className="ml-1.5 text-xs bg-fg/10 rounded-full px-1.5 py-0.5">
                {checkerResults.length}
              </span>
            )}
          </TabButton>
        </div>

        {/* Diary tab */}
        {tab === "diary" && (
          <>
            <div className="mb-5">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.timelineSearchPlaceholder}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-fg
                           placeholder-muted focus:outline-none focus:border-fg/40 transition-colors"
              />
            </div>
            {selectedIds.size >= 1 && (
              <p className="text-xs text-muted mb-3">{t.timelineSelectedCount(selectedIds.size)}</p>
            )}
            <TimelineGrid
              cases={filteredCases}
              uncased={q ? [] : uncased}
              imageUrls={imageUrls}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onDeleteSession={handleDeleteSession}
              onDeleteCase={handleDeleteCase}
              deleting={deleting}
            />
          </>
        )}

        {/* Checker tab */}
        {tab === "checker" && (
          <CheckerTimeline
            results={checkerResults}
            imageUrls={imageUrls}
            onDelete={handleDeleteChecker}
            deleting={deleting}
          />
        )}
      </div>

      {tab === "diary" && selectedIds.size >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 z-40
                        bg-bg/90 backdrop-blur border-t border-border
                        px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted">{t.timelineCompareCount(selectedIds.size)}</span>
          <button
            onClick={() => setComparing(true)}
            className="px-5 py-2 bg-accent text-black rounded-lg text-sm font-semibold
                       hover:opacity-90 transition-colors"
          >
            {t.timelineCompareButton}
          </button>
        </div>
      )}
    </>
  );
}

function TabButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-colors
        ${active ? "bg-accent text-black" : "text-muted hover:text-fg"}`}
    >
      {children}
    </button>
  );
}
