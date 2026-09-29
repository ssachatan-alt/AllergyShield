import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await db.userProfile.findFirst();
    if (!user) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const logs = await db.progressionLog.findMany({
      where: { userId: user.id },
      orderBy: { eventDate: "desc" },
    });

    // Compute longitudinal stats
    const years = Array.from(new Set(logs.map((l) => l.year))).sort((a, b) => a - b);
    const yearCounts = years.map((y) => ({
      year: y,
      total: logs.filter((l) => l.year === y).length,
      severeOrLifeThreatening: logs.filter((l) => l.year === y && (l.severity === "SEVERE" || l.severity === "LIFE_THREATENING")).length,
    }));

    const seasonDistribution = {
      SPRING: logs.filter((l) => l.season === "SPRING").length,
      SUMMER: logs.filter((l) => l.season === "SUMMER").length,
      FALL: logs.filter((l) => l.season === "FALL").length,
      WINTER: logs.filter((l) => l.season === "WINTER").length,
    };

    return NextResponse.json({
      logs,
      analytics: {
        yearCounts,
        seasonDistribution,
        totalIncidents: logs.length,
      },
    });
  } catch (error: any) {
    console.error("GET /api/progression error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load progression logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      eventDate,
      season,
      year,
      allergenName,
      reactionType,
      severity,
      intervention,
      environmentalFactors,
      notes,
    } = body;

    const user = await db.userProfile.findFirst();
    if (!user) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const calculatedYear = year || (eventDate ? parseInt(eventDate.split("-")[0]) : new Date().getFullYear());

    const newLog = await db.progressionLog.create({
      data: {
        userId: user.id,
        eventDate: eventDate || new Date().toISOString().split("T")[0],
        season: season || "SPRING",
        year: calculatedYear,
        allergenName: allergenName || "Unknown allergen",
        reactionType: reactionType || "Allergic reaction",
        severity: severity || "MODERATE",
        intervention: intervention || "Rest and hydration",
        environmentalFactors: environmentalFactors || "",
        notes: notes || "",
      },
    });

    return NextResponse.json(newLog, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/progression error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create progression log" },
      { status: 500 }
    );
  }
}
