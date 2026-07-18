import { NextResponse } from "next/server";
import {
  getDocument,
  getTermsByDocument,
  renameDocument,
  deleteDocument,
} from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = getDocument(id);
    if (!doc) {
      return NextResponse.json({ error: "文件唔存在" }, { status: 404 });
    }
    const terms = getTermsByDocument(id);
    return NextResponse.json({
      documentId: doc.id,
      documentTitle: doc.title,
      documentSummary: doc.summary,
      terms,
    });
  } catch (error) {
    console.error("Get document error:", error);
    return NextResponse.json({ error: "載入文件失敗" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: "請提供新標題" }, { status: 400 });
    }
    renameDocument(id, title);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Rename document error:", error);
    return NextResponse.json({ error: "改名失敗" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
  }
}
