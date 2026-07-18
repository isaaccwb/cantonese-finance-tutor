"use client";

import Link from "next/link";
import { useTermsStore } from "@/store/termsStore";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  const terms = useTermsStore((s) => s.terms);
  const searchQuery = useTermsStore((s) => s.searchQuery);
  const setSearchQuery = useTermsStore((s) => s.setSearchQuery);
  const hasTerms = terms.length > 0;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            粵語金融術語學堂
          </h1>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {hasTerms && (
            <>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋術語..."
                className="hidden w-48 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 md:block"
              />
              <Link
                href="/terms"
                className="hidden text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 sm:inline-block"
              >
                術語列表 ({terms.length})
              </Link>
            </>
          )}
          <ThemeToggle />
          <Link
            href="/history"
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
          >
            歷史記錄
          </Link>
        </div>
      </div>
    </header>
  );
}
