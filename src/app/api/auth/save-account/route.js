import { NextResponse } from "next/server";
import { saveUserAccount } from "@/backend/userProfile";

export async function POST(request) {
  try {
    const { uid, displayName, email, photoURL } = await request.json();
    await saveUserAccount({ uid, displayName, email, photoURL });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("save-account error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}