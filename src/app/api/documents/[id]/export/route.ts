import { NextResponse } from "next/server";
import { exportTermsAsJson, exportTermsAsCsv, getDocument } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = getDocument(id);
    if (!doc) {
      return NextResponse.json({ error: "文件唔存在" }, { status: 404 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "json";

    if (format === "csv") {
      const csv = exportTermsAsCsv(id);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${doc.title}-terms.csv"`,
        },
      });
    }

    const data = exportTermsAsJson(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "匯出失敗" }, { status: 500 });
  }
}
