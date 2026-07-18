"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { TermWithExplanation } from "@/lib/types";

export function TermCard({ term }: { term: TermWithExplanation }) {
  return (
    <Link
      href={`/terms/${term.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-amber-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-amber-600"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-amber-700 dark:text-gray-100 dark:group-hover:text-amber-400">
          {term.termEn}
        </h3>
        <Badge category={term.category} />
      </div>

      <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">{term.termZh}</p>

      <p className="line-clamp-2 text-xs text-gray-400 dark:text-gray-500">
        {term.contextSnippet}
      </p>

      {term.explanation && (
        <div className="mt-3 border-t border-gray-100 pt-2 dark:border-gray-800">
          <span className="text-xs text-green-600">✓ 已解釋</span>
        </div>
      )}
    </Link>
  );
}
