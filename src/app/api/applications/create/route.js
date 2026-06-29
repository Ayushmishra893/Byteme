import { NextResponse } from "next/server";
import { addApplication } from "@/backend/applications";

export async function POST(request) {
  try {
    const { uid, company, jobDescription } = await request.json();

    if (!uid || !company || !jobDescription) {
      return NextResponse.json(
        { success: false, error: "uid, company, and jobDescription are required" },
        { status: 400 }
      );
    }

    const appId = await addApplication(uid, { company, jobDescription });

    return NextResponse.json({ success: true, appId });
  } catch (err) {
    console.error("create-application error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}