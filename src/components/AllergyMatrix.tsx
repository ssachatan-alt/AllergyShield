"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Sparkles,
  RotateCcw,
  Flame,
  ChevronRight,
  ShieldPlus,
} from "lucide-react";
import { MASTER_ALLERGEN_REGISTRY } from "@/lib/allergy-dictionary";

export interface AllergyItemData {
  id: string;
  name: string;
  category: "FOOD" | "ENVIRONMENTAL" | "MEDICATION" | "CONTACT";
  severity: "MILD" | "MODERATE" | "HIGH" | "ANAPHYLACTIC";
  diagnosedDate?: string | null;
  diagnosticType?: string | null;
  reactionDetails?: string | null;
  synonyms?: string | null;
  isVerified?: boolean;
}

interface AllergyMatrixProps {
  allergies: AllergyItemData[];
  onAddAllergy: (newAllergy: any) => void;
  onDeleteAllergy: (id: string) => void;
  onResetProfile: () => void;
  onLoadDemoData: () => void;
  onOpenScannerFor: (allergenName: string) => void;
}

const COMMON_ALLERGEN_SUGGESTIONS = [
  { name: "Peanut", category: "FOOD", severity: "ANAPHYLACTIC", icon: "🥜" },
  { name: "Tree Nuts", category: "FOOD", severity: "HIGH", icon: "🌰" },
  { name: "Milk & Dairy", category: "FOOD", severity: "MODERATE", icon: "🥛" },
  { name: "Egg", category: "FOOD", severity: "MODERATE", icon: "🥚" },
  { name: "Wheat & Gluten", category: "FOOD", severity: "MODERATE", icon: "🌾" },
  { name: "Soy & Soybeans", category: "FOOD", severity: "MODERATE", icon: "🫘" },
  { name: "Crustacean & Shellfish", category: "FOOD", severity: "HIGH", icon: "🦐" },
  { name: "Sesame", category: "FOOD", severity: "HIGH", icon: "🌱" },
  { name: "Birch Pollen (Bet v 1)", category: "ENVIRONMENTAL", severity: "MILD", icon: "🌳" },
  { name: "Penicillin & Beta-Lactams", category: "MEDICATION", severity: "HIGH", icon: "💊" },
];

export function AllergyMatrix({
  allergies,
  onAddAllergy,
  onDeleteAllergy,
  onResetProfile,
  onLoadDemoData,
  onOpenScannerFor,
}: AllergyMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAllergy, setSelectedAllergy] = useState<AllergyItemData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New allergy form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<"FOOD" | "ENVIRONMENTAL" | "MEDICATION" | "CONTACT">("FOOD");
  const [newSeverity, setNewSeverity] = useState<"MILD" | "MODERATE" | "HIGH" | "ANAPHYLACTIC">("MODERATE");
  const [newReactionDetails, setNewReactionDetails] = useState("");
  const [newDiagnosticType, setNewDiagnosticType] = useState("CLINICAL_HISTORY");

  const categories = [
    { id: "ALL", label: "All Categories", count: allergies.length },
    { id: "FOOD", label: "Food & Dietary", count: allergies.filter((a) => a.category === "FOOD").length },
    { id: "ENVIRONMENTAL", label: "Environmental / Pollen", count: allergies.filter((a) => a.category === "ENVIRONMENTAL").length },
    { id: "MEDICATION", label: "Medication & Drugs", count: allergies.filter((a) => a.category === "MEDICATION").length },
    { id: "CONTACT", label: "Contact & Cosmetic", count: allergies.filter((a) => a.category === "CONTACT").length },
  ];

  const filteredAllergies = allergies.filter((allergy) => {
    const matchesCategory = selectedCategory === "ALL" || allergy.category === selectedCategory;
    const matchesSearch =
      allergy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (allergy.reactionDetails && allergy.reactionDetails.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (allergy.synonyms && allergy.synonyms.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "ANAPHYLACTIC":
        return {
          bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60",
          icon: Flame,
          label: "Anaphylactic Risk",
          dot: "bg-red-600",
        };
      case "HIGH":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60",
          icon: AlertTriangle,
          label: "High Severity",
          dot: "bg-rose-500",
        };
      case "MODERATE":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
          icon: AlertTriangle,
          label: "Moderate",
          dot: "bg-amber-500",
        };
      case "MILD":
      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60",
          icon: Info,
          label: "Mild",
          dot: "bg-emerald-500",
        };
    }
  };

  const handleQuickAdd = (suggestion: typeof COMMON_ALLERGEN_SUGGESTIONS[0]) => {
    const alreadyExists = allergies.some((a) => a.name.toLowerCase() === suggestion.name.toLowerCase());
    if (alreadyExists) {
      alert(`${suggestion.name} is already registered in your allergy matrix.`);
      return;
    }

    const reg = MASTER_ALLERGEN_REGISTRY.find(
      (r) => r.canonicalName.toLowerCase() === suggestion.name.toLowerCase()
    );

    onAddAllergy({
      name: suggestion.name,
      category: suggestion.category,
      severity: suggestion.severity,
      reactionDetails: `Diagnosed ${suggestion.name} sensitivity. Added via quick register.`,
      diagnosticType: "CLINICAL_HISTORY",
      synonyms: reg ? reg.synonyms : [suggestion.name],
    });
  };

  const handleCreateAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);

    const reg = MASTER_ALLERGEN_REGISTRY.find(
      (r) => r.canonicalName.toLowerCase() === newName.toLowerCase()
    );

    onAddAllergy({
      name: newName.trim(),
      category: newCategory,
      severity: newSeverity,
      reactionDetails: newReactionDetails.trim() || "Clinical sensitivity recorded.",
      diagnosticType: newDiagnosticType,
      synonyms: reg ? reg.synonyms : [newName.trim()],
    });

    setIsAddModalOpen(false);
    setNewName("");
    setNewReactionDetails("");
    setIsSubmitting(false);
  };

  const registryInfo = selectedAllergy
    ? MASTER_ALLERGEN_REGISTRY.find(
        (r) =>
          r.canonicalName.toLowerCase() === selectedAllergy.name.toLowerCase() ||
          r.synonyms.some((s) => s.toLowerCase() === selectedAllergy.name.toLowerCase())
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Personal Allergy Matrix & Protection Profile
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage your personal verified allergies. The camera scanner cross-references this matrix in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Allergy
            </button>

            {allergies.length > 0 && (
              <button
                onClick={onResetProfile}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-all"
                title="Wipe allergies and reset to clean state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Profile
              </button>
            )}

            {allergies.length === 0 && (
              <button
                onClick={onLoadDemoData}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-xs font-semibold hover:bg-emerald-100 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Sample Demo Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats bar if allergies exist */}
        {allergies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Registered</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                  {allergies.length}
                </span>
                <span className="text-xs text-slate-500">active</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40">
              <span className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                Anaphylactic Risk
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-heading text-2xl font-bold text-red-700 dark:text-red-400">
                  {allergies.filter((a) => a.severity === "ANAPHYLACTIC").length}
                </span>
                <span className="text-xs text-red-600 dark:text-red-400">high vigilance</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">High / Moderate</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-heading text-2xl font-bold text-amber-800 dark:text-amber-300">
                  {allergies.filter((a) => a.severity === "HIGH" || a.severity === "MODERATE").length}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400">monitored</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Scanner Protection</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-heading text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                  Active
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">100% synced</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FRESH EMPTY STATE: When no allergies are registered */}
      {allergies.length === 0 && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
            <ShieldPlus className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
              No Allergies Registered Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Start with a clean slate by adding your diagnosed food, medication, or environmental sensitivities.
              AllergyShield will use this list to protect you during live camera scans.
            </p>
          </div>

          {/* Quick-Add Common Allergens Bar */}
          <div className="max-w-xl mx-auto space-y-2.5 pt-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Quick-add common allergens:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {COMMON_ALLERGEN_SUGGESTIONS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleQuickAdd(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all hover:border-emerald-500"
                >
                  <span>{item.icon}</span>
                  <span>+ {item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Custom Allergen
            </button>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH: When allergies exist */}
      {allergies.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                    : "bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedCategory === cat.id
                    ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search registered allergens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      )}

      {/* Grid of Allergy Cards */}
      {allergies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAllergies.map((allergy) => {
            const badge = getSeverityBadge(allergy.severity);
            const Icon = badge.icon;
            const parsedSynonyms = allergy.synonyms
              ? typeof allergy.synonyms === "string"
                ? JSON.parse(allergy.synonyms)
                : allergy.synonyms
              : [];

            return (
              <div
                key={allergy.id}
                onClick={() => setSelectedAllergy(allergy)}
                className="group bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${badge.dot}`} />
                      <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {allergy.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bg}`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove ${allergy.name} from your active matrix?`)) {
                            onDeleteAllergy(allergy.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
                        title="Delete allergy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="uppercase tracking-wider font-semibold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {allergy.category}
                    </span>
                    <span>•</span>
                    <span>
                      {allergy.diagnosticType === "IGE_BLOOD"
                        ? "ImmunoCAP IgE Blood"
                        : allergy.diagnosticType === "SKIN_PRICK"
                        ? "Skin Prick Test"
                        : "Clinical History"}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {allergy.reactionDetails || "Clinical sensitivity recorded."}
                  </p>

                  {Array.isArray(parsedSynonyms) && parsedSynonyms.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {parsedSynonyms.slice(0, 3).map((syn: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Guard
                  </span>
                  <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 flex items-center gap-0.5 text-[11px] font-medium">
                    Details
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedAllergy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSeverityBadge(selectedAllergy.severity).bg}`}>
                    {selectedAllergy.severity} RISK
                  </span>
                  <span className="text-xs text-slate-500 uppercase">{selectedAllergy.category}</span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-slate-900 dark:text-white mt-2">
                  {selectedAllergy.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAllergy(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Documented Reaction Symptoms:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedAllergy.reactionDetails || "No details documented."}
                </p>
              </div>

              {registryInfo?.crossReactivities && registryInfo.crossReactivities.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cross-Reactivity Alerts:</span>
                  </div>
                  <ul className="list-disc list-inside text-amber-900/80 dark:text-amber-300/80 space-y-1">
                    {registryInfo.crossReactivities.map((cr, i) => (
                      <li key={i}>{cr}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  onOpenScannerFor(selectedAllergy.name);
                  setSelectedAllergy(null);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold"
              >
                <Search className="w-3.5 h-3.5" />
                Scan Product for {selectedAllergy.name}
              </button>

              <button
                onClick={() => setSelectedAllergy(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Allergen Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Add New Allergen
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAllergy} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Allergen Name (e.g. Peanut, Dairy, Penicillin, Ibuprofen, Birch)
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter allergen name"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="FOOD">Food & Dietary</option>
                    <option value="ENVIRONMENTAL">Environmental / Pollen</option>
                    <option value="MEDICATION">Medication & Drug</option>
                    <option value="CONTACT">Contact & Cosmetic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Severity
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e: any) => setNewSeverity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="ANAPHYLACTIC">🔴 Anaphylactic Risk</option>
                    <option value="HIGH">🟠 High</option>
                    <option value="MODERATE">🟡 Moderate</option>
                    <option value="MILD">🟢 Mild</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diagnosis / Verification Method
                </label>
                <select
                  value={newDiagnosticType}
                  onChange={(e) => setNewDiagnosticType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="CLINICAL_HISTORY">Clinical Ingestion History / Observed Reaction</option>
                  <option value="IGE_BLOOD">Blood IgE Panel (ImmunoCAP)</option>
                  <option value="SKIN_PRICK">Skin Prick Test (SPT)</option>
                  <option value="CHALLENGE">Oral Food Challenge (OFC)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observed Reaction Symptoms
                </label>
                <textarea
                  rows={2}
                  value={newReactionDetails}
                  onChange={(e) => setNewReactionDetails(e.target.value)}
                  placeholder="e.g. Hives, throat tightness, lip swelling, acute stomach distress..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
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
                  {isSubmitting ? "Saving..." : "Add to Matrix"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
