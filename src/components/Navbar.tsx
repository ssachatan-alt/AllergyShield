"use client";

import React from "react";
import {
  ShieldAlert,
  Camera,
  FileText,
  Activity,
  History,
  Settings,
  FileBadge,
  Sparkles,
  User,
  Moon,
  Sun,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  patientName: string;
  isSimulatedEngine: boolean;
  onOpenSettings: () => void;
  onOpenPassport: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  patientName,
  isSimulatedEngine,
  onOpenSettings,
  onOpenPassport,
  isDark,
  toggleTheme,
}: NavbarProps) {
  const navItems = [
    { id: "matrix", label: "Allergy Matrix", icon: ShieldAlert },
    { id: "scanner", label: "Ingredient Scanner", icon: Camera },
    { id: "reports", label: "Lab OCR Parser", icon: FileText },
    { id: "progression", label: "Health Progression", icon: Activity },
    { id: "history", label: "Scan History", icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0B0F17]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Clinical Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-emerald-500/10 border border-slate-800 dark:border-emerald-500/30 flex items-center justify-center text-white dark:text-emerald-400 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  AllergyShield
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Clinical v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Intelligent Allergen Detection & Verification
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & Patient Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Engine Status */}
            <button
              onClick={onOpenSettings}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isSimulatedEngine
                  ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
              }`}
              title="Click to view Gemini API status and settings"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSimulatedEngine ? "Clinical Engine (Offline)" : "Gemini 3.8 Vision"}</span>
            </button>

            {/* Patient Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{patientName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="High-Risk Profile" />
            </div>

            {/* Emergency Passport Button */}
            <button
              onClick={onOpenPassport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 dark:text-rose-300 dark:border-rose-900/50 text-xs font-semibold transition-all shadow-sm"
              title="Emergency Medical Allergy Passport"
            >
              <FileBadge className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">Medical Passport</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark / Light Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Settings & Gemini API"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/60 space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
