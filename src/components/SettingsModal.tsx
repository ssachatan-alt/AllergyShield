"use client";

import React, { useState } from "react";
import {
  Settings,
  Sparkles,
  Key,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ShieldCheck,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  patient: {
    id: string;
    fullName: string;
    dob: string;
    primaryPhysician?: string | null;
    emergencyContact?: string | null;
    notes?: string | null;
  };
  onUpdatePatient: (updated: any) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  patient,
  onUpdatePatient,
}: SettingsModalProps) {
  const [keyInput, setKeyInput] = useState(apiKey || "");
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Patient editing state
  const [fullName, setFullName] = useState(patient.fullName || "");
  const [dob, setDob] = useState(patient.dob || "");
  const [primaryPhysician, setPrimaryPhysician] = useState(patient.primaryPhysician || "");
  const [emergencyContact, setEmergencyContact] = useState(patient.emergencyContact || "");
  const [notes, setNotes] = useState(patient.notes || "");
  const [isSavingPatient, setIsSavingPatient] = useState(false);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyInput }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.valid) {
        onSaveApiKey(keyInput);
      }
    } catch (err: any) {
      setTestResult({ valid: false, error: err.message });
    } finally {
      setTestingKey(false);
    }
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPatient(true);

    try {
      const res = await fetch("/api/patient", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileData: {
            fullName,
            dob,
            primaryPhysician,
            emergencyContact,
            notes,
          },
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdatePatient(updated);
        alert("Patient profile updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSavingPatient(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              System Settings & Integration Hub
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini Vision API Configuration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-heading font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Gemini Vision AI Engine
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              gemini-3.8-flash
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter a Google Gemini API Key for live cloud OCR and multi-modal lab report parsing.
            If left blank or offline, AllergyShield seamlessly runs on the local high-accuracy Clinical Engine.
          </p>

          <div className="space-y-2">
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="AIzaSy..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={testingKey}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {testingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Test Connection
              </button>

              <button
                type="button"
                onClick={() => {
                  onSaveApiKey(keyInput);
                  alert("API Key saved to session!");
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-emerald-600 text-xs font-semibold hover:bg-slate-800"
              >
                Save Key
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs border flex items-start gap-2 ${
                  testResult.valid
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                }`}
              >
                {testResult.valid ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                )}
                <div>
                  <span className="font-semibold block">{testResult.message}</span>
                  {testResult.sampleResponse && (
                    <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
                      Response: {testResult.sampleResponse}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patient Profile Demographics */}
        <form onSubmit={handleSavePatient} className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="font-heading font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Patient Record Settings
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supervising Allergist / Immunologist
            </label>
            <input
              type="text"
              value={primaryPhysician}
              onChange={(e) => setPrimaryPhysician(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Emergency Contact & Phone
            </label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Clinical Notes / Protocol
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingPatient}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isSavingPatient ? "Saving..." : "Update Patient Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
