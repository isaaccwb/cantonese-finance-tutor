"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTermsStore } from "@/store/termsStore";
import { TermGrid } from "@/components/terms/TermGrid";
import { CategoryFilter } from "@/components/terms/CategoryFilter";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function TermsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <TermsPageContent />
    </Suspense>
  );
}

function TermsPageContent() {
  const searchParams = useSearchParams();
  const docParam = searchParams.get("doc");

  const documentTitle = useTermsStore((s) => s.documentTitle);
  const documentSummary = useTermsStore((s) => s.documentSummary);
  const documentId = useTermsStore((s) => s.documentId);
  const terms = useTermsStore((s) => s.terms);
  const loadFromDb = useTermsStore((s) => s.loadFromDb);
  const getFilteredTerms = useTermsStore((s) => s.getFilteredTerms);
  const filteredTerms = getFilteredTerms();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load from DB if doc param is present and not already loaded
  useEffect(() => {
    if (docParam && docParam !== documentId) {
      setLoading(true);
      setError("");
      loadFromDb(docParam)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [docParam, documentId, loadFromDb]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-gray-500">載入緊歷史記錄...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <p className="mb-4 text-lg text-red-500">{error}</p>
        <Link
          href="/history"
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          返去歷史記錄
        </Link>
      </div>
    );
  }

  if (terms.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <p className="mb-4 text-lg text-gray-500">未有術語資料</p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            上載 PDF
          </Link>
          <Link
            href="/history"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            歷史記錄
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Document Info */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            首頁
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">術語列表</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {documentTitle || "術語列表"}
        </h1>
        {documentSummary && (
          <p className="mt-2 text-sm text-gray-500">{documentSummary}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          共搵到 {terms.length} 個專業術語
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <CategoryFilter />
      </div>

      {/* Terms Grid */}
      <TermGrid terms={filteredTerms} />
    </div>
  );
}
