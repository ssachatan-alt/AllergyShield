import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportTitle, labName, testDate, testType, items, syncToAllergyMatrix } = body;

    const user = await db.userProfile.findFirst();
    if (!user) {
      return NextResponse.json({ error: "No patient profile found" }, { status: 404 });
    }

    // 1. Create the persistent lab report record
    const labReport = await db.labReport.create({
      data: {
        userId: user.id,
        reportTitle: reportTitle || "Diagnostic Allergy Panel",
        labName: labName || "Clinical Immunology Lab",
        testDate: testDate || new Date().toISOString().split("T")[0],
        testType: testType || "BLOOD_IGE",
        status: "COMMITTED",
        rawExtractedJson: JSON.stringify(items),
        extractedItems: {
          create: items.map((item: any) => ({
            biomarker: item.biomarker,
            category: item.category || "FOOD",
            measuredValue: typeof item.measuredValue === "number" ? item.measuredValue : parseFloat(item.measuredValue) || 0,
            unit: item.unit || "kU/L",
            referenceRange: item.referenceRange || "",
            severity: item.severity || "MODERATE",
            interpretation: item.interpretation || "",
            isVerified: true,
          })),
        },
      },
      include: {
        extractedItems: true,
      },
    });

    // 2. Optionally sync positive/high items to the patient's active allergy matrix
    let syncedCount = 0;
    if (syncToAllergyMatrix && Array.isArray(items)) {
      for (const item of items) {
        // Skip controls or negative findings
        if (item.category === "CONTROL" || item.severity === "NEGATIVE") continue;

        // Map severity from lab findings to clinical allergy risk
        let clinicalSeverity = "MODERATE";
        if (item.severity === "VERY_HIGH") clinicalSeverity = "ANAPHYLACTIC";
        else if (item.severity === "HIGH") clinicalSeverity = "HIGH";
        else if (item.severity === "LOW") clinicalSeverity = "MILD";

        // Check if an existing allergy with similar name exists
        const existing = await db.allergyItem.findFirst({
          where: {
            userId: user.id,
            name: {
              contains: item.biomarker.split(" ")[0],
            },
          },
        });

        if (existing) {
          // Update diagnostic type and verified state
          await db.allergyItem.update({
            where: { id: existing.id },
            data: {
              severity: clinicalSeverity,
              diagnosticType: testType || "IGE_BLOOD",
              reactionDetails: `${existing.reactionDetails || ""}\n[Lab Update ${testDate}]: ${item.biomarker} measured at ${item.measuredValue} ${item.unit} (${item.severity})`.trim(),
              isVerified: true,
            },
          });
          syncedCount++;
        } else {
          // Add new allergy item
          await db.allergyItem.create({
            data: {
              userId: user.id,
              name: item.biomarker,
              category: item.category || "FOOD",
              severity: clinicalSeverity,
              diagnosedDate: testDate || new Date().toISOString().split("T")[0],
              diagnosticType: testType || "IGE_BLOOD",
              reactionDetails: `Lab verified: ${item.biomarker} at ${item.measuredValue} ${item.unit}. ${item.interpretation || ""}`.trim(),
              synonyms: JSON.stringify([item.biomarker.split("(")[0].trim()]),
              isVerified: true,
            },
          });
          syncedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      labReport,
      syncedCount,
    });
  } catch (error: any) {
    console.error("POST /api/lab-reports/commit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to commit lab report" },
      { status: 500 }
    );
  }
}
