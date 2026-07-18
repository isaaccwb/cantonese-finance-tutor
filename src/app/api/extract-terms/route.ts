import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");
import { chatCompletion } from "@/lib/ai";
import { EXTRACT_TERMS_SYSTEM_PROMPT } from "@/lib/prompts";
import { extractJsonFromResponse, repairTruncatedJson } from "@/lib/pdf";
import { saveDocument } from "@/lib/db";
import { ExtractTermsResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { pdfBase64, fileName, rawText } = await request.json();

    let textToSend: string;
    let docLabel: string;
    let pageCount: number | null = null;

    if (rawText) {
      // Text input mode
      if (rawText.trim().length < 50) {
        return NextResponse.json(
          { error: "文字太短，最少需要 50 個字元" },
          { status: 400 }
        );
      }
      const maxChars = 200000;
      textToSend =
        rawText.length > maxChars
          ? rawText.slice(0, maxChars) + "\n\n[...文字太長，已截取前部分...]"
          : rawText;
      docLabel = fileName || "貼入文字";
      console.log(`Text input: ${textToSend.length} chars`);
    } else if (pdfBase64) {
      // PDF mode
      const pdfBuffer = Buffer.from(pdfBase64, "base64");
      const pdfData = await pdfParse(pdfBuffer);
      const pdfText = pdfData.text;
      pageCount = pdfData.numpages;

      console.log(
        `PDF parsed: ${pdfData.numpages} pages, ${pdfText.length} chars`
      );

      if (!pdfText.trim()) {
        return NextResponse.json(
          { error: "PDF 入面搵唔到文字內容，可能係掃描版 PDF" },
          { status: 400 }
        );
      }

      const maxChars = 200000;
      textToSend =
        pdfText.length > maxChars
          ? pdfText.slice(0, maxChars) + "\n\n[...文件太長，已截取前部分...]"
          : pdfText;
      docLabel = fileName || "unknown.pdf";
    } else {
      return NextResponse.json(
        { error: "未收到 PDF 檔案或文字內容" },
        { status: 400 }
      );
    }

    const sourceDesc = pageCount
      ? `以下係一份PDF文件（${docLabel}）嘅全文內容，共 ${pageCount} 頁。請從入面搵出所有專業金融/技術/統計術語。以JSON格式回覆。`
      : `以下係一段金融相關文字。請從入面搵出所有專業金融/技術/統計術語。以JSON格式回覆。`;

    const responseText = await chatCompletion({
      system: EXTRACT_TERMS_SYSTEM_PROMPT,
      userMessage: `${sourceDesc}\n\n---\n\n${textToSend}`,
      maxTokens: 16384,
    });

    console.log("Response length:", responseText.length);

    if (!responseText) {
      return NextResponse.json(
        { error: "AI 回傳咗空內容" },
        { status: 500 }
      );
    }

    const jsonStr = extractJsonFromResponse(responseText);

    let parsed: ExtractTermsResponse;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const repaired = repairTruncatedJson(jsonStr);
      parsed = JSON.parse(repaired);
    }

    // Save to database
    const docId = `doc-${Date.now()}`;
    saveDocument(docId, parsed, docLabel, pageCount ?? undefined);

    return NextResponse.json({ ...parsed, documentId: docId });
  } catch (error: unknown) {
    console.error("Extract terms error:", error);

    let errorMsg = "提取術語時發生錯誤";
    if (error instanceof Error) {
      errorMsg = error.message;
      if (errorMsg.includes("401") || errorMsg.includes("auth")) {
        errorMsg =
          "API key 無效或已過期，請檢查 .env.local 入面嘅 API key 設定";
      }
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
