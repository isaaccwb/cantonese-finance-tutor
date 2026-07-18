import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");
import { anthropic, MODEL } from "@/lib/anthropic";
import { EXTRACT_TERMS_SYSTEM_PROMPT } from "@/lib/prompts";
import { extractJsonFromResponse, repairTruncatedJson } from "@/lib/pdf";
import { saveDocument } from "@/lib/db";
import { ExtractTermsResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { pdfBase64, fileName } = await request.json();

    if (!pdfBase64) {
      return NextResponse.json(
        { error: "未收到 PDF 檔案" },
        { status: 400 }
      );
    }

    // Extract text from PDF using pdf-parse (avoids 100-page limit)
    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    console.log(
      `PDF parsed: ${pdfData.numpages} pages, ${pdfText.length} chars`
    );

    if (!pdfText.trim()) {
      return NextResponse.json(
        { error: "PDF 入面搵唔到文字內容，可能係掃描版 PDF" },
        { status: 400 }
      );
    }

    // Truncate if extremely long to stay within context limits
    const maxChars = 200000;
    const textToSend =
      pdfText.length > maxChars
        ? pdfText.slice(0, maxChars) + "\n\n[...文件太長，已截取前部分...]"
        : pdfText;

    // Use streaming API — AIX proxy always returns SSE format
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 16384,
      system: EXTRACT_TERMS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `以下係一份PDF文件（${fileName}）嘅全文內容，共 ${pdfData.numpages} 頁。請從入面搵出所有專業金融/技術/統計術語。以JSON格式回覆。\n\n---\n\n${textToSend}`,
        },
      ],
    });

    // Collect text manually from stream events
    let responseText = "";
    stream.on("text", (chunk) => {
      responseText += chunk;
    });

    await stream.finalMessage();

    console.log("Response length:", responseText.length);

    if (!responseText) {
      return NextResponse.json(
        { error: "Claude 回傳咗空內容" },
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
    saveDocument(docId, parsed, fileName, pdfData.numpages);

    return NextResponse.json({ ...parsed, documentId: docId });
  } catch (error: unknown) {
    console.error("Extract terms error:", error);

    let errorMsg = "提取術語時發生錯誤";
    if (error instanceof Error) {
      errorMsg = error.message;
      if (errorMsg.includes("401") || errorMsg.includes("auth")) {
        errorMsg =
          "API key 無效或已過期，請檢查 .env.local 入面嘅 ANTHROPIC_API_KEY";
      }
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
