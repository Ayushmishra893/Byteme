import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { saveInterviewQuestions } from "@/backend/applications";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateWithRetry(prompt, retries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
    } catch (err) {
      const isOverloaded =
        err.message?.includes("UNAVAILABLE") ||
        err.message?.includes("503");

      if (isOverloaded && attempt < retries) {
        console.warn(
          `Gemini overloaded, retrying (${attempt}/${retries})...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * attempt)
        );

        continue;
      }

      throw err;
    }
  }
}

export async function POST(req) {
  try {
    const {
      appId,
      resumeText,
      jobDescription,
      company,
    } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "resumeText and jobDescription are required",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert technical interviewer.

Using the resume and job description below, generate interview questions.

Return ONLY valid JSON.

{
  "technical": [""],
  "hr": [""],
  "project": [""],
  "coding": [""]
}

Requirements:

Generate:
- 5 Technical Questions
- 3 HR Questions
- 3 Project Questions
- 2 Coding Questions

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const result = await generateWithRetry(prompt);

    let text = result.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let questions;

    try {
      questions = JSON.parse(text);
    } catch (err) {
      console.error("JSON Parse Error:", text);

      return NextResponse.json({
        success: false,
        error: "AI returned invalid JSON",
        raw: text,
      });
    }

    if (appId) {
      await saveInterviewQuestions(appId, questions);
    }

    return NextResponse.json({
      success: true,
      company,
      questions,
      savedToFirestore: !!appId,
    });
  } catch (err) {
    console.error("Interview Question Error:", err);

    const isOverloaded =
      err.message?.includes("UNAVAILABLE") ||
      err.message?.includes("503");

    return NextResponse.json(
      {
        success: false,
        error: isOverloaded
          ? "AI model is currently overloaded. Please try again."
          : err.message,
      },
      {
        status: isOverloaded ? 503 : 500,
      }
    );
  }
}