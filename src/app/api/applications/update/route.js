import { NextResponse } from "next/server";
import { updateApplication } from "@/backend/applications";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { appId, updatedData } = await req.json();

    await updateApplication(appId, updatedData);

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}