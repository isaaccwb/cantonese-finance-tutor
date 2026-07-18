"use client";

import { useCallback, useRef } from "react";
import { useTermsStore } from "@/store/termsStore";
import { ExtractedTerm } from "@/lib/types";

export function useExplainTerm() {
  const setExplanationLoading = useTermsStore((s) => s.setExplanationLoading);
  const setExplanation = useTermsStore((s) => s.setExplanation);
  const setStreamingText = useTermsStore((s) => s.setStreamingText);
  const clearStreamingText = useTermsStore((s) => s.clearStreamingText);
  const documentSummary = useTermsStore((s) => s.documentSummary);
  const rafRef = useRef<number>(0);

  const explain = useCallback(
    async (term: ExtractedTerm) => {
      setExplanationLoading(term.id, true);
      setStreamingText(term.id, "");

      try {
        const response = await fetch("/api/explain-term", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            term,
            documentContext: documentSummary,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "解釋術語失敗");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Stream 唔可用");

        const decoder = new TextDecoder();
        let accumulated = "";
        let pending = false;

        const flushToStore = () => {
          pending = false;
          setStreamingText(term.id, accumulated);
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);

            try {
              const data = JSON.parse(payload);

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.done) {
                cancelAnimationFrame(rafRef.current);
                if (data.explanation) {
                  setExplanation(term.id, data.explanation);
                }
                clearStreamingText(term.id);
                return;
              }

              if (data.text) {
                accumulated += data.text;
                if (!pending) {
                  pending = true;
                  rafRef.current = requestAnimationFrame(flushToStore);
                }
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }

        // Final flush
        cancelAnimationFrame(rafRef.current);
        setStreamingText(term.id, accumulated);
        clearStreamingText(term.id);
        setExplanationLoading(term.id, false);
      } catch (error) {
        console.error("Explain term error:", error);
        cancelAnimationFrame(rafRef.current);
        clearStreamingText(term.id);
        setExplanationLoading(term.id, false);
      }
    },
    [documentSummary, setExplanation, setExplanationLoading, setStreamingText, clearStreamingText]
  );

  return { explain };
}
