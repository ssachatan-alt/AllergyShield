"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { AllergyMatrix, AllergyItemData } from "@/components/AllergyMatrix";
import { LiveCameraScanner } from "@/components/LiveCameraScanner";
import { LabReportUploader } from "@/components/LabReportUploader";
import { ProgressionTimeline } from "@/components/ProgressionTimeline";
import { ScanHistoryView } from "@/components/ScanHistoryView";
import { PassportModal } from "@/components/PassportModal";
import { SettingsModal } from "@/components/SettingsModal";
import { INITIAL_PATIENT } from "@/lib/sample-data";

export default function AllergyShieldDashboard() {
  const [activeTab, setActiveTab] = useState("matrix");
  const [isLoading, setIsLoading] = useState(true);

  // User Profile & Allergies State (Clean slate default)
  const [patientProfile, setPatientProfile] = useState({
    id: "user-profile-default",
    fullName: "My Health Profile",
    dob: "",
    primaryPhysician: "",
    emergencyContact: "",
    notes: "",
  });

  const [allergies, setAllergies] = useState<AllergyItemData[]>([]);
  const [progressionLogs, setProgressionLogs] = useState<any[]>([]);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  // Modals & Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [focusAllergen, setFocusAllergen] = useState<string | null>(null);

  // Initialize from LocalStorage on mount
  useEffect(() => {
    try {
      // 1. Theme
      const savedTheme = localStorage.getItem("allergyshield_theme");
      if (savedTheme === "dark") {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      }

      // 2. Gemini API Key
      const savedKey = localStorage.getItem("allergyshield_gemini_key") || "";
      setApiKey(savedKey);

      // 3. User Profile
      const storedProfile = localStorage.getItem("allergyshield_profile");
      if (storedProfile) {
        setPatientProfile(JSON.parse(storedProfile));
      }

      // 4. User Allergies (Clean Slate by default!)
      const storedAllergies = localStorage.getItem("allergyshield_allergies");
      if (storedAllergies) {
        setAllergies(JSON.parse(storedAllergies));
      } else {
        setAllergies([]); // Fresh clean slate
      }

      // 5. Progression Logs
      const storedLogs = localStorage.getItem("allergyshield_progression");
      if (storedLogs) {
        setProgressionLogs(JSON.parse(storedLogs));
      } else {
        setProgressionLogs([]);
      }

      // 6. Scan History
      const storedScans = localStorage.getItem("allergyshield_scans");
      if (storedScans) {
        setScanHistory(JSON.parse(storedScans));
      } else {
        setScanHistory([]);
      }
    } catch (e) {
      console.warn("LocalStorage initialization notice:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to LocalStorage helpers
  const saveAllergiesToStorage = (updatedAllergies: AllergyItemData[]) => {
    setAllergies(updatedAllergies);
    localStorage.setItem("allergyshield_allergies", JSON.stringify(updatedAllergies));
  };

  const saveProfileToStorage = (updatedProfile: any) => {
    const merged = { ...patientProfile, ...updatedProfile };
    setPatientProfile(merged);
    localStorage.setItem("allergyshield_profile", JSON.stringify(merged));
  };

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("allergyshield_theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("allergyshield_theme", "dark");
      setIsDark(true);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("allergyshield_gemini_key", key);
  };

  // Add new allergy
  const handleAddAllergy = async (newAllergyData: any) => {
    const newItem: AllergyItemData = {
      id: `allergy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newAllergyData.name,
      category: newAllergyData.category || "FOOD",
      severity: newAllergyData.severity || "MODERATE",
      reactionDetails: newAllergyData.reactionDetails || "Sensitivity documented.",
      diagnosticType: newAllergyData.diagnosticType || "CLINICAL_HISTORY",
      diagnosedDate: newAllergyData.diagnosedDate || new Date().toISOString().split("T")[0],
      synonyms: Array.isArray(newAllergyData.synonyms)
        ? JSON.stringify(newAllergyData.synonyms)
        : newAllergyData.synonyms,
      isVerified: true,
    };

    const updated = [newItem, ...allergies];
    saveAllergiesToStorage(updated);

    // Also sync to backend API (async without blocking)
    fetch("/api/patient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAllergyData),
    }).catch(() => {});
  };

  // Delete an allergy
  const handleDeleteAllergy = async (id: string) => {
    const updated = allergies.filter((a) => a.id !== id);
    saveAllergiesToStorage(updated);
    fetch(`/api/patient?id=${id}`, { method: "DELETE" }).catch(() => {});
  };

  // Reset entire profile to fresh clean slate
  const handleResetProfile = () => {
    if (
      !confirm(
        "Are you sure you want to reset your profile? All registered allergies and scan history will be wiped to a fresh clean slate."
      )
    ) {
      return;
    }

    localStorage.removeItem("allergyshield_allergies");
    localStorage.removeItem("allergyshield_profile");
    localStorage.removeItem("allergyshield_scans");
    localStorage.removeItem("allergyshield_progression");

    setAllergies([]);
    setProgressionLogs([]);
    setScanHistory([]);
    setPatientProfile({
      id: "user-profile-default",
      fullName: "My Health Profile",
      dob: "",
      primaryPhysician: "",
      emergencyContact: "",
      notes: "",
    });

    fetch("/api/patient/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RESET" }),
    }).catch(() => {});
  };

  // Load sample demo data on demand
  const handleLoadDemoData = () => {
    const demoAllergies: AllergyItemData[] = INITIAL_PATIENT.allergies.map((a, i) => ({
      ...a,
      id: `demo-allergy-${i + 1}`,
      synonyms: JSON.stringify(a.synonyms),
    }));

    saveAllergiesToStorage(demoAllergies);
    saveProfileToStorage(INITIAL_PATIENT.profile);

    const demoLogs = INITIAL_PATIENT.progressionLogs.map((p, i) => ({
      ...p,
      id: `demo-log-${i + 1}`,
    }));
    setProgressionLogs(demoLogs);
    localStorage.setItem("allergyshield_progression", JSON.stringify(demoLogs));

    const demoScans = INITIAL_PATIENT.scans.map((s, i) => ({
      ...s,
      id: `demo-scan-${i + 1}`,
      scannedAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
      hazardsDetected: JSON.stringify(s.hazardsDetected),
      cautionsDetected: JSON.stringify(s.cautionsDetected),
      ingredientsList: JSON.stringify(s.ingredientsList),
    }));
    setScanHistory(demoScans);
    localStorage.setItem("allergyshield_scans", JSON.stringify(demoScans));

    fetch("/api/patient/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "LOAD_DEMO" }),
    }).catch(() => {});
  };

  // Refresh scan history from server/storage
  const handleRefreshHistory = async () => {
    try {
      const res = await fetch("/api/scans");
      if (res.ok) {
        const data = await res.json();
        setScanHistory(data || []);
        localStorage.setItem("allergyshield_scans", JSON.stringify(data || []));
      }
    } catch (e) {
      console.warn("Refresh history skipped:", e);
    }
  };

  const handleOpenScannerFor = (allergenName: string) => {
    setFocusAllergen(allergenName);
    setActiveTab("scanner");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F17] transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Top Clinical Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patientName={patientProfile.fullName}
        isSimulatedEngine={!apiKey || apiKey.trim() === ""}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPassport={() => setIsPassportOpen(true)}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* Human-Friendly Medical Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-500 font-mono">
              Loading Personal Allergy Workspace...
            </p>
          </div>
        ) : (
          <>
            {/* MODULE 1: Personal Allergy Matrix */}
            {activeTab === "matrix" && (
              <AllergyMatrix
                allergies={allergies}
                onAddAllergy={handleAddAllergy}
                onDeleteAllergy={handleDeleteAllergy}
                onResetProfile={handleResetProfile}
                onLoadDemoData={handleLoadDemoData}
                onOpenScannerFor={handleOpenScannerFor}
              />
            )}

            {/* MODULE 3: Live Camera / Photo Ingredient Safety Scanner */}
            {activeTab === "scanner" && (
              <LiveCameraScanner
                userAllergies={allergies}
                onRefreshHistory={handleRefreshHistory}
                apiKey={apiKey}
                focusAllergen={focusAllergen}
              />
            )}

            {/* MODULE 2: Physical Lab Report Uploader & Parser */}
            {activeTab === "reports" && (
              <LabReportUploader
                onRefreshMatrix={handleRefreshHistory}
                apiKey={apiKey}
              />
            )}

            {/* MODULE 1 (Part B): Multi-Year Progression Tracker */}
            {activeTab === "progression" && (
              <ProgressionTimeline
                logs={progressionLogs}
                onRefresh={handleRefreshHistory}
              />
            )}

            {/* MODULE 3/4: Historical Product Scans Log */}
            {activeTab === "history" && (
              <ScanHistoryView
                scans={scanHistory}
                onRefresh={handleRefreshHistory}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#0B0F17]/60 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-slate-900 dark:text-slate-100">
              AllergyShield
            </span>
            <span>•</span>
            <span>Intelligent Allergen Detection, Local Storage & Camera Safety Scanner</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Personal Offline Storage</span>
            <span>•</span>
            <span>Gemini Vision OCR</span>
            <span>•</span>
            <span>Epinephrine Action Protocol</span>
          </div>
        </div>
      </footer>

      {/* Emergency Passport Modal */}
      <PassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        patient={patientProfile}
        allergies={allergies}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        patient={patientProfile}
        onUpdatePatient={(updated) => saveProfileToStorage(updated)}
      />
    </div>
  );
}
