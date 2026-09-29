import { NextResponse } from "next/server";
import { resetAllUserData, loadDemoUserData } from "@/lib/data-store";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === "LOAD_DEMO") {
      const demoData = await loadDemoUserData();
      return NextResponse.json({ success: true, data: demoData });
    }

    await resetAllUserData();
    return NextResponse.json({ success: true, message: "Profile and records reset to clean slate" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to reset" }, { status: 500 });
  }
}
