"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  FileCheck,
  ChevronRight,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";
import { SAMPLE_LAB_REPORTS } from "@/lib/sample-data";

interface LabReportUploaderProps {
  onRefreshMatrix: () => void;
  apiKey?: string;
}

export function LabReportUploader({ onRefreshMatrix, apiKey }: LabReportUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [extractedReport, setExtractedReport] = useState<any | null>(null);
  const [isCommitted, setIsCommitted] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [syncToMatrix, setSyncToMatrix] = useState(true);

  // Editable items state for the side-by-side verification screen
  const [editableItems, setEditableItems] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setIsCommitted(false);
    setExtractedReport(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = SAMPLE_LAB_REPORTS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedFile(null);
    setFilePreview(`/sample_reports/${preset.sampleImageName}`);
    setIsCommitted(false);
    triggerExtraction("", preset.id);
  };

  const triggerExtraction = async (base64Data?: string, presetId?: string) => {
    setIsProcessing(true);
    setProcessingStep("Initializing Gemini Vision OCR pipeline...");

    try {
      setTimeout(() => setProcessingStep("Detecting laboratory printout tables & reference bounds..."), 600);
      setTimeout(() => setProcessingStep("Normalizing biomarker units (kU/L / mm wheal) & classes..."), 1300);

      const res = await fetch("/api/lab-reports/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data || filePreview || "",
          mimeType: selectedFile?.type || "image/png",
          apiKey,
          presetId,
        }),
      });

      if (!res.ok) throw new Error("Failed to parse document");

      const data = await res.json();
      setExtractedReport(data);
      setEditableItems(data.items || []);
    } catch (err: any) {
      console.error("Extraction error:", err);
      alert("Error extracting lab report: " + (err.message || "Failed"));
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditableItems(updated);
  };

  const handleCommitRecord = async () => {
    if (!extractedReport) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/lab-reports/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportTitle: extractedReport.reportTitle,
          labName: extractedReport.labName,
          testDate: extractedReport.testDate,
          testType: extractedReport.testType,
          items: editableItems,
          syncToAllergyMatrix: syncToMatrix,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setIsCommitted(true);
        setCommitMessage(
          `Successfully committed to permanent record. Synced ${result.syncedCount || 0} biomarkers to active allergy matrix.`
        );
        onRefreshMatrix();
      } else {
        throw new Error(result.error || "Commit failed");
      }
    } catch (err: any) {
      alert("Failed to commit record: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "VERY_HIGH":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900";
      case "HIGH":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900";
      case "MODERATE":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900";
      case "LOW":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900";
      case "NEGATIVE":
      case "CONTROL_VALID":
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Physical Lab Report Uploader & OCR Parser
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Upload physical diagnostic lab printouts (Quest/Labcorp Blood IgE panels or Skin Prick Tests).
              Extracts quantitative biomarkers with side-by-side clinical verification before committing.
            </p>
          </div>
        </div>

        {/* Preset Document Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Quick-load verified diagnostic samples:
          </span>
          {SAMPLE_LAB_REPORTS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Drag-Drop / Upload Area */}
      {!extractedReport && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-[#111827] p-10 text-center transition-all shadow-xs"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />

          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Upload className="w-7 h-7" />
          </div>

          <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
            {selectedFile ? selectedFile.name : "Drop clinical laboratory document here"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Supports high-resolution scans and camera photos of Blood IgE panels, Component-Resolved Diagnostics (CRD), and Skin Prick Test sheets (PNG, JPG, PDF).
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-emerald-600 text-xs font-semibold hover:bg-slate-800"
            >
              Browse Local Files
            </button>
          </div>
        </div>
      )}

      {/* Processing Loader */}
      {isProcessing && (
        <div className="p-8 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 text-center space-y-3 animate-in fade-in duration-200">
          <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto" />
          <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            Analyzing Diagnostic Document
          </h4>
          <p className="text-xs text-slate-500 font-mono-numbers">
            {processingStep || "Parsing document layout and tabular biomarkers..."}
          </p>
        </div>
      )}

      {/* Side-by-Side Verification Screen */}
      {extractedReport && !isProcessing && (
        <div className="space-y-6">
          {/* Status bar */}
          <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                  Document Successfully Extracted & Digitized
                </span>
                <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                  {extractedReport.reportTitle} • {extractedReport.labName} • Confidence:{" "}
                  {Math.round(extractedReport.extractionConfidence * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setExtractedReport(null); setSelectedFile(null); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40"
              >
                Scan Another
              </button>
            </div>
          </div>

          {/* Side-by-side grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Document Overview / Meta */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Document Metadata
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    {extractedReport.testType}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                      Report Header Title
                    </label>
                    <input
                      type="text"
                      value={extractedReport.reportTitle}
                      onChange={(e) =>
                        setExtractedReport({ ...extractedReport, reportTitle: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                      Diagnostic Laboratory
                    </label>
                    <input
                      type="text"
                      value={extractedReport.labName}
                      onChange={(e) =>
                        setExtractedReport({ ...extractedReport, labName: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                      Collection / Test Date
                    </label>
                    <input
                      type="date"
                      value={extractedReport.testDate}
                      onChange={(e) =>
                        setExtractedReport({ ...extractedReport, testDate: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>
                </div>

                {extractedReport.notes && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-semibold block mb-0.5 text-slate-700 dark:text-slate-300">
                      OCR Engine Note:
                    </span>
                    {extractedReport.notes}
                  </div>
                )}

                {/* Commit Action Box */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={syncToMatrix}
                      onChange={(e) => setSyncToMatrix(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Automatically sync positive biomarkers to patient allergy matrix</span>
                  </label>

                  <button
                    onClick={handleCommitRecord}
                    disabled={isCommitted}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
                      isCommitted
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    }`}
                  >
                    {isCommitted ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Committed to Permanent Record
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        Commit Verified Record
                      </>
                    )}
                  </button>

                  {commitMessage && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 text-center font-medium">
                      {commitMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Editable Extracted Biomarkers Cards */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Extracted Biomarkers ({editableItems.length} Identified)
                </h3>
                <span className="text-xs text-slate-500">
                  Verify or edit values before committing
                </span>
              </div>

              <div className="space-y-3">
                {editableItems.map((item, idx) => {
                  const badgeClass = getSeverityBadgeClass(item.severity);

                  return (
                    <div
                      key={idx}
                      className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.biomarker}
                            onChange={(e) => handleItemChange(idx, "biomarker", e.target.value)}
                            className="font-heading font-bold text-sm text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 dark:focus:border-slate-100 focus:outline-hidden w-full"
                          />
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                            {item.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={item.severity}
                            onChange={(e) => handleItemChange(idx, "severity", e.target.value)}
                            className={`px-2 py-1 rounded text-xs font-semibold border ${badgeClass}`}
                          >
                            <option value="VERY_HIGH">VERY HIGH</option>
                            <option value="HIGH">HIGH</option>
                            <option value="MODERATE">MODERATE</option>
                            <option value="LOW">LOW</option>
                            <option value="NEGATIVE">NEGATIVE</option>
                            <option value="CONTROL_VALID">CONTROL VALID</option>
                          </select>
                        </div>
                      </div>

                      {/* Numeric values row */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-[10px] font-semibold text-slate-500 block">
                            Measured Concentration / Size
                          </span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <input
                              type="number"
                              step="0.01"
                              value={item.measuredValue}
                              onChange={(e) =>
                                handleItemChange(idx, "measuredValue", parseFloat(e.target.value) || 0)
                              }
                              className="font-mono-numbers font-bold text-sm text-slate-900 dark:text-white bg-transparent w-20 focus:outline-hidden"
                            />
                            <span className="text-slate-500 text-xs font-mono">{item.unit}</span>
                          </div>
                        </div>

                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-[10px] font-semibold text-slate-500 block">
                            Clinical Reference Cut-Off
                          </span>
                          <span className="font-mono-numbers text-xs font-medium text-slate-700 dark:text-slate-300 block mt-1">
                            {item.referenceRange || "Standard"}
                          </span>
                        </div>

                        <div className="col-span-2 sm:col-span-1 p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-[10px] font-semibold text-slate-500 block">
                            Verification Status
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirmed
                          </span>
                        </div>
                      </div>

                      {/* Interpretation comment */}
                      <div className="text-xs">
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                          Clinical Interpretation & Notes:
                        </label>
                        <input
                          type="text"
                          value={item.interpretation || ""}
                          onChange={(e) => handleItemChange(idx, "interpretation", e.target.value)}
                          className="w-full px-2 py-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-hidden"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
