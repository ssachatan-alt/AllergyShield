import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const verdict = searchParams.get("verdict");

    const user = await db.userProfile.findFirst();
    if (!user) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const where: any = { userId: user.id };
    if (verdict && verdict !== "ALL") {
      where.verdict = verdict;
    }

    const scans = await db.scanHistory.findMany({
      where,
      orderBy: { scannedAt: "desc" },
    });

    return NextResponse.json(scans);
  } catch (error: any) {
    console.error("GET /api/scans error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load scan history" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const scanId = searchParams.get("id");

    if (!scanId) {
      return NextResponse.json({ error: "Missing scan id" }, { status: 400 });
    }

    await db.scanHistory.delete({
      where: { id: scanId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/scans error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete scan" },
      { status: 500 }
    );
  }
}
