import { TermCategory } from "@/lib/types";

const categoryColors: Record<TermCategory, string> = {
  統計學: "bg-blue-100 text-blue-800",
  計量經濟學: "bg-purple-100 text-purple-800",
  金融市場: "bg-green-100 text-green-800",
  風險管理: "bg-red-100 text-red-800",
  投資學: "bg-amber-100 text-amber-800",
  會計學: "bg-cyan-100 text-cyan-800",
  宏觀經濟: "bg-orange-100 text-orange-800",
  機器學習: "bg-indigo-100 text-indigo-800",
  其他: "bg-gray-100 text-gray-800",
};

export function Badge({ category }: { category: TermCategory }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColors[category] || "bg-gray-100 text-gray-800"}`}
    >
      {category}
    </span>
  );
}
