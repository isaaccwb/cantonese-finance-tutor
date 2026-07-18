"use client";

import { use } from "react";
import Link from "next/link";
import { TermDetail } from "@/components/terms/TermDetail";

export default function TermDetailPage({
  params,
}: {
  params: Promise<{ termId: string }>;
}) {
  const { termId } = use(params);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
          首頁
        </Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <Link
          href="/terms"
          className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          術語列表
        </Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">詳情</span>
      </div>

      <TermDetail termId={termId} />
    </div>
  );
}
