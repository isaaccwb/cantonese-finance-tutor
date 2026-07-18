"use client";

import Link from "next/link";
import { InputSelector } from "@/components/upload/InputSelector";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          📖 粵語金融術語學堂
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          上載 PDF 或貼入文字，AI 幫你掃描所有專業術語
        </p>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          用最地道嘅廣東話，將高深金融概念講到你一聽就明
        </p>
        <Link
          href="/history"
          className="mt-4 inline-block rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
        >
          查看歷史記錄 →
        </Link>
      </div>

      <InputSelector />

      <div className="mt-16 grid max-w-2xl gap-6 sm:grid-cols-3">
        <div className="text-center">
          <div className="mb-2 text-3xl">📄</div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">輸入內容</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            PDF 或直接貼文字
          </p>
        </div>
        <div className="text-center">
          <div className="mb-2 text-3xl">🔍</div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI 掃描術語</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            自動搵出所有專業 terms
          </p>
        </div>
        <div className="text-center">
          <div className="mb-2 text-3xl">💬</div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">廣東話解釋</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            三層解釋法，包你明
          </p>
        </div>
      </div>
    </div>
  );
}
