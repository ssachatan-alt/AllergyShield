"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { AllergyMatrix } from "@/components/AllergyMatrix";
import { LiveCameraScanner } from "@/components/LiveCameraScanner";
import { LabReportUploader } from "@/components/LabReportUploader";
import { ProgressionTimeline } from "@/components/ProgressionTimeline";
import { ScanHistoryView } from "@/components/ScanHistoryView";
import { PassportModal } from "@/components/PassportModal";
import { SettingsModal } from "@/components/SettingsModal";
import { RefreshCw } from "lucide-react";
import { INITIAL_PATIENT } from "@/lib/sample-data";

export default function AllergyShieldDashboard() {
  const [activeTab, setActiveTab] = useState("matrix");
  const [patientData, setPatientData] = useState<any | null>(null);
  const [progressionLogs, setProgressionLogs] = useState<any[]>([]);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Settings & Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [focusAllergen, setFocusAllergen] = useState<string | null>(null);

  // Load API key and theme from localStorage if present
  useEffect(() => {
    const savedKey = localStorage.getItem("allergyshield_gemini_key") || "";
    setApiKey(savedKey);

    const savedTheme = localStorage.getItem("allergyshield_theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

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

  // Fetch patient profile, allergies, and progression
  const fetchAllData = async () => {
    try {
      const [patientRes, progRes, scansRes] = await Promise.all([
        fetch("/api/patient"),
        fetch("/api/progression"),
        fetch("/api/scans"),
      ]);

      if (patientRes.ok) {
        const pData = await patientRes.json();
        setPatientData(pData);
      } else {
        setPatientData({
          ...INITIAL_PATIENT.profile,
          id: "default-patient",
          allergies: INITIAL_PATIENT.allergies,
        });
      }

      if (progRes.ok) {
        const prData = await progRes.json();
        setProgressionLogs(prData.logs || []);
      } else {
        setProgressionLogs(INITIAL_PATIENT.progressionLogs);
      }

      if (scansRes.ok) {
        const scData = await scansRes.json();
        setScanHistory(scData || []);
      } else {
        setScanHistory(
          INITIAL_PATIENT.scans.map((s, i) => ({
            ...s,
            id: `scan-${i + 1}`,
            scannedAt: new Date().toISOString(),
            hazardsDetected: JSON.stringify(s.hazardsDetected),
            cautionsDetected: JSON.stringify(s.cautionsDetected),
            ingredientsList: JSON.stringify(s.ingredientsList),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load AllergyShield patient data, using offline fallback:", err);
      setPatientData({
        ...INITIAL_PATIENT.profile,
        id: "default-patient",
        allergies: INITIAL_PATIENT.allergies,
      });
      setProgressionLogs(INITIAL_PATIENT.progressionLogs);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

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
        patientName={patientData?.fullName || "Elena Vance"}
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
            <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <p className="text-xs font-semibold text-slate-500 font-mono-numbers">
              Loading Verified Patient Records & Clinical Allergen Matrix...
            </p>
          </div>
        ) : (
          <>
            {/* MODULE 1: Allergy Matrix */}
            {activeTab === "matrix" && (
              <AllergyMatrix
                allergies={patientData?.allergies || []}
                onRefresh={fetchAllData}
                onOpenScannerFor={handleOpenScannerFor}
              />
            )}

            {/* MODULE 3: Live Camera / Photo Ingredient Safety Scanner */}
            {activeTab === "scanner" && (
              <LiveCameraScanner
                onRefreshHistory={fetchAllData}
                apiKey={apiKey}
                focusAllergen={focusAllergen}
              />
            )}

            {/* MODULE 2: Physical Lab Report Uploader & Parser */}
            {activeTab === "reports" && (
              <LabReportUploader
                onRefreshMatrix={fetchAllData}
                apiKey={apiKey}
              />
            )}

            {/* MODULE 1 (Part B): Multi-Year Progression Tracker */}
            {activeTab === "progression" && (
              <ProgressionTimeline
                logs={progressionLogs}
                onRefresh={fetchAllData}
              />
            )}

            {/* MODULE 3/4: Historical Product Scans Log */}
            {activeTab === "history" && (
              <ScanHistoryView
                scans={scanHistory}
                onRefresh={fetchAllData}
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
            <span>Clinical Allergen Detection, Verification & Optical Label Auditing</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>ImmunoCAP Standard IgE Classes</span>
            <span>•</span>
            <span>FDA FASTER Act 9 Allergen Mappings</span>
            <span>•</span>
            <span>Epinephrine Action Protocol</span>
          </div>
        </div>
      </footer>

      {/* Emergency Passport Modal */}
      {patientData && (
        <PassportModal
          isOpen={isPassportOpen}
          onClose={() => setIsPassportOpen(false)}
          patient={patientData}
          allergies={patientData.allergies || []}
        />
      )}

      {/* Settings Modal */}
      {patientData && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
          patient={patientData}
          onUpdatePatient={(updated) => setPatientData({ ...patientData, ...updated })}
        />
      )}
    </div>
  );
}
