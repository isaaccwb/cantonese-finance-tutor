"use client";

import { TermCard } from "./TermCard";
import { TermWithExplanation } from "@/lib/types";

export function TermGrid({ terms }: { terms: TermWithExplanation[] }) {
  if (terms.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-500">未搵到符合條件嘅術語</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {terms.map((term) => (
        <TermCard key={term.id} term={term} />
      ))}
    </div>
  );
}
