import { NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
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

    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 4096,
      system: EXPLAIN_TERM_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildExplainTermUserMessage(term, documentContext),
        },
      ],
    });

    // Collect text manually from stream events
    let responseText = "";
    stream.on("text", (chunk) => {
      responseText += chunk;
    });

    await stream.finalMessage();

    if (!responseText) {
      return NextResponse.json(
        { error: "Claude 回傳咗空內容" },
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
