"use client";

import React, { useState } from "react";
import {
  History,
  Search,
  Filter,
  Trash2,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react";

export interface ScanItemData {
  id: string;
  productName: string;
  brand?: string | null;
  verdict: "HAZARD" | "CAUTION" | "SAFE";
  hazardsDetected?: string | null;
  cautionsDetected?: string | null;
  rawOcrText: string;
  ingredientsList?: string | null;
  scannedAt: string;
}

interface ScanHistoryViewProps {
  scans: ScanItemData[];
  onRefresh: () => void;
}

export function ScanHistoryView({ scans, onRefresh }: ScanHistoryViewProps) {
  const [filterVerdict, setFilterVerdict] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredScans = scans.filter((scan) => {
    const matchesFilter = filterVerdict === "ALL" || scan.verdict === filterVerdict;
    const matchesSearch =
      scan.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scan.brand && scan.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      scan.rawOcrText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeleteScan = async (id: string) => {
    if (!confirm("Delete this scan from your history log?")) return;
    try {
      const res = await fetch(`/api/scans?id=${id}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to delete scan", err);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "HAZARD":
        return {
          bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60",
          icon: Flame,
          label: "Hazard Match",
        };
      case "CAUTION":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
          icon: AlertTriangle,
          label: "Caution Advisory",
        };
      case "SAFE":
      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60",
          icon: CheckCircle2,
          label: "Verified Safe",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Scanned Product Safety History Log
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Audit trail of scanned packaged products, detected allergen hazards, and facility cross-contamination advisories.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-numbers">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {scans.length} Total Audits
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Audits" },
            { id: "HAZARD", label: "🔴 Hazards Only" },
            { id: "CAUTION", label: "🟡 Cautions Only" },
            { id: "SAFE", label: "🟢 Safe Products" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterVerdict(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterVerdict === tab.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search scanned items, brands, text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Scan Log Cards */}
      <div className="space-y-3">
        {filteredScans.map((scan) => {
          const badge = getVerdictBadge(scan.verdict);
          const Icon = badge.icon;
          const parsedHazards = scan.hazardsDetected ? JSON.parse(scan.hazardsDetected) : [];
          const parsedCautions = scan.cautionsDetected ? JSON.parse(scan.cautionsDetected) : [];

          return (
            <div
              key={scan.id}
              className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                      {scan.productName}
                    </h3>
                    {scan.brand && (
                      <span className="text-xs text-slate-500">by {scan.brand}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-mono-numbers">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(scan.scannedAt).toLocaleDateString()} {new Date(scan.scannedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.bg}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {badge.label}
                  </span>
                  <button
                    onClick={() => handleDeleteScan(scan.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hazards or Cautions details */}
              {parsedHazards.length > 0 && (
                <div className="p-3 rounded-lg bg-red-50/70 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 text-xs">
                  <span className="font-bold text-red-800 dark:text-red-300 block mb-1">
                    Matched Allergens:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {parsedHazards.map((h: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 font-semibold text-[11px]"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {parsedCautions.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                    Cross-Contamination Warnings:
                  </span>
                  <ul className="list-disc list-inside text-amber-900/80 dark:text-amber-300/80 space-y-0.5 text-[11px]">
                    {parsedCautions.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* OCR Details snippet */}
              <details className="text-xs text-slate-500">
                <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 font-medium">
                  View Scanned Label Text
                </summary>
                <p className="mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {scan.rawOcrText}
                </p>
              </details>
            </div>
          );
        })}

        {filteredScans.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-8">
            <History className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
              No historical scans match your filter
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Scanned product ingredient records will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
