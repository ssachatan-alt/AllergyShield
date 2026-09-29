import { NextResponse } from "next/server";
import {
  getPatientWithRelations,
  addPatientAllergy,
  updatePatientProfile,
  deletePatientAllergy,
} from "@/lib/data-store";

export async function GET() {
  try {
    const user = await getPatientWithRelations();
    return NextResponse.json(user);
  } catch (error: any) {
    console.error("GET /api/patient error:", error);
    return NextResponse.json({ error: error.message || "Failed to load patient" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, severity, reactionDetails, diagnosticType, diagnosedDate, synonyms } = body;

    const newAllergy = await addPatientAllergy({
      name,
      category: category || "FOOD",
      severity: severity || "MODERATE",
      reactionDetails: reactionDetails || "",
      diagnosticType: diagnosticType || "CLINICAL_HISTORY",
      diagnosedDate: diagnosedDate || new Date().toISOString().split("T")[0],
      synonyms: synonyms || [name],
    });

    return NextResponse.json(newAllergy, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/patient error:", error);
    return NextResponse.json({ error: error.message || "Failed to add allergy" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { profileData } = body;

    if (profileData) {
      const updated = await updatePatientProfile(profileData);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
  } catch (error: any) {
    console.error("PUT /api/patient error:", error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const allergyId = searchParams.get("id");

    if (!allergyId) {
      return NextResponse.json({ error: "Missing allergy id" }, { status: 400 });
    }

    await deletePatientAllergy(allergyId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/patient error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete allergy" }, { status: 500 });
  }
}
