import { NextResponse } from "next/server";
import { parseLabReportWithGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, apiKey, presetId } = body;

    const result = await parseLabReportWithGemini(
      imageBase64 || "",
      mimeType || "image/png",
      apiKey,
      presetId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/lab-reports/parse error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse lab report" },
      { status: 500 }
    );
  }
}
