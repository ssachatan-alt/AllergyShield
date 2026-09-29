"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  FileCheck,
  ShieldAlert,
  Info,
  Maximize2,
  Scan,
  BookmarkCheck,
  Layers,
  HelpCircle,
  Eye,
  Sliders,
} from "lucide-react";
import { SAMPLE_PRODUCTS_TO_SCAN } from "@/lib/sample-data";

interface LiveCameraScannerProps {
  onRefreshHistory: () => void;
  apiKey?: string;
  focusAllergen?: string | null;
}

export function LiveCameraScanner({
  onRefreshHistory,
  apiKey,
  focusAllergen,
}: LiveCameraScannerProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isSavedToHistory, setIsSavedToHistory] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showManualEditor, setShowManualEditor] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize or stop camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError("Camera API not supported in this browser environment. Use photo upload below.");
      }
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera access was denied. Please allow camera permissions or upload a package photo."
          : "Could not initialize video camera. Please use photo upload or sample presets."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture frame from webcam stream
  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    triggerScan(dataUrl);
  };

  // Handle uploaded photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setCapturedImage(dataUrl);
      setActivePresetId(null);
      triggerScan(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Run scan with preset sample product
  const handleSelectPreset = (presetId: string) => {
    setActivePresetId(presetId);
    stopCamera();
    const preset = SAMPLE_PRODUCTS_TO_SCAN.find((p) => p.id === presetId);
    if (preset) {
      setCapturedImage(null);
      setManualText(preset.rawIngredients);
      triggerScan(undefined, presetId);
    }
  };

  // Trigger backend scan & cross-match
  const triggerScan = async (imageBase64?: string, presetId?: string, customText?: string) => {
    setIsAnalyzing(true);
    setIsSavedToHistory(false);

    try {
      const payload: any = {
        apiKey,
        saveToHistory: true,
      };

      if (customText) {
        payload.customOcrText = customText;
      } else if (presetId) {
        payload.presetId = presetId;
      } else if (imageBase64) {
        payload.imageBase64 = imageBase64;
        payload.mimeType = "image/jpeg";
      } else if (manualText) {
        payload.customOcrText = manualText;
      }

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Ingredient scanning failed");
      const result = await res.json();
      setAnalysisResult(result);
      setIsSavedToHistory(true);
      onRefreshHistory();
    } catch (err: any) {
      console.error("Scan error:", err);
      alert("Error scanning product: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Live Camera & Photo Ingredient Safety Scanner
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Point your camera at any food, supplement, or cosmetic ingredient label.
              AllergyShield parses all text and cross-matches against your active allergy matrix and biochemical derivatives.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManualEditor(!showManualEditor)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              {showManualEditor ? "Hide Text Editor" : "Paste Ingredients Directly"}
            </button>
          </div>
        </div>

        {/* Preset Packages */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Instant Test Packages:
          </span>
          {SAMPLE_PRODUCTS_TO_SCAN.map((prod) => (
            <button
              key={prod.id}
              onClick={() => handleSelectPreset(prod.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                activePresetId === prod.id
                  ? "bg-slate-900 text-white dark:bg-emerald-600 border-slate-900 dark:border-emerald-600"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700"
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{prod.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Ingredient Text Input (Collapsible) */}
      {showManualEditor && (
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Paste or Type Product Ingredients:
            </span>
          </div>
          <textarea
            rows={3}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="e.g. INGREDIENTS: Whey protein isolate, organic almonds, cane sugar, sea salt. Contains Milk. May contain peanuts."
            className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
          <div className="flex justify-end">
            <button
              onClick={() => triggerScan(undefined, undefined, manualText)}
              disabled={!manualText.trim() || isAnalyzing}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold disabled:opacity-50"
            >
              Analyze Ingredients
            </button>
          </div>
        </div>
      )}

      {/* Viewfinder and Camera HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Viewfinder Camera View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg flex items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Viewfinder HUD Overlays */}
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                  {/* Top HUD status */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Optical Stream
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-slate-300">
                      1080p • AF ACTIVE
                    </span>
                  </div>

                  {/* Center Targeting Reticle */}
                  <div className="relative w-48 sm:w-64 h-32 sm:h-44 mx-auto rounded-xl border border-white/40 flex items-center justify-center">
                    {/* Corner Reticle Brackets */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                    {/* Laser Animated Scan Line */}
                    <div className="absolute inset-x-2 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-scan-line pointer-events-none" />

                    <span className="text-[11px] text-white/70 font-medium px-2 py-1 rounded bg-black/40 backdrop-blur-xs">
                      Align Ingredient Label
                    </span>
                  </div>

                  {/* Bottom HUD guidance */}
                  <div className="text-center">
                    <span className="text-[11px] text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-xs">
                      Hold still for optimal OCR character resolution
                    </span>
                  </div>
                </div>
              </>
            ) : capturedImage ? (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capturedImage}
                  alt="Captured ingredient label"
                  className="w-full h-full object-contain bg-slate-900"
                />
                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 text-white text-[10px] font-mono">
                  Captured Frame Ready
                </div>
              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-white text-base">
                    Camera Viewfinder Standby
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Start your device camera to scan packaging in real-time, or upload an ingredient photo.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold shadow-xs transition-all"
                >
                  <Camera className="w-4 h-4" />
                  Start Live Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={captureFrame}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all animate-pulse"
                  >
                    <Scan className="w-4 h-4" />
                    Capture & Scan Label
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Stop Camera
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Upload className="w-4 h-4" />
                Upload Photo Instead
              </button>
            </div>
          </div>

          {cameraError && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* Right: Instant Visual Verdict Drawer / Results Panel */}
        <div className="lg:col-span-5 space-y-4">
          {isAnalyzing && (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto" />
              <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Parsing Ingredients & Cross-Matching...
              </h4>
              <p className="text-xs text-slate-500 font-mono-numbers">
                Checking derivatives: casein, whey, albumin, arachis, gluten, soy lecithin...
              </p>
            </div>
          )}

          {!isAnalyzing && analysisResult && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
              {/* Verdict Header Badge */}
              {analysisResult.verdict === "HAZARD" && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 text-red-900 dark:text-red-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-red-600 text-white">
                      <Flame className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-heading font-bold text-base tracking-tight text-red-700 dark:text-red-400">
                        🔴 ALLERGEN HAZARD DETECTED
                      </h4>
                      <p className="text-xs text-red-600 dark:text-red-300 font-medium">
                        Product contains exact allergens or confirmed derivatives. DO NOT CONSUME.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {analysisResult.verdict === "CAUTION" && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-amber-600 text-white">
                      <AlertTriangle className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-heading font-bold text-base tracking-tight text-amber-800 dark:text-amber-300">
                        🟡 CAUTION: ADVISORY WARNING
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        Cross-contamination warning or ambiguous derivative detected on label.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {analysisResult.verdict === "SAFE" && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-emerald-600 text-white">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-heading font-bold text-base tracking-tight text-emerald-800 dark:text-emerald-300">
                        🟢 VERIFIED SAFE: NO KNOWN ALLERGENS
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        Clean verdict against all active patient allergies and biochemical derivatives.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Info & Saved Pill */}
              <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="font-heading font-bold text-sm text-slate-900 dark:text-white block">
                    {analysisResult.productName}
                  </span>
                  <span className="text-slate-500">{analysisResult.brand}</span>
                </div>
                {isSavedToHistory && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    Saved to History
                  </span>
                )}
              </div>

              {/* Matched Hazards List */}
              {analysisResult.matchedHazards && analysisResult.matchedHazards.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider block">
                    Confirmed Allergen Matches:
                  </span>
                  {analysisResult.matchedHazards.map((hazard: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-800 dark:text-red-300">
                          {hazard.allergenName} Trigger ({hazard.triggerWord})
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/60 font-semibold text-red-700 dark:text-red-300">
                          {hazard.severity} RISK
                        </span>
                      </div>
                      <p className="text-red-900/80 dark:text-red-300/80 text-[11px] leading-relaxed">
                        {hazard.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Caution Alerts List */}
              {analysisResult.cautionAlerts && analysisResult.cautionAlerts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    Advisory & Cross-Contamination Alerts:
                  </span>
                  {analysisResult.cautionAlerts.map((caution: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900 text-xs space-y-1"
                    >
                      <span className="font-bold text-amber-800 dark:text-amber-300 block">
                        &quot;{caution.context}&quot;
                      </span>
                      <p className="text-amber-900/80 dark:text-amber-300/80 text-[11px]">
                        {caution.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Parsed Ingredient Tokens Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Parsed Ingredient Breakdown ({analysisResult.parsedTokens?.length || 0} items):
                </span>
                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  {analysisResult.parsedTokens?.map((token: string, idx: number) => {
                    const isHazard = analysisResult.matchedHazards?.some((h: any) =>
                      token.toLowerCase().includes(h.triggerWord.toLowerCase())
                    );
                    const isCaution = analysisResult.cautionAlerts?.some((c: any) =>
                      token.toLowerCase().includes(c.triggerWord.toLowerCase())
                    );

                    let badgeColor = "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
                    if (isHazard) {
                      badgeColor = "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/60 dark:text-red-200 dark:border-red-700 font-bold";
                    } else if (isCaution) {
                      badgeColor = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700 font-semibold";
                    }

                    return (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded border ${badgeColor}`}
                      >
                        {token}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Raw OCR Text Toggle */}
              <details className="text-xs text-slate-500">
                <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 font-semibold">
                  Inspect Verbatim Label Text
                </summary>
                <p className="mt-2 p-2.5 rounded bg-slate-50 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {analysisResult.rawOcrText}
                </p>
              </details>
            </div>
          )}

          {!isAnalyzing && !analysisResult && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
                Ready for Ingredient Scan
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Align an ingredient panel within the camera reticle or choose one of the instant test packages above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
