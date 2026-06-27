"use client";

import { useState } from "react";
import Image from "next/image";
import type { CaptureSession, Shot, Case } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n";

export interface SessionWithShots extends CaptureSession {
  shots: Shot[];
}

export interface CaseWithSessions extends Case {
  sessions: SessionWithShots[];
}

interface Props {
  cases:          CaseWithSessions[];
  uncased:        SessionWithShots[];
  imageUrls:      Record<string, string>;
  selectedIds:    Set<string>;
  onToggleSelect: (id: string) => void;
  onDeleteSession:(session: SessionWithShots) => void;
  onDeleteCase:   (c: CaseWithSessions) => void;
  deleting:       string | null;
}

export default function TimelineGrid({
  cases, uncased, imageUrls, selectedIds,
  onToggleSelect, onDeleteSession, onDeleteCase, deleting,
}: Props) {
  const { t } = useT();
  const isEmpty = cases.length === 0 && uncased.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted text-sm gap-2">
        <span className="text-3xl opacity-30">📁</span>
        <p>{t.timelineEmpty}</p>
        <p className="text-xs">{t.timelineEmptyHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cases.map(c => (
        <CaseBlock
          key={c.id}
          caseData={c}
          imageUrls={imageUrls}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onDeleteSession={onDeleteSession}
          onDeleteCase={onDeleteCase}
          deleting={deleting}
        />
      ))}

      {uncased.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted uppercase tracking-wider">{t.timelineUncategorized}</p>
          {uncased.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              imageUrls={imageUrls}
              selected={selectedIds.has(session.id)}
              onToggle={() => onToggleSelect(session.id)}
              onDelete={() => onDeleteSession(session)}
              deleting={deleting === session.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CaseBlock({ caseData, imageUrls, selectedIds, onToggleSelect,
                     onDeleteSession, onDeleteCase, deleting }: {
  caseData:        CaseWithSessions;
  imageUrls:       Record<string, string>;
  selectedIds:     Set<string>;
  onToggleSelect:  (id: string) => void;
  onDeleteSession: (s: SessionWithShots) => void;
  onDeleteCase:    (c: CaseWithSessions) => void;
  deleting:        string | null;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-surface">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <span className="text-muted text-xs">{open ? "▾" : "▸"}</span>
          <div>
            <p className="text-sm font-semibold">{caseData.name}</p>
            {caseData.description && (
              <p className="text-xs text-muted">{caseData.description}</p>
            )}
          </div>
          <span className="text-xs text-muted ml-2">{t.timelineSessionCount(caseData.sessions.length)}</span>
        </button>
        <button
          onClick={() => onDeleteCase(caseData)}
          disabled={deleting === `case-${caseData.id}`}
          className="text-xs text-muted hover:text-danger transition-colors px-2 py-1 disabled:opacity-40"
        >
          {deleting === `case-${caseData.id}` ? t.timelineDeleting : t.timelineDelete}
        </button>
      </div>

      {open && (
        <div className="divide-y divide-border">
          {caseData.sessions.length === 0 ? (
            <p className="text-xs text-muted px-4 py-3">{t.timelineNoSessions}</p>
          ) : (
            caseData.sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                imageUrls={imageUrls}
                selected={selectedIds.has(session.id)}
                onToggle={() => onToggleSelect(session.id)}
                onDelete={() => onDeleteSession(session)}
                deleting={deleting === session.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, imageUrls, selected, onToggle, onDelete, deleting }: {
  session:  SessionWithShots;
  imageUrls: Record<string, string>;
  selected:  boolean;
  onToggle:  () => void;
  onDelete:  () => void;
  deleting:  boolean;
}) {
  const { t } = useT();

  return (
    <div className={`p-4 transition-colors ${selected ? "bg-fg/5" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
              transition-colors ${selected ? "bg-accent border-accent" : "border-border hover:border-fg/40"}`}
          >
            {selected && <span className="text-black text-xs font-bold">✓</span>}
          </button>
          <div>
            <p className="text-sm font-medium">{session.label || t.timelineUnlabeled}</p>
            <p className="text-xs text-muted">
              {new Date(session.captured_at).toLocaleDateString(undefined, {
                year: "numeric", month: "short", day: "numeric",
              })}
            </p>
            {session.notes && (
              <p className="text-xs text-muted mt-0.5 line-clamp-1">{session.notes}</p>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="text-xs text-muted hover:text-danger transition-colors disabled:opacity-40 px-1 py-1"
        >
          {deleting ? "…" : t.timelineDelete}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 pl-8">
        {[...session.shots].sort((a, b) => b.yaw - a.yaw).map(shot => {
          const url = imageUrls[shot.image_path];
          return (
            <div key={shot.id} className="flex-shrink-0 text-center">
              <div className="w-16 h-22 bg-surface rounded-lg overflow-hidden border border-border"
                   style={{ height: "88px", width: "64px" }}>
                {url ? (
                  <Image src={url} alt={shot.angle_label} width={64} height={88}
                    className="w-full h-full object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-xs">…</div>
                )}
              </div>
              <p className="text-xs text-muted mt-1 max-w-[64px] leading-tight">{shot.angle_label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
