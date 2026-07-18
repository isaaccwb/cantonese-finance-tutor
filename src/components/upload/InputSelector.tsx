"use client";

import { useState } from "react";
import { PdfUploader } from "./PdfUploader";
import { TextInput } from "./TextInput";

type InputMode = "pdf" | "text";

export function InputSelector() {
  const [mode, setMode] = useState<InputMode>("pdf");

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-6 flex justify-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          onClick={() => setMode("pdf")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "pdf"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          📄 上載 PDF
        </button>
        <button
          onClick={() => setMode("text")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "text"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          ✏️ 貼文字
        </button>
      </div>

      {mode === "pdf" ? <PdfUploader /> : <TextInput />}
    </div>
  );
}
