import { chatCompletionStream } from "@/lib/ai";
import {
  EXPLAIN_TERM_SYSTEM_PROMPT,
  buildExplainTermUserMessage,
} from "@/lib/prompts";
import { extractJsonFromResponse } from "@/lib/pdf";
import { saveExplanation } from "@/lib/db";
import { ExtractedTerm, TermExplanation } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { term, documentContext } = (await request.json()) as {
      term: ExtractedTerm;
      documentContext: string;
    };

    if (!term) {
      return new Response(
        JSON.stringify({ error: "未收到術語資料" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Stream in the background — don't await
    (async () => {
      let fullText = "";
      try {
        const gen = chatCompletionStream({
          system: EXPLAIN_TERM_SYSTEM_PROMPT,
          userMessage: buildExplainTermUserMessage(term, documentContext),
          maxTokens: 4096,
        });

        for await (const chunk of gen) {
          fullText += chunk;
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
          );
        }

        // Parse and save to DB
        try {
          const jsonStr = extractJsonFromResponse(fullText);
          const explanation: TermExplanation = JSON.parse(jsonStr);
          saveExplanation(explanation);
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, explanation })}\n\n`
            )
          );
        } catch {
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, raw: fullText })}\n\n`
            )
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stream error";
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Explain term error:", error);
    const msg =
      error instanceof Error ? error.message : "解釋術語時發生錯誤";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
