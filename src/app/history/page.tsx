"use client";

import Link from "next/link";
import { DocumentList } from "@/components/history/DocumentList";

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              首頁
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">歷史記錄</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">歷史記錄</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            管理之前上載過嘅 PDF 同術語結果
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          上載新 PDF
        </Link>
      </div>

      <DocumentList />
    </div>
  );
}
