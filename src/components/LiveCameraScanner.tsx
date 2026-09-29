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
  ShieldAlert,
  Info,
  Scan,
  BookmarkCheck,
  Sliders,
  CameraOff,
  SwitchCamera,
  FileSearch,
} from "lucide-react";
import { AllergyItemData } from "./AllergyMatrix";

interface LiveCameraScannerProps {
  userAllergies: AllergyItemData[];
  onRefreshHistory: () => void;
  apiKey?: string;
  focusAllergen?: string | null;
}

export function LiveCameraScanner({
  userAllergies,
  onRefreshHistory,
  apiKey,
  focusAllergen,
}: LiveCameraScannerProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavedToHistory, setIsSavedToHistory] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showManualEditor, setShowManualEditor] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Start live webcam / mobile camera stream
  const startCamera = async (targetFacing: "environment" | "user" = facingMode) => {
    stopCamera();
    setCameraError(null);
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser. Please use photo upload instead.");
      }

      let stream: MediaStream;
      try {
        // Try requested facing mode (ideal for mobile rear camera)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (firstErr) {
        // Fallback to generic video stream (e.g. desktop webcam)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Explicitly call play() and catch potential autoplay browser policy blocks
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      let friendlyError = "Unable to access device camera.";

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        friendlyError =
          "Camera access permission was denied. Please allow camera permissions in your browser address bar or use the photo upload button below.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        friendlyError = "No camera hardware detected on this device. Please upload an image file.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        friendlyError = "Camera is already in use by another application. Please close other camera apps and retry.";
      }

      setCameraError(friendlyError);
      setCameraActive(false);
    }
  };

  // Toggle front and back camera on mobile
  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture frame from webcam into canvas and trigger scan
  const captureFrame = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not initialize image canvas context.");
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

      setCapturedImage(dataUrl);
      stopCamera();
      triggerScan(dataUrl);
    } catch (err: any) {
      setErrorMessage("Failed to capture frame: " + err.message);
    }
  };

  // Handle uploaded photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      setCapturedImage(dataUrl);
      stopCamera();
      triggerScan(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Main scan invocation
  const triggerScan = async (imageBase64?: string, customText?: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisResult(null);
    setIsSavedToHistory(false);

    try {
      const payload: any = {
        apiKey,
        userAllergies: userAllergies.map((a) => ({
          name: a.name,
          severity: a.severity,
          category: a.category,
        })),
        saveToHistory: true,
      };

      if (customText) {
        payload.customOcrText = customText;
      } else if (imageBase64) {
        payload.imageBase64 = imageBase64;
        payload.mimeType = "image/jpeg";
      } else if (manualText) {
        payload.customOcrText = manualText;
      } else {
        throw new Error("No image or ingredient text provided to scan.");
      }

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to process ingredient scan");
      }

      setAnalysisResult(result);
      setIsSavedToHistory(true);
      onRefreshHistory();
    } catch (err: any) {
      console.error("Scan pipeline error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during image processing.");
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
              Point your camera at food labels, beverages, or drug / medicine formulas.
              AllergyShield uses Gemini Vision to parse ingredients and compare them against your registered allergies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManualEditor(!showManualEditor)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              {showManualEditor ? "Hide Text Input" : "Paste Ingredients Directly"}
            </button>
          </div>
        </div>

        {/* Active Allergies Pill Reminder */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Active Protected Allergens ({userAllergies.length}):</span>
          {userAllergies.length > 0 ? (
            userAllergies.map((a) => (
              <span
                key={a.id}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 font-medium text-[11px]"
              >
                {a.name}
              </span>
            ))
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              No personal allergies added yet. Scanning will flag general FDA allergens.
            </span>
          )}
        </div>
      </div>

      {/* Manual Ingredient Text Input (Collapsible) */}
      {showManualEditor && (
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
            Type or Paste Ingredient / Medicine Formula:
          </span>
          <textarea
            rows={3}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="e.g. INGREDIENTS: Whey protein isolate, skim milk powder, almond flour, cane sugar, sea salt. Contains Milk, Almonds."
            className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
          <div className="flex justify-end">
            <button
              onClick={() => triggerScan(undefined, manualText)}
              disabled={!manualText.trim() || isAnalyzing}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold disabled:opacity-50"
            >
              Analyze Ingredients
            </button>
          </div>
        </div>
      )}

      {/* Viewfinder and Results Grid */}
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

                {/* Viewfinder Overlays */}
                <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
                  {/* Top HUD status */}
                  <div className="flex items-center justify-between pointer-events-auto">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Stream Active
                    </span>

                    <button
                      onClick={toggleFacingMode}
                      className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-1 backdrop-blur-xs transition-colors"
                      title="Switch Front/Rear Camera"
                    >
                      <SwitchCamera className="w-3.5 h-3.5" />
                      <span>{facingMode === "environment" ? "Rear" : "Front"}</span>
                    </button>
                  </div>

                  {/* Center Targeting Reticle */}
                  <div className="relative w-48 sm:w-64 h-32 sm:h-44 mx-auto rounded-xl border border-white/40 flex items-center justify-center">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                    <div className="absolute inset-x-2 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-scan-line pointer-events-none" />

                    <span className="text-[11px] text-white/80 font-medium px-2 py-0.5 rounded bg-black/50 backdrop-blur-xs">
                      Align Product Label
                    </span>
                  </div>

                  {/* Bottom HUD guidance */}
                  <div className="text-center">
                    <span className="text-[11px] text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-xs">
                      Hold steady and click &quot;Capture Frame&quot;
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
                <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-mono">
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
                    Camera Viewfinder Ready
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Start your device camera to scan packaging labels, or upload a photo from your gallery.
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
                  onClick={() => startCamera()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold shadow-xs transition-all"
                >
                  <Camera className="w-4 h-4" />
                  Start Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={captureFrame}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all animate-pulse"
                  >
                    <Scan className="w-4 h-4" />
                    Capture Frame & Scan
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Stop
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
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Upload className="w-4 h-4" />
                Upload Photo File
              </button>
            </div>
          </div>

          {/* Camera Permission / Hardware Error Banner */}
          {cameraError && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
              <CameraOff className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Camera Notice:</span>
                <p className="leading-relaxed">{cameraError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="font-bold text-amber-900 dark:text-amber-200 underline mt-1 block"
                >
                  Choose an image file instead →
                </button>
              </div>
            </div>
          )}

          {/* Scanning Pipeline Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <div>
                <span className="font-bold block">Scan Pipeline Error:</span>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Instant Visual Verdict Drawer / Results Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Scanning Spinner State */}
          {isAnalyzing && (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 text-center space-y-3 animate-in fade-in duration-200">
              <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto" />
              <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Analyzing with Gemini Vision...
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-mono-numbers">
                OCR extracting ingredient text & chemical compounds. Cross-matching against your active allergy matrix...
              </p>
            </div>
          )}

          {/* Dynamic Safety Verdict Card */}
          {!isAnalyzing && analysisResult && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
              {/* Verdict Header Banner */}
              {analysisResult.status === "HAZARD" && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 text-red-900 dark:text-red-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-full bg-red-600 text-white">
                      <Flame className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-heading font-bold text-base tracking-tight text-red-700 dark:text-red-400">
                        🔴 ALLERGEN HAZARD DETECTED
                      </h4>
                      <p className="text-xs text-red-600 dark:text-red-300 font-medium">
                        Contains direct allergen or known biochemical derivative. DO NOT INGEST.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {analysisResult.status === "CAUTION" && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-full bg-amber-600 text-white">
                      <AlertTriangle className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-heading font-bold text-base tracking-tight text-amber-800 dark:text-amber-300">
                        🟡 CAUTION: ADVISORY WARNING
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        Cross-contamination warning or shared equipment notice detected.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {analysisResult.status === "SAFE" && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-full bg-emerald-600 text-white">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="font-heading font-bold text-base tracking-tight text-emerald-800 dark:text-emerald-300">
                        🟢 VERIFIED SAFE: NO MATCHES
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        No allergens or derivatives matched against your active profile.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Info & Saved Pill */}
              <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="font-heading font-bold text-sm text-slate-900 dark:text-white block">
                    {analysisResult.productName || "Scanned Item"}
                  </span>
                  <span className="text-slate-500">{analysisResult.brand || "Packaging"}</span>
                </div>
                {isSavedToHistory && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    Saved to Log
                  </span>
                )}
              </div>

              {/* Clinical Notes Summary */}
              {analysisResult.notes && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Clinical Evaluation:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    {analysisResult.notes}
                  </p>
                </div>
              )}

              {/* Matched Allergens Detail Cards */}
              {analysisResult.matchedAllergens && analysisResult.matchedAllergens.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider block">
                    Triggered Allergen Matches ({analysisResult.matchedAllergens.length}):
                  </span>
                  {analysisResult.matchedAllergens.map((hazard: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-800 dark:text-red-300">
                          {hazard.allergenName} ({hazard.triggerWord})
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

              {/* Advisory Warning */}
              {analysisResult.advisoryWarning && (
                <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900 text-xs space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block">
                    Advisory / Cross-Contamination Statement:
                  </span>
                  <p className="text-amber-900/80 dark:text-amber-300/80 text-[11px]">
                    {analysisResult.advisoryWarning}
                  </p>
                </div>
              )}

              {/* Parsed Ingredients Pills */}
              {analysisResult.detectedIngredients && analysisResult.detectedIngredients.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Parsed Ingredients & Compounds ({analysisResult.detectedIngredients.length}):
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    {analysisResult.detectedIngredients.map((token: string, idx: number) => {
                      const isTrigger = analysisResult.matchedAllergens?.some((h: any) =>
                        token.toLowerCase().includes(h.triggerWord.toLowerCase())
                      );
                      return (
                        <span
                          key={idx}
                          className={`text-[10px] px-2 py-0.5 rounded border ${
                            isTrigger
                              ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/60 dark:text-red-200 font-bold"
                              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {token}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* OCR Engine attribution */}
              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span>{analysisResult.engineUsed || "Gemini Vision AI"}</span>
                {analysisResult.rawOcrText && (
                  <details className="cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    <summary>View Verbatim OCR</summary>
                    <p className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[9px] whitespace-pre-wrap">
                      {analysisResult.rawOcrText}
                    </p>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* Standby State */}
          {!isAnalyzing && !analysisResult && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
                Ready for Optical Scan
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Align the ingredient panel in the camera reticle, then tap &quot;Capture Frame & Scan&quot; or upload an image file.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
