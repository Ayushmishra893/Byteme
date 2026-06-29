import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { saveAIAnalysis } from "@/backend/applications";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Retry wrapper — handles temporary 503 "model overloaded" errors
async function generateWithRetry(prompt, retries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
    } catch (err) {
      const isOverloaded =
        err.message?.includes("UNAVAILABLE") || err.message?.includes("503");
      if (isOverloaded && attempt < retries) {
        console.warn(`Gemini overloaded, retrying (${attempt}/${retries})...`);
        await new Promise((res) => setTimeout(res, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
}

export async function POST(req) {
  try {
    const { uid, appId, resumeText, jobDescription, company } =
      await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { success: false, error: "resumeText and jobDescription are required" },
        { status: 400 },
      );
    }

    const prompt = `
You are an expert ATS resume analyzer.

CRITICAL RULES:
- Return ONLY valid JSON
- No explanation
- No markdown
- No extra text

Format:
{
  "score": number,
  "matchedSkills": string[],
  "missingSkills": string[],
  "suggestions": string[]
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const result = await generateWithRetry(prompt);

    let text = result.text || "";
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (err) {
      console.error("JSON PARSE ERROR:", text);
      return NextResponse.json({
        success: true,
        warning: "AI returned non-JSON output",
        raw: text,
      });
    }

    if (appId) {
      await saveAIAnalysis(appId, analysis);
    } else {
      console.warn("No appId provided — analysis was not saved to Firestore");
    }

    return NextResponse.json({
      success: true,
      company,
      analysis,
      savedToFirestore: !!appId,
    });
  } catch (err) {
    console.error("Resume Match Error:", err);

    const isOverloaded =
      err.message?.includes("UNAVAILABLE") || err.message?.includes("503");

    return NextResponse.json(
      {
        success: false,
        error: isOverloaded
          ? "AI model is currently overloaded. Please try again in a moment."
          : err.message,
      },
      { status: isOverloaded ? 503 : 500 },
    );
  }
}
