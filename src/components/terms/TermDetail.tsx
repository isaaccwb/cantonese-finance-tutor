"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { ExplanationSection } from "./ExplanationSection";
import { useTermsStore } from "@/store/termsStore";
import { useExplainTerm } from "@/hooks/useTerms";

export function TermDetail({ termId }: { termId: string }) {
  const term = useTermsStore((s) => s.getTermById(termId));
  const { explain } = useExplainTerm();

  useEffect(() => {
    if (term && !term.explanation && !term.explanationLoading) {
      explain(term);
    }
  }, [term, explain]);

  if (!term) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-gray-500">術語未搵到</p>
      </div>
    );
  }

  const { explanation, explanationLoading, streamingText } = term;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Badge category={term.category} />
          {term.pageNumber && (
            <span className="text-xs text-gray-400">
              第 {term.pageNumber} 頁
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">{term.termEn}</h1>
        <p className="mt-1 text-xl text-gray-600 dark:text-gray-400">{term.termZh}</p>
        <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-500 italic dark:bg-gray-800 dark:text-gray-400">
          「{term.contextSnippet}」
        </p>
      </div>

      {/* Streaming view */}
      {explanationLoading && streamingText !== undefined && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">AI 老師講緊...</span>
          </div>
          <div className="min-h-[4rem] overflow-hidden">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {streamingText}
              <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse bg-amber-500" />
            </p>
          </div>
        </div>
      )}

      {/* Loading without stream (fallback) */}
      {explanationLoading && streamingText === undefined && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">AI 老師準備緊解釋...</p>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div className="flex flex-col gap-4">
          <ExplanationSection
            title="學術版"
            icon="🎓"
            content={explanation.academic}
          />

          <ExplanationSection
            title="人話版"
            icon="💬"
            content={explanation.plainCantonese}
          />

          <ExplanationSection
            title="喺研究入面代表"
            icon="🔬"
            content={explanation.researchContext}
          />

          {/* Conclusion Chain */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <span>🔗</span> 結論鏈
            </h3>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  結論句
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {explanation.conclusionChain.conclusion}
                </p>
              </div>
              <div className="flex justify-center text-gray-300 dark:text-gray-600">↓</div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  證據句
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {explanation.conclusionChain.evidence}
                </p>
              </div>
              <div className="flex justify-center text-gray-300 dark:text-gray-600">↓</div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                <p className="mb-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  翻譯句
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {explanation.conclusionChain.translation}
                </p>
              </div>
            </div>
          </div>

          {/* In Other Words */}
          <ExplanationSection
            title="即係話"
            icon="💡"
            content={explanation.inOtherWords}
            variant="highlight"
          />

          {/* Contrast */}
          {explanation.contrast && (
            <ExplanationSection
              title="對比"
              icon="⚖️"
              content={explanation.contrast}
              variant="contrast"
            />
          )}
        </div>
      )}
    </div>
  );
}
