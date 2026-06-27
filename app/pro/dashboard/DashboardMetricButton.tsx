"use client";

import { useState } from "react";
import MetricInfoModal from "@/components/MetricInfoModal";
import { useT } from "@/lib/i18n";

export default function DashboardMetricButton() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent
                   border border-accent/50 hover:border-accent hover:bg-accent/10 rounded-full px-3 py-1.5
                   transition-colors"
      >
        <span className="text-[10px] w-4 h-4 rounded-full border border-current
                         flex items-center justify-center font-bold flex-shrink-0">?</span>
        {t.dashboardMetricCTA}
      </button>
      {open && <MetricInfoModal onClose={() => setOpen(false)} />}
    </>
  );
}
