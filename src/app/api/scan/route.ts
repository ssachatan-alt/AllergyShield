import { NextResponse } from "next/server";
import { scanWithGeminiVision } from "@/lib/gemini";
import { getPatientWithRelations, addScanHistoryEntry } from "@/lib/data-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      mimeType = "image/jpeg",
      customOcrText,
      userAllergies,
      apiKey,
      saveToHistory = true,
    } = body;

    // Use allergies passed directly from client (LocalStorage state)
    // or fallback to data-store if client didn't supply them
    let activeAllergies: Array<{ name: string; severity: string; category?: string }> = [];

    if (Array.isArray(userAllergies)) {
      activeAllergies = userAllergies;
    } else {
      const patient = await getPatientWithRelations();
      activeAllergies = (patient?.allergies || []).map((a: any) => ({
        name: a.name,
        severity: a.severity,
        category: a.category,
      }));
    }

    const result = await scanWithGeminiVision({
      imageBase64,
      mimeType,
      userAllergies: activeAllergies,
      apiKey,
      customText: customOcrText,
    });

    // Optionally save to scan history
    let savedScanId: string | null = null;
    if (saveToHistory) {
      savedScanId = await addScanHistoryEntry({
        productName: result.productName,
        brand: result.brand,
        verdict: result.status,
        hazardsDetected: result.matchedAllergens.map((h) => `${h.allergenName} (${h.triggerWord})`),
        cautionsDetected: result.advisoryWarning ? [result.advisoryWarning] : [],
        rawOcrText: result.rawOcrText,
        ingredientsList: result.detectedIngredients,
      });
    }

    return NextResponse.json({
      status: result.status,
      verdict: result.status,
      matchedAllergens: result.matchedAllergens,
      detectedIngredients: result.detectedIngredients,
      productName: result.productName,
      brand: result.brand,
      notes: result.notes,
      advisoryWarning: result.advisoryWarning,
      rawOcrText: result.rawOcrText,
      isLiveGemini: result.isLiveGemini,
      engineUsed: result.engineUsed,
      savedScanId,
    });
  } catch (error: any) {
    console.error("POST /api/scan error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process ingredient scan",
        status: "SAFE",
        matchedAllergens: [],
        detectedIngredients: [],
        notes: "Scan encountered an issue: " + (error.message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}
