"use client";

import { useState } from "react";
import { useTextInput } from "@/hooks/useTextInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function TextInput() {
  const { status, submit, setStatus } = useTextInput();
  const [text, setText] = useState("");

  const isProcessing = status.stage === "extracting";
  const charCount = text.length;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-2xl border-2 border-gray-300 p-6 sm:p-8 transition-all focus-within:border-amber-500 dark:border-gray-600 dark:focus-within:border-amber-500">
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <LoadingSpinner size="lg" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                AI 掃描緊術語...
              </p>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                視乎文字長度，可能需要 10-30 秒
              </p>
            </div>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="將英文金融文字貼喺度...&#10;&#10;例如：The Federal Reserve's quantitative easing program involves large-scale asset purchases to inject liquidity into the financial system..."
              className="h-48 w-full resize-none bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none dark:text-gray-200 dark:placeholder-gray-500"
            />
            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {charCount > 0 ? `${charCount.toLocaleString()} 字元` : "最少 50 字元"}
              </span>
              <button
                onClick={() => submit(text)}
                disabled={charCount < 50}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                開始掃描術語
              </button>
            </div>
          </>
        )}
      </div>

      {status.stage === "error" && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-center dark:bg-red-950">
          <p className="text-sm text-red-700 dark:text-red-400">{status.message}</p>
          <button
            onClick={() => setStatus({ stage: "idle" })}
            className="mt-2 text-sm font-medium text-red-600 underline hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            再試一次
          </button>
        </div>
      )}
    </div>
  );
}
