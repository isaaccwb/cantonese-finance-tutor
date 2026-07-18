"use client";

import { useCallback, useRef, useState } from "react";
import { usePdfUpload } from "@/hooks/usePdfUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function PdfUploader() {
  const { status, upload, setStatus } = usePdfUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      upload(file);
    },
    [upload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const isProcessing =
    status.stage === "reading" || status.stage === "extracting";

  return (
    <div className="mx-auto w-full max-w-xl">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
          isDragOver
            ? "border-amber-500 bg-amber-50"
            : isProcessing
              ? "cursor-wait border-gray-300 bg-gray-50"
              : "border-gray-300 hover:border-amber-400 hover:bg-amber-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleInputChange}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                {status.stage === "reading" ? "讀取緊檔案..." : "AI 掃描緊術語..."}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {"fileName" in status ? status.fileName : ""}
              </p>
              {status.stage === "extracting" && (
                <p className="mt-2 text-xs text-gray-400">
                  視乎文件長度，可能需要 10-30 秒
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="text-5xl">📄</div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                將 PDF 拖入呢度
              </p>
              <p className="mt-1 text-sm text-gray-500">
                或者撳呢度揀檔案（最大 25MB）
              </p>
            </div>
          </div>
        )}
      </div>

      {status.stage === "error" && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-center">
          <p className="text-sm text-red-700">{status.message}</p>
          <button
            onClick={() => setStatus({ stage: "idle" })}
            className="mt-2 text-sm font-medium text-red-600 underline hover:text-red-700"
          >
            再試一次
          </button>
        </div>
      )}
    </div>
  );
}
