import { NextResponse } from "next/server";
import { parseProductPackagingWithGemini } from "@/lib/gemini";
import { analyzeIngredients } from "@/lib/allergy-dictionary";
import { getPatientWithRelations, addScanHistoryEntry } from "@/lib/data-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      mimeType,
      customOcrText,
      productName,
      brand,
      apiKey,
      presetId,
      saveToHistory = true,
    } = body;

    const user = await getPatientWithRelations();

    let ocrText = customOcrText || "";
    let detectedProductName = productName || "Scanned Product";
    let detectedBrand = brand || "Consumer Packaged Goods";
    let parsedIngredients: string[] = [];
    let isSimulated = false;

    // If an image is provided and no custom OCR text, extract via Gemini Vision OCR
    if (imageBase64 || presetId) {
      const ocrResult = await parseProductPackagingWithGemini(
        imageBase64 || "",
        mimeType || "image/jpeg",
        apiKey,
        presetId
      );
      ocrText = ocrText || ocrResult.ocrText;
      detectedProductName =
        detectedProductName === "Scanned Product" ? ocrResult.productName : detectedProductName;
      detectedBrand =
        detectedBrand === "Consumer Packaged Goods" ? ocrResult.brand : detectedBrand;
      parsedIngredients = ocrResult.ingredientsList;
      isSimulated = ocrResult.isSimulated;
    }

    // Cross-match against patient's active allergies
    const analysis = analyzeIngredients(
      ocrText,
      (user?.allergies || []).map((a: any) => ({
        name: a.name,
        severity: a.severity,
        category: a.category,
      }))
    );

    // Save to user's scan history if requested
    let savedScanId: string | null = null;
    if (saveToHistory) {
      savedScanId = await addScanHistoryEntry({
        productName: detectedProductName,
        brand: detectedBrand,
        verdict: analysis.status,
        hazardsDetected: analysis.matchedHazards.map((h) => `${h.allergenName} (${h.triggerWord})`),
        cautionsDetected: analysis.cautionAlerts.map((c) => c.context),
        rawOcrText: ocrText,
        ingredientsList: analysis.parsedTokens,
      });
    }

    return NextResponse.json({
      verdict: analysis.status,
      productName: detectedProductName,
      brand: detectedBrand,
      matchedHazards: analysis.matchedHazards,
      cautionAlerts: analysis.cautionAlerts,
      parsedTokens: analysis.parsedTokens,
      safeIngredients: analysis.safeIngredients,
      rawOcrText: ocrText,
      isSimulated,
      savedScanId,
    });
  } catch (error: any) {
    console.error("POST /api/scan error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process ingredient scan" },
      { status: 500 }
    );
  }
}
