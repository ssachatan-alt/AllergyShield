import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey } = body;

    const keyToTest = apiKey || process.env.GEMINI_API_KEY;

    if (!keyToTest || keyToTest.trim() === "") {
      return NextResponse.json({
        valid: false,
        mode: "SIMULATED_CLINICAL_ENGINE",
        message: "No API key provided. AllergyShield will run in high-accuracy offline Clinical Mode.",
      });
    }

    // Ping Gemini to verify key
    try {
      const client = new GoogleGenAI({ apiKey: keyToTest.trim() });
      const test = await client.interactions.create({
        model: "gemini-3.8-flash",
        input: "Reply with the single word: OK",
      });

      return NextResponse.json({
        valid: true,
        mode: "LIVE_GEMINI_VISION",
        model: "gemini-3.8-flash",
        message: "Gemini 3.8 Flash Vision Connected successfully.",
        sampleResponse: test.output_text?.trim(),
      });
    } catch (testError: any) {
      return NextResponse.json({
        valid: false,
        mode: "SIMULATED_CLINICAL_ENGINE",
        error: testError.message || "Failed to authenticate with Gemini API",
        message: "Authentication failed. AllergyShield will fall back to local Clinical Engine.",
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
