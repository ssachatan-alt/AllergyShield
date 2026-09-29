import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await db.userProfile.findFirst({
      include: {
        allergies: {
          orderBy: { severity: "desc" },
        },
        progressionLogs: {
          orderBy: { eventDate: "desc" },
        },
        scans: {
          orderBy: { scannedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No patient profile found" }, { status: 404 });
    }

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

    const user = await db.userProfile.findFirst();
    if (!user) {
      return NextResponse.json({ error: "No patient profile found" }, { status: 404 });
    }

    const newAllergy = await db.allergyItem.create({
      data: {
        userId: user.id,
        name,
        category: category || "FOOD",
        severity: severity || "MODERATE",
        reactionDetails: reactionDetails || "",
        diagnosticType: diagnosticType || "CLINICAL_HISTORY",
        diagnosedDate: diagnosedDate || new Date().toISOString().split("T")[0],
        synonyms: synonyms ? JSON.stringify(synonyms) : JSON.stringify([name]),
        isVerified: true,
      },
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
    const { allergyId, profileData, allergyData } = body;

    if (profileData) {
      const user = await db.userProfile.findFirst();
      if (!user) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      const updated = await db.userProfile.update({
        where: { id: user.id },
        data: profileData,
      });
      return NextResponse.json(updated);
    }

    if (allergyId && allergyData) {
      const updatedAllergy = await db.allergyItem.update({
        where: { id: allergyId },
        data: {
          ...allergyData,
          synonyms: allergyData.synonyms ? JSON.stringify(allergyData.synonyms) : undefined,
        },
      });
      return NextResponse.json(updatedAllergy);
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

    await db.allergyItem.delete({
      where: { id: allergyId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/patient error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete allergy" }, { status: 500 });
  }
}
