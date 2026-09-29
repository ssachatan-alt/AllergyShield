import { NextResponse } from "next/server";
import { getScanHistoryList, deleteScanHistoryEntry } from "@/lib/data-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const verdict = searchParams.get("verdict");

    const scans = await getScanHistoryList(verdict);
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

    await deleteScanHistoryEntry(scanId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/scans error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete scan" },
      { status: 500 }
    );
  }
}
