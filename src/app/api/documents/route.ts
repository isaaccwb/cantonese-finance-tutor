import { NextResponse } from "next/server";
import { listDocuments } from "@/lib/db";

export async function GET() {
  try {
    const documents = listDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("List documents error:", error);
    return NextResponse.json(
      { error: "載入歷史記錄失敗" },
      { status: 500 }
    );
  }
}
