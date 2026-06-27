"use client";

import Link from "next/link";
import { useT, type Lang } from "@/lib/i18n";
import { PRIVACY, type LegalSection } from "@/lib/legal-content";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ja", label: "JA" },
  { code: "en", label: "EN" },
  { code: "ko", label: "KO" },
];

export default function PrivacyPage() {
  const { lang, setLang } = useT();
  const doc = PRIVACY[lang];

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-muted hover:text-fg transition-colors">
            ← Angle Log
          </Link>
          <div className="flex gap-0.5">
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
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{doc.subtitle}</h1>
          <p className="text-xs text-muted">{doc.lastUpdated}</p>
        </div>

        <div className="space-y-8">
          {doc.sections.map((section, i) => (
            <Section key={i} section={section} />
          ))}
        </div>

        <div className="pt-6 border-t border-border text-center">
          <Link href="/" className="text-sm text-muted hover:text-fg transition-colors">
            ← Angle Log
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ section }: { section: LegalSection }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-fg">{section.heading}</h2>
      {section.items.map((item, i) => {
        if (item.type === "p") {
          return <p key={i} className="text-sm text-fg/80 leading-relaxed">{item.text}</p>;
        }
        if (item.type === "ul") {
          return (
            <ul key={i} className="list-disc list-inside space-y-1 pl-1">
              {item.items.map((li, j) => (
                <li key={j} className="text-sm text-fg/80 leading-relaxed">{li}</li>
              ))}
            </ul>
          );
        }
        if (item.type === "table") {
          return (
            <div key={i} className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {item.rows.map(([label, value], j) => (
                    <tr key={j} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 text-muted font-medium whitespace-nowrap w-36 align-top">{label}</td>
                      <td className="py-2 text-fg/80 leading-relaxed">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      })}
    </div>
  );
}
