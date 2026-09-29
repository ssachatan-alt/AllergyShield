"use client";

import React, { useState } from "react";
import { Info, X, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";

export function DisclaimerBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Medical Advisory Notice" className="w-full bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex-shrink-0">
              <Info className="w-3.5 h-3.5" />
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Clinical Safety Advisory:
              </span>
              <span>
                AllergyShield is an intelligent risk-mitigation assistant. It does not replace emergency clinical judgement. Always carry prescribed Epinephrine (EpiPen).
              </span>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline inline-flex items-center gap-0.5"
              >
                {isOpen ? "Hide details" : "Learn more"}
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            title="Dismiss advisory"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {isOpen && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 space-y-1.5 leading-relaxed">
            <p>
              • <strong>Packaging Variations:</strong> Ingredient formulations change without notice. Cross-contamination statements (e.g. &quot;may contain&quot;) are voluntary under FALCPA/FASTER Act regulations.
            </p>
            <p>
              • <strong>Severe Hypersensitivity:</strong> If you suspect severe systemic anaphylaxis (difficulty breathing, throat tightness, dizziness, generalized hives), administer your epinephrine auto-injector immediately and call emergency services (911 or local emergency number).
            </p>
            <p>
              • <strong>Biomarker Correlation:</strong> Blood IgE and Skin Prick Test wheal sizes represent physiological sensitization, which must always be correlated with clinical history by your supervising physician.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
