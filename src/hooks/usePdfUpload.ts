"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadStatus } from "@/lib/types";
import { useTermsStore } from "@/store/termsStore";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export function usePdfUpload() {
  const [status, setStatus] = useState<UploadStatus>({ stage: "idle" });
  const setTerms = useTermsStore((s) => s.setTerms);
  const reset = useTermsStore((s) => s.reset);
  const router = useRouter();

  const upload = useCallback(
    async (file: File) => {
      // Validate
      if (file.type !== "application/pdf") {
        setStatus({ stage: "error", message: "請上載 PDF 檔案" });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setStatus({ stage: "error", message: "檔案太大，最多支援 25MB" });
        return;
      }

      reset();
      setStatus({ stage: "reading", fileName: file.name });

      try {
        // Read file as base64
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        setStatus({ stage: "extracting", fileName: file.name });

        // Call extraction API
        const response = await fetch("/api/extract-terms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfBase64: base64, fileName: file.name }),
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
          error instanceof Error ? error.message : "上載過程中發生錯誤";
        setStatus({ stage: "error", message });
      }
    },
    [reset, setTerms, router]
  );

  return { status, upload, setStatus };
}
