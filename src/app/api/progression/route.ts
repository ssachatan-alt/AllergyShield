import { NextResponse } from "next/server";
import { getProgressionLogsList, addProgressionLogEntry } from "@/lib/data-store";

export async function GET() {
  try {
    const logs = await getProgressionLogsList();

    const years = Array.from(new Set(logs.map((l: any) => l.year))).sort((a: any, b: any) => a - b);
    const yearCounts = years.map((y: any) => ({
      year: y,
      total: logs.filter((l: any) => l.year === y).length,
      severeOrLifeThreatening: logs.filter(
        (l: any) => l.year === y && (l.severity === "SEVERE" || l.severity === "LIFE_THREATENING")
      ).length,
    }));

    const seasonDistribution = {
      SPRING: logs.filter((l: any) => l.season === "SPRING").length,
      SUMMER: logs.filter((l: any) => l.season === "SUMMER").length,
      FALL: logs.filter((l: any) => l.season === "FALL").length,
      WINTER: logs.filter((l: any) => l.season === "WINTER").length,
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

    const calculatedYear =
      year || (eventDate ? parseInt(eventDate.split("-")[0]) : new Date().getFullYear());

    const newLog = await addProgressionLogEntry({
      eventDate: eventDate || new Date().toISOString().split("T")[0],
      season: season || "SPRING",
      year: calculatedYear,
      allergenName: allergenName || "Unknown allergen",
      reactionType: reactionType || "Allergic reaction",
      severity: severity || "MODERATE",
      intervention: intervention || "Rest and hydration",
      environmentalFactors: environmentalFactors || "",
      notes: notes || "",
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
