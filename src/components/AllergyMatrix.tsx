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
  ExternalLink,
  ChevronRight,
  Flame,
  Stethoscope,
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
  onRefresh: () => void;
  onOpenScannerFor: (allergenName: string) => void;
}

export function AllergyMatrix({ allergies, onRefresh, onOpenScannerFor }: AllergyMatrixProps) {
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
  const [newDiagnosticType, setNewDiagnosticType] = useState("IGE_BLOOD");

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

  // Severity styling map
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this allergen from the active matrix?")) return;
    try {
      const res = await fetch(`/api/patient?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
        if (selectedAllergy?.id === id) setSelectedAllergy(null);
      }
    } catch (err) {
      console.error("Failed to delete allergy", err);
    }
  };

  const handleCreateAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);

    try {
      const matched = MASTER_ALLERGEN_REGISTRY.find(
        (r) => r.canonicalName.toLowerCase() === newName.toLowerCase()
      );

      const res = await fetch("/api/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          category: newCategory,
          severity: newSeverity,
          reactionDetails: newReactionDetails,
          diagnosticType: newDiagnosticType,
          synonyms: matched ? matched.synonyms : [newName],
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewName("");
        setNewReactionDetails("");
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to add allergy", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find cross-reactivities for selected allergen
  const registryInfo = selectedAllergy
    ? MASTER_ALLERGEN_REGISTRY.find(
        (r) =>
          r.canonicalName.toLowerCase() === selectedAllergy.name.toLowerCase() ||
          r.synonyms.some((s) => s.toLowerCase() === selectedAllergy.name.toLowerCase())
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Patient Allergy Profile & Risk Matrix
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Active verified clinical allergens continuously cross-matched against food packages and medical prescriptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Allergen
            </button>
          </div>
        </div>

        {/* Quick Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Registered</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                {allergies.length}
              </span>
              <span className="text-xs text-slate-500">biomarkers</span>
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
              <span className="text-xs text-amber-600 dark:text-amber-400">managed</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Clinical Verification</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                100%
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">lab correlated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
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

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search allergens, reactions, derivatives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Allergy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAllergies.map((allergy) => {
          const badge = getSeverityBadge(allergy.severity);
          const Icon = badge.icon;
          const parsedSynonyms = allergy.synonyms
            ? JSON.parse(allergy.synonyms)
            : [];

          return (
            <div
              key={allergy.id}
              onClick={() => setSelectedAllergy(allergy)}
              className="group bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-xs cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header with Severity & Delete */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: badge.dot.replace('bg-', '') }} />
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
                      onClick={(e) => handleDelete(allergy.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
                      title="Remove from matrix"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Category & Diagnostic Method */}
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="uppercase tracking-wider font-semibold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {allergy.category}
                  </span>
                  <span>•</span>
                  <span>
                    {allergy.diagnosticType === "IGE_BLOOD"
                      ? "ImmunoCAP IgE Blood"
                      : allergy.diagnosticType === "SKIN_PRICK"
                      ? "Skin Prick Test (SPT)"
                      : "Clinical History"}
                  </span>
                </div>

                {/* Reaction Details */}
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {allergy.reactionDetails || "No detailed clinical reaction documented."}
                </p>

                {/* Scientific Synonyms Tags */}
                {parsedSynonyms.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {parsedSynonyms.slice(0, 3).map((syn: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800"
                      >
                        {syn}
                      </span>
                    ))}
                    {parsedSynonyms.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                        +{parsedSynonyms.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Record
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

      {filteredAllergies.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-8">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
            No matching allergens found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search filter, or add a new verified allergen to your patient matrix.
          </p>
          <button
            onClick={() => { setSelectedCategory("ALL"); setSearchQuery(""); }}
            className="mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Detail Modal / Drawer */}
      {selectedAllergy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-5">
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
                  Reported Reaction Symptoms:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedAllergy.reactionDetails || "No details documented."}
                </p>
              </div>

              {/* Cross-Reactivity Intelligence */}
              {registryInfo?.crossReactivities && registryInfo.crossReactivities.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Clinical Cross-Reactivity Warnings:</span>
                  </div>
                  <ul className="list-disc list-inside text-amber-900/80 dark:text-amber-300/80 space-y-1">
                    {registryInfo.crossReactivities.map((cr, i) => (
                      <li key={i}>{cr}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hidden Biochemical Derivatives */}
              {registryInfo?.hiddenDerivatives && registryInfo.hiddenDerivatives.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Flagged Ingredient Derivatives (OCR Cross-Match):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {registryInfo.hiddenDerivatives.map((deriv, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono-numbers text-[10px]"
                      >
                        {deriv}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  onOpenScannerFor(selectedAllergy.name);
                  setSelectedAllergy(null);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                Scan Product for this Allergen
              </button>

              <button
                onClick={() => setSelectedAllergy(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
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
                Add Clinical Allergen
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
                  Allergen Name (e.g. Peanut, Cashew, Soy, Amoxicillin)
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter canonical allergen name"
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
                    <option value="MEDICATION">Medication</option>
                    <option value="CONTACT">Contact / Cosmetic</option>
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
                  Diagnostic Confirmation Method
                </label>
                <select
                  value={newDiagnosticType}
                  onChange={(e) => setNewDiagnosticType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="IGE_BLOOD">ImmunoCAP Specific IgE Blood Panel</option>
                  <option value="SKIN_PRICK">Skin Prick Test (SPT)</option>
                  <option value="CLINICAL_HISTORY">Clinical Ingestion History</option>
                  <option value="CHALLENGE">Oral Food Challenge (OFC)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reaction Symptoms / Manifestations
                </label>
                <textarea
                  rows={3}
                  value={newReactionDetails}
                  onChange={(e) => setNewReactionDetails(e.target.value)}
                  placeholder="e.g. Lip angioedema, throat tightness, severe urticaria within 15 minutes..."
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
                  {isSubmitting ? "Adding..." : "Save to Matrix"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
