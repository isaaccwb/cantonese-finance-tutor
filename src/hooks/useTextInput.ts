"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadStatus } from "@/lib/types";
import { useTermsStore } from "@/store/termsStore";

export function useTextInput() {
  const [status, setStatus] = useState<UploadStatus>({ stage: "idle" });
  const setTerms = useTermsStore((s) => s.setTerms);
  const reset = useTermsStore((s) => s.reset);
  const router = useRouter();

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length < 50) {
        setStatus({ stage: "error", message: "文字太短，最少需要 50 個字元" });
        return;
      }
      if (trimmed.length > 200000) {
        setStatus({ stage: "error", message: "文字太長，最多支援 200,000 字元" });
        return;
      }

      reset();
      setStatus({ stage: "extracting", fileName: "貼入文字" });

      try {
        const response = await fetch("/api/extract-terms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText: trimmed }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "提取術語失敗");
        }

        const data = await response.json();
        setTerms(data);
        setStatus({ stage: "done", termCount: data.terms.length });
        router.push("/terms");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "處理過程中發生錯誤";
        setStatus({ stage: "error", message });
      }
    },
    [reset, setTerms, router]
  );

  return { status, submit, setStatus };
}
