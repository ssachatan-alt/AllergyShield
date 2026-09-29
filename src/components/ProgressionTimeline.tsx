"use client";

import React, { useState } from "react";
import {
  Activity,
  Calendar,
  AlertOctagon,
  Flame,
  Plus,
  Wind,
  ShieldAlert,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface ProgressionLogData {
  id: string;
  eventDate: string;
  season?: string | null;
  year: number;
  allergenName: string;
  reactionType: string;
  severity: "MILD" | "MODERATE" | "SEVERE" | "LIFE_THREATENING";
  intervention?: string | null;
  environmentalFactors?: string | null;
  notes?: string | null;
}

interface ProgressionTimelineProps {
  logs: ProgressionLogData[];
  onRefresh: () => void;
}

export function ProgressionTimeline({ logs, onRefresh }: ProgressionTimelineProps) {
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New log form state
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [season, setSeason] = useState("SPRING");
  const [allergenName, setAllergenName] = useState("");
  const [reactionType, setReactionType] = useState("");
  const [severity, setSeverity] = useState("MODERATE");
  const [intervention, setIntervention] = useState("");
  const [environmentalFactors, setEnvironmentalFactors] = useState("");
  const [notes, setNotes] = useState("");

  const years = Array.from(new Set(logs.map((l) => l.year))).sort((a, b) => b - a);

  const filteredLogs = logs.filter(
    (log) => selectedYear === "ALL" || log.year.toString() === selectedYear
  );

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "LIFE_THREATENING":
        return {
          bg: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
          label: "Life-Threatening Anaphylaxis",
          icon: Flame,
        };
      case "SEVERE":
        return {
          bg: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
          label: "Severe Acute Reaction",
          icon: AlertOctagon,
        };
      case "MODERATE":
        return {
          bg: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
          label: "Moderate Reaction",
          icon: Activity,
        };
      case "MILD":
      default:
        return {
          bg: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
          label: "Mild Symptoms",
          icon: Activity,
        };
    }
  };

  const getSeasonBadge = (seas?: string | null) => {
    switch (seas) {
      case "SPRING":
        return { icon: "🌱", label: "Spring Bloom", color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300" };
      case "SUMMER":
        return { icon: "☀️", label: "Summer High Heat", color: "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300" };
      case "FALL":
        return { icon: "🍂", label: "Autumn Ragweed", color: "text-orange-700 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300" };
      case "WINTER":
        return { icon: "❄️", label: "Winter Dry Cold", color: "text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300" };
      default:
        return { icon: "📅", label: "Seasonal", color: "text-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-300" };
    }
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allergenName || !reactionType) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/progression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventDate,
          season,
          year: parseInt(eventDate.split("-")[0]),
          allergenName,
          reactionType,
          severity,
          intervention,
          environmentalFactors,
          notes,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setAllergenName("");
        setReactionType("");
        setIntervention("");
        setNotes("");
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to add progression log", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Multi-Year Progression & Reaction Timeline
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Longitudinal tracking of allergic episodes, clinical interventions, and seasonal environmental shifts across years.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold shadow-xs transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Log Reaction Incident
          </button>
        </div>

        {/* Longitudinal Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500">Tracked Multi-Year Span</span>
            <div className="mt-1 font-heading text-xl font-bold text-slate-900 dark:text-white">
              2021 – 2026
            </div>
            <span className="text-[10px] text-slate-400">5 active years</span>
          </div>

          <div className="p-3 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40">
            <span className="text-xs font-medium text-red-700 dark:text-red-400">Total Reactions</span>
            <div className="mt-1 font-heading text-xl font-bold text-red-700 dark:text-red-400">
              {logs.length} logged
            </div>
            <span className="text-[10px] text-red-600 dark:text-red-400">1 life-threatening</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Peak Season Trigger</span>
            <div className="mt-1 font-heading text-xl font-bold text-emerald-800 dark:text-emerald-300">
              Spring (Bet v 1)
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">40% of seasonal flares</span>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">EpiPen Deployments</span>
            <div className="mt-1 font-heading text-xl font-bold text-blue-800 dark:text-blue-300">
              2 successful
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400">Rapid resolution</span>
          </div>
        </div>
      </div>

      {/* Year Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedYear("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedYear === "ALL"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
              : "bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800"
          }`}
        >
          All Years ({logs.length})
        </button>
        {years.map((yr) => (
          <button
            key={yr}
            onClick={() => setSelectedYear(yr.toString())}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedYear === yr.toString()
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            {yr}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {filteredLogs.map((log) => {
          const sevBadge = getSeverityBadge(log.severity);
          const seasBadge = getSeasonBadge(log.season);
          const SevIcon = sevBadge.icon;

          return (
            <div key={log.id} className="relative group">
              {/* Timeline Node Dot */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full bg-white dark:bg-[#111827] border-2 border-slate-400 dark:border-slate-600 group-hover:border-emerald-500 transition-colors flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${log.severity === "LIFE_THREATENING" ? "bg-red-600 animate-ping" : "bg-slate-500 dark:bg-slate-400"}`} />
              </div>

              {/* Event Card */}
              <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                {/* Header: Date, Season & Severity */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-numbers text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {log.eventDate}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 ${seasBadge.color}`}>
                      <span>{seasBadge.icon}</span>
                      <span>{seasBadge.label}</span>
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${sevBadge.bg}`}>
                    <SevIcon className="w-3.5 h-3.5" />
                    {sevBadge.label}
                  </span>
                </div>

                {/* Allergen & Manifestation */}
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    {log.allergenName}
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    Reaction: {log.reactionType}
                  </p>
                </div>

                {/* Intervention Box */}
                {log.intervention && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Medical Intervention Applied:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-mono-numbers text-[11px]">
                      {log.intervention}
                    </p>
                  </div>
                )}

                {/* Environmental & Notes */}
                {(log.environmentalFactors || log.notes) && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {log.environmentalFactors && (
                      <div className="flex items-start gap-1.5">
                        <Wind className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>Factors: {log.environmentalFactors}</span>
                      </div>
                    )}
                    {log.notes && (
                      <div className="flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>Clinical Notes: {log.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Reaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Log Historical Reaction Incident
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Season
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="SPRING">🌱 Spring</option>
                    <option value="SUMMER">☀️ Summer</option>
                    <option value="FALL">🍂 Fall</option>
                    <option value="WINTER">❄️ Winter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Trigger Allergen
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Peanut, Cashew, Birch Pollen"
                    value={allergenName}
                    onChange={(e) => setAllergenName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Clinical Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="LIFE_THREATENING">🔴 Life-Threatening Anaphylaxis</option>
                    <option value="SEVERE">🟠 Severe</option>
                    <option value="MODERATE">🟡 Moderate</option>
                    <option value="MILD">🟢 Mild</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reaction Symptoms / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute bronchospasm, diffuse urticaria, dizziness"
                  value={reactionType}
                  onChange={(e) => setReactionType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Intervention / Treatment
                </label>
                <input
                  type="text"
                  placeholder="e.g. EpiPen 0.3mg IM, Diphenhydramine 50mg, ED evaluation"
                  value={intervention}
                  onChange={(e) => setIntervention(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Environmental Triggers or Exposure Context
                </label>
                <input
                  type="text"
                  placeholder="e.g. Restaurant satay cross-contact, high tree pollen count (10.5)"
                  value={environmentalFactors}
                  onChange={(e) => setEnvironmentalFactors(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Logging..." : "Commit Incident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
