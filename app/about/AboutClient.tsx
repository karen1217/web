"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import DashboardMetricButton from "@/app/pro/dashboard/DashboardMetricButton";

interface Props {
  isLoggedIn: boolean;
}

export default function AboutClient({ isLoggedIn }: Props) {
  const { t } = useT();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-16">

      {/* Hero */}
      <section className="flex flex-col sm:flex-row gap-8 items-start">
        <div className="flex-1 space-y-5 min-w-0">
          <p className="text-xs text-accent uppercase tracking-widest">{t.dashboardTagline}</p>
          <h1 className="text-2xl font-bold leading-snug tracking-tight">
            {t.dashboardHeroTitle}
          </h1>
          <div className="space-y-4 text-sm text-fg/65 leading-relaxed">
            <p className="whitespace-pre-line">{t.dashboardHeroP1}</p>
            <p className="whitespace-pre-line">{t.dashboardHeroP2}</p>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={t.dashboardHeroImage}
          alt=""
          className="w-full sm:w-[440px] sm:flex-shrink-0 rounded-xl border border-border object-cover sm:mt-10"
        />
      </section>

      <div className="border-t border-accent/30" />

      {/* Features */}
      <div className="space-y-12">

        {/* Checker */}
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-accent uppercase tracking-widest">{t.dashboardCheckerTag}</p>
            <h2 className="text-lg font-semibold">{t.dashboardCheckerTitle}</h2>
          </div>
          <p className="text-sm text-fg/65 leading-relaxed">{t.dashboardCheckerDesc}</p>

          <div className="rounded-xl border border-warn/40 bg-warn/5 px-4 py-4 space-y-2">
            <p className="text-xs font-semibold text-warn/90 flex items-center gap-1.5">
              <span>⚠</span>{t.dashboardDottedLineTitle}
            </p>
            <p className="text-sm text-fg/80 leading-relaxed whitespace-pre-line font-medium">
              {t.dashboardDottedLineDesc}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.dashboardDecoWarningImage}
              alt=""
              className="w-full rounded-lg border border-warn/20 mt-1"
            />
            <p className="text-xs text-fg/50 leading-relaxed">{t.dashboardAnnotationTip}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium
                         border border-accent/50 rounded-lg px-4 py-2
                         hover:border-accent hover:text-fg transition-colors text-fg/80"
            >
              {t.dashboardCheckerCTA}
              <span className="opacity-60">→</span>
            </Link>
            <DashboardMetricButton />
          </div>
        </section>

        {/* Capture */}
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-accent uppercase tracking-widest">{t.dashboardCaptureTag}</p>
            <h2 className="text-lg font-semibold">{t.dashboardCaptureTitle}</h2>
          </div>
          <p className="text-sm text-fg/65 leading-relaxed whitespace-pre-line">{t.dashboardCaptureDesc}</p>
          <Link
            href={isLoggedIn ? "/pro/capture" : "/pro/signup"}
            className="inline-flex items-center gap-1.5 text-sm font-medium
                       border border-accent/50 rounded-lg px-4 py-2
                       hover:border-accent hover:text-fg transition-colors text-fg/80"
          >
            {t.dashboardCaptureCTA}
            <span className="opacity-60">→</span>
          </Link>
        </section>

        {/* Timeline */}
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-accent uppercase tracking-widest">{t.dashboardTimelineTag}</p>
            <h2 className="text-lg font-semibold">{t.dashboardTimelineTitle}</h2>
          </div>
          <p className="text-sm text-fg/65 leading-relaxed whitespace-pre-line">{t.dashboardTimelineDesc}</p>
          <Link
            href={isLoggedIn ? "/pro/timeline" : "/pro/signup"}
            className="inline-flex items-center gap-1.5 text-sm font-medium
                       border border-accent/50 rounded-lg px-4 py-2
                       hover:border-accent hover:text-fg transition-colors text-fg/80"
          >
            {t.dashboardTimelineCTA}
            <span className="opacity-60">→</span>
          </Link>
        </section>

      </div>

      {/* CTA for non-logged-in users */}
      {!isLoggedIn && (
        <section className="border-t border-border pt-12 space-y-4 text-center">
          <p className="text-sm text-fg/65">{t.proFeaturesLoginPrompt}</p>
          <div className="flex justify-center gap-3">
            <Link
              href="/pro/signup"
              className="px-6 py-2.5 bg-accent text-black rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {t.signupButton}
            </Link>
            <Link
              href="/pro/login"
              className="px-6 py-2.5 border border-border rounded-lg text-sm text-muted hover:text-fg transition-colors"
            >
              {t.loginButton}
            </Link>
          </div>
        </section>
      )}

    </div>
  );
}
