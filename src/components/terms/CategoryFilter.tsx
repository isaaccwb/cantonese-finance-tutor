"use client";

import { TermCategory } from "@/lib/types";
import { useTermsStore } from "@/store/termsStore";

const ALL_CATEGORIES: (TermCategory | "全部")[] = [
  "全部",
  "統計學",
  "計量經濟學",
  "金融市場",
  "風險管理",
  "投資學",
  "會計學",
  "宏觀經濟",
  "機器學習",
  "其他",
];

export function CategoryFilter() {
  const activeCategory = useTermsStore((s) => s.activeCategory);
  const setActiveCategory = useTermsStore((s) => s.setActiveCategory);
  const terms = useTermsStore((s) => s.terms);

  // Only show categories that have terms
  const categoriesWithCounts = ALL_CATEGORIES.map((cat) => ({
    category: cat,
    count:
      cat === "全部"
        ? terms.length
        : terms.filter((t) => t.category === cat).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="flex flex-wrap gap-2">
      {categoriesWithCounts.map(({ category, count }) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activeCategory === category
              ? "bg-amber-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {category} ({count})
        </button>
      ))}
    </div>
  );
}
