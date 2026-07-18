import { NextResponse } from "next/server";
import { mergeDocuments } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { documentIds, title } = (await request.json()) as {
      documentIds: string[];
      title: string;
    };

    if (!documentIds || documentIds.length < 2) {
      return NextResponse.json(
        { error: "請選擇至少兩份文件進行合併" },
        { status: 400 }
      );
    }

    const newId = mergeDocuments(documentIds, title || "合併文件");
    return NextResponse.json({ documentId: newId });
  } catch (error) {
    console.error("Merge error:", error);
    return NextResponse.json({ error: "合併失敗" }, { status: 500 });
  }
}
