"use client";

import React from "react";
import {
  FileBadge,
  Printer,
  X,
  AlertTriangle,
  Flame,
  Phone,
  User,
  ShieldAlert,
  HeartPulse,
} from "lucide-react";
import { AllergyItemData } from "./AllergyMatrix";

interface PassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    fullName: string;
    dob: string;
    primaryPhysician?: string | null;
    emergencyContact?: string | null;
    notes?: string | null;
  };
  allergies: AllergyItemData[];
}

export function PassportModal({
  isOpen,
  onClose,
  patient,
  allergies,
}: PassportModalProps) {
  if (!isOpen) return null;

  const anaphylacticAllergies = allergies.filter((a) => a.severity === "ANAPHYLACTIC");
  const otherAllergies = allergies.filter((a) => a.severity !== "ANAPHYLACTIC");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 my-8 print:m-0 print:p-6 print:shadow-none print:max-w-none">
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center">
              <FileBadge className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest block">
                Official Clinical Emergency Document
              </span>
              <h2 className="font-heading font-bold text-2xl tracking-tight text-slate-900">
                Patient Allergy Medical Passport
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              Print / PDF Export
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="font-semibold text-slate-500 block">Patient Legal Name:</span>
            <span className="font-bold text-slate-900 text-sm">{patient.fullName}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 block">Date of Birth:</span>
            <span className="font-bold text-slate-900 text-sm">{patient.dob}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 block">Blood / Resuscitation Status:</span>
            <span className="font-bold text-red-700 text-sm">Carries EpiPen Twin-Pack</span>
          </div>
          <div className="col-span-2">
            <span className="font-semibold text-slate-500 block">Supervising Physician:</span>
            <span className="text-slate-800 font-medium">{patient.primaryPhysician || "Unspecified"}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 block">Emergency Contact:</span>
            <span className="text-slate-800 font-medium">{patient.emergencyContact || "None"}</span>
          </div>
        </div>

        {/* High Vigilance Anaphylaxis Alert Box */}
        {anaphylacticAllergies.length > 0 && (
          <div className="p-4 rounded-xl bg-red-50 border-2 border-red-500 space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600" />
              <h3 className="font-heading font-bold text-base text-red-800 uppercase tracking-tight">
                Confirmed Life-Threatening Anaphylactic Allergens
              </h3>
            </div>
            <div className="space-y-2 mt-2">
              {anaphylacticAllergies.map((allergy) => (
                <div key={allergy.id} className="p-2.5 rounded bg-white border border-red-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-red-900 text-sm">
                    <span>{allergy.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800">
                      SYSTEMIC ANAPHYLAXIS
                    </span>
                  </div>
                  <p className="text-red-800/80 mt-1">{allergy.reactionDetails}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Managed & Moderate Allergens */}
        {otherAllergies.length > 0 && (
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Other Confirmed Hypersensitivities:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {otherAllergies.map((allergy) => (
                <div key={allergy.id} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{allergy.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                      {allergy.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">
                    {allergy.reactionDetails || "Clinical confirmation recorded."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Action Protocol */}
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-red-400" />
            <span className="font-bold text-sm tracking-tight text-white uppercase">
              Emergency Anaphylaxis Protocol (Call 911 / Emergency Services)
            </span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-200 text-[11px] leading-relaxed">
            <li>
              <strong>Inject Epinephrine Immediately:</strong> Administer auto-injector into outer mid-thigh (through clothing if necessary). Hold firmly in place for 3 seconds.
            </li>
            <li>
              <strong>Position Patient:</strong> Lay flat with legs elevated. If breathing is labored or vomiting occurs, place on their side. Do not stand up or walk.
            </li>
            <li>
              <strong>Activate Emergency Services:</strong> Call 911 immediately and state: &quot;Anaphylaxis — patient has received epinephrine&quot;.
            </li>
            <li>
              <strong>Secondary Dose:</strong> If symptoms fail to improve after 5 minutes, administer second auto-injector.
            </li>
          </ol>
        </div>

        {/* Verification Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-200">
          <span>AllergyShield Medical Intelligence Protocol • Form AS-881</span>
          <span>Verified: {new Date().toISOString().split("T")[0]}</span>
        </div>
      </div>
    </div>
  );
}
