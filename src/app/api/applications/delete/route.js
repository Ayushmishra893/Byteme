import { NextResponse } from "next/server";
import { deleteApplication } from "@/backend/applications";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { appId } = await req.json();

    if (!appId) {
      return NextResponse.json(
        {
          success: false,
          error: "Application ID is required",
        },
        { status: 400 }
      );
    }

    await deleteApplication(appId);

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete Application Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}