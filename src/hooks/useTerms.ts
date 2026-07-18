"use client";

import { useCallback } from "react";
import { useTermsStore } from "@/store/termsStore";
import { ExtractedTerm } from "@/lib/types";

export function useExplainTerm() {
  const setExplanationLoading = useTermsStore((s) => s.setExplanationLoading);
  const setExplanation = useTermsStore((s) => s.setExplanation);
  const documentSummary = useTermsStore((s) => s.documentSummary);

  const explain = useCallback(
    async (term: ExtractedTerm) => {
      setExplanationLoading(term.id, true);

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

        const data = await response.json();
        setExplanation(term.id, data.explanation);
      } catch (error) {
        console.error("Explain term error:", error);
        setExplanationLoading(term.id, false);
      }
    },
    [documentSummary, setExplanation, setExplanationLoading]
  );

  return { explain };
}
