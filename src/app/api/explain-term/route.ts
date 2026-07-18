import { NextResponse } from "next/server";
import { chatCompletion } from "@/lib/ai";
import {
  EXPLAIN_TERM_SYSTEM_PROMPT,
  buildExplainTermUserMessage,
} from "@/lib/prompts";
import { extractJsonFromResponse } from "@/lib/pdf";
import { saveExplanation } from "@/lib/db";
import { ExtractedTerm, TermExplanation } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { term, documentContext } = (await request.json()) as {
      term: ExtractedTerm;
      documentContext: string;
    };

    if (!term) {
      return NextResponse.json(
        { error: "未收到術語資料" },
        { status: 400 }
      );
    }

    const responseText = await chatCompletion({
      system: EXPLAIN_TERM_SYSTEM_PROMPT,
      userMessage: buildExplainTermUserMessage(term, documentContext),
      maxTokens: 4096,
    });

    if (!responseText) {
      return NextResponse.json(
        { error: "AI 回傳咗空內容" },
        { status: 500 }
      );
    }

    const jsonStr = extractJsonFromResponse(responseText);
    const explanation: TermExplanation = JSON.parse(jsonStr);

    // Save to database
    saveExplanation(explanation);

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Explain term error:", error);
    const msg =
      error instanceof Error ? error.message : "解釋術語時發生錯誤";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
