"use client";

import Link from "next/link";
import { PdfUploader } from "@/components/upload/PdfUploader";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          📖 粵語金融術語學堂
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          上載一份 PDF，AI 幫你掃描所有專業術語
        </p>
        <p className="mt-1 text-sm text-gray-400">
          用最地道嘅廣東話，將高深金融概念講到你一聽就明
        </p>
        <Link
          href="/history"
          className="mt-4 inline-block rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
        >
          查看歷史記錄 →
        </Link>
      </div>

      <PdfUploader />

      <div className="mt-16 grid max-w-2xl gap-6 sm:grid-cols-3">
        <div className="text-center">
          <div className="mb-2 text-3xl">📄</div>
          <h3 className="text-sm font-semibold text-gray-700">上載 PDF</h3>
          <p className="mt-1 text-xs text-gray-500">
            論文、研報、教材都得
          </p>
        </div>
        <div className="text-center">
          <div className="mb-2 text-3xl">🔍</div>
          <h3 className="text-sm font-semibold text-gray-700">AI 掃描術語</h3>
          <p className="mt-1 text-xs text-gray-500">
            自動搵出所有專業 terms
          </p>
        </div>
        <div className="text-center">
          <div className="mb-2 text-3xl">💬</div>
          <h3 className="text-sm font-semibold text-gray-700">廣東話解釋</h3>
          <p className="mt-1 text-xs text-gray-500">
            三層解釋法，包你明
          </p>
        </div>
      </div>
    </div>
  );
}
