"use client";

import { useState } from "react";
import Link from "next/link";
import Uploader from "@/components/Uploader";
import Result from "@/components/Result";
import SaveCTA from "@/components/SaveCTA";
import SiteHeader from "@/components/SiteHeader";
import InpaintModal from "@/components/InpaintModal";
import MetricInfoModal from "@/components/MetricInfoModal";
import { analyzeImages, getErrorMessage, type AnalysisResult } from "@/lib/api";
import { compressIfNeeded } from "@/lib/brightness";
import { useT } from "@/lib/i18n";
import AdBanner from "@/components/AdBanner";
import AdLoadingModal from "@/components/AdLoadingModal";
import HowToModal from "@/components/HowToModal";
import FeaturesModal from "@/components/FeaturesModal";

type InpaintTarget = "before" | "after";

export default function Home() {
  const { t } = useT();
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile]   = useState<File | null>(null);
  const [beforeURL, setBeforeURL]   = useState<string | null>(null);
  const [afterURL, setAfterURL]     = useState<string | null>(null);
  const [result, setResult]         = useState<AnalysisResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [inpaintTarget, setInpaintTarget] = useState<InpaintTarget | null>(null);
  const [metricInfoOpen, setMetricInfoOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen]     = useState(false);

  function handleBeforeSelect(file: File, url: string) {
    setBeforeFile(file); setBeforeURL(url);
    setResult(null); setErrorMsg(null);
  }

  function handleAfterSelect(file: File, url: string) {
    setAfterFile(file); setAfterURL(url);
    setResult(null); setErrorMsg(null);
  }

  function handleInpaintDone(newFile: File, newUrl: string) {
    if (inpaintTarget === "before") { setBeforeFile(newFile); setBeforeURL(newUrl); }
    else                            { setAfterFile(newFile);  setAfterURL(newUrl);  }
    setResult(null);
    setInpaintTarget(null);
  }

  async function handleAnalyze() {
    if (!beforeFile || !afterFile) return;
    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const [compBefore, compAfter] = await Promise.all([
        compressIfNeeded(beforeFile),
        compressIfNeeded(afterFile),
      ]);

      const res = await analyzeImages(compBefore, compAfter);

      if (res.error) {
        setErrorMsg(res.error); // raw code for debugging
      } else {
        setResult(res);
        setFeaturesOpen(true);
      }
    } catch (err) {
      const msg = String(err);
      if (msg.includes("502") || msg.includes("504") || msg.includes("Backend unavailable") || msg.includes("bort")) {
        setErrorMsg(getErrorMessage("Backend_unavailable"));
      } else {
        setErrorMsg(msg);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const canAnalyze = !!beforeFile && !!afterFile && !loading;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">

        {/* Photo guide — language-specific image, falls back to ja */}
        <section>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={t.photoGuide}
            alt={t.photoGuideAlt}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/photo-guide.jpg"; }}
            className="w-full h-auto block rounded-xl border border-border"
          />
        </section>

        {/* Ad banner */}
        <AdBanner />

        {/* Annotation feature intro */}
        <section className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-4 flex gap-3">
          <span className="text-accent text-lg flex-shrink-0 mt-0.5">✦</span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-fg/90">{t.annotationFeatureTitle}</p>
            <p className="text-xs text-muted leading-relaxed">{t.annotationFeatureDesc}</p>
          </div>
        </section>

        {/* Upload section */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before */}
            <div className="space-y-2">
              <Uploader
                label={t.before}
                previewURL={beforeURL}
                onSelect={handleBeforeSelect}
                disabled={loading}
              />
              {beforeFile && beforeURL && (
                <div className="space-y-1">
                  <button
                    onClick={() => setInpaintTarget("before")}
                    className="w-full py-1.5 border border-dashed border-border rounded-lg
                               text-xs text-muted hover:text-fg hover:border-fg/30 transition-colors"
                  >
                    {t.removeAnnotation}
                  </button>
                  <p className="text-xs text-muted text-center leading-relaxed">
                    {t.annotationButtonDesc}
                  </p>
                </div>
              )}
            </div>

            {/* After */}
            <div className="space-y-2">
              <Uploader
                label={t.after}
                previewURL={afterURL}
                onSelect={handleAfterSelect}
                disabled={loading}
              />
              {afterFile && afterURL && (
                <div className="space-y-1">
                  <button
                    onClick={() => setInpaintTarget("after")}
                    className="w-full py-1.5 border border-dashed border-border rounded-lg
                               text-xs text-muted hover:text-fg hover:border-fg/30 transition-colors"
                  >
                    {t.removeAnnotation}
                  </button>
                  <p className="text-xs text-muted text-center leading-relaxed">
                    {t.annotationButtonDesc}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Analyze button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="px-8 py-3 rounded-lg font-semibold text-sm transition-all
                         bg-accent text-black hover:opacity-90
                         disabled:opacity-40 disabled:cursor-not-allowed
                         active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  {t.analyzing}
                </span>
              ) : t.analyzeButton}
            </button>
            <button
              onClick={() => setMetricInfoOpen(true)}
              className="inline-flex items-center gap-1 text-xs text-accent hover:opacity-80
                         transition-opacity font-medium"
            >
              <span className="text-[10px] w-4 h-4 rounded-full border border-current
                               flex items-center justify-center font-bold flex-shrink-0">?</span>
              {t.metricInfoButton}
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger text-center">
              {errorMsg}
            </div>
          )}
        </section>

        {/* Result section */}
        {result && beforeURL && afterURL && (
          <div className="space-y-4">
            <Result result={result} beforeURL={beforeURL} afterURL={afterURL} />
            <AdBanner scriptSrc={process.env.NEXT_PUBLIC_AD_RESULT_SRC} />
            <SaveCTA result={result} beforeFile={beforeFile} afterFile={afterFile} />
          </div>
        )}
      </main>

      <footer className="border-t border-border px-4 py-6 mt-8">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p className="text-xs text-muted">{t.disclaimer}</p>
          <div className="flex justify-center gap-4 text-xs text-muted">
            <Link href="/terms" className="hover:text-fg transition-colors">{t.terms}</Link>
            <Link href="/privacy" className="hover:text-fg transition-colors">{t.privacy}</Link>
          </div>
        </div>
      </footer>

      {/* Ad loading modal */}
      <AdLoadingModal visible={loading} />

      {/* Inpaint modal */}
      {inpaintTarget && (
        <InpaintModal
          imageFile={(inpaintTarget === "before" ? beforeFile : afterFile)!}
          imageUrl={(inpaintTarget === "before" ? beforeURL : afterURL)!}
          onDone={handleInpaintDone}
          onClose={() => setInpaintTarget(null)}
        />
      )}

      {/* Metric info modal */}
      {metricInfoOpen && (
        <MetricInfoModal onClose={() => setMetricInfoOpen(false)} />
      )}

      {/* How-to modal (first visit) */}
      <HowToModal />

      {/* Features modal (after results) */}
      <FeaturesModal open={featuresOpen} onClose={() => setFeaturesOpen(false)} />
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg"
         fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
