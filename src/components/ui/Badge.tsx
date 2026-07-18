import { TermCategory } from "@/lib/types";

const categoryColors: Record<TermCategory, string> = {
  統計學: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  計量經濟學: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  金融市場: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  風險管理: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  投資學: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  會計學: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  宏觀經濟: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  機器學習: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  其他: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export function Badge({ category }: { category: TermCategory }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}
    >
      {category}
    </span>
  );
}
