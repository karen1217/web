"use client";

import { useRef } from "react";
import { useT } from "@/lib/i18n";

interface Props {
  label: string;
  previewURL: string | null;
  onSelect: (file: File, dataURL: string) => void;
  disabled?: boolean;
}

export default function Uploader({ label, previewURL, onSelect, disabled }: Props) {
  const { t } = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onSelect(file, url);
    // Reset so selecting the same file again fires onChange
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      {/* Label */}
      <p className="text-sm font-medium text-fg/80">{label}</p>

      {/* Drop zone / preview */}
      <button
        type="button"
        onClick={() => !disabled && inputRef.current?.click()}
        disabled={disabled}
        className={`
          relative w-full aspect-[3/4] rounded-xl border-2 overflow-hidden
          flex flex-col items-center justify-center gap-2
          transition-colors duration-150
          ${previewURL
            ? "border-border"
            : "border-dashed border-border hover:border-fg/40"}
          ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
        `}
      >
        {previewURL ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewURL}
              alt={label}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Re-select overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-150 flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-xs text-fg font-medium bg-black/60 px-3 py-1.5 rounded-full">
                {t.changePhoto}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center px-4">
            <UploadIcon />
            <p className="text-sm text-muted mt-2">{t.tapToSelect}</p>
            <p className="text-xs text-muted/60 mt-1">{t.autoCompress}</p>
          </div>
        )}
      </button>

      {/* Hidden file input – accept images, allow camera roll on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={undefined}
        onChange={handleChange}
        disabled={disabled}
        aria-label={`${label}の写真を選択`}
      />
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      className="w-8 h-8 text-muted mx-auto"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}
