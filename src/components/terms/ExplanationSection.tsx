interface ExplanationSectionProps {
  title: string;
  icon: string;
  content: string;
  variant?: "default" | "highlight" | "contrast";
}

export function ExplanationSection({
  title,
  icon,
  content,
  variant = "default",
}: ExplanationSectionProps) {
  if (!content) return null;

  const bgClasses = {
    default: "bg-white border-gray-200",
    highlight: "bg-amber-50 border-amber-300",
    contrast: "bg-blue-50 border-blue-200",
  };

  return (
    <div className={`rounded-xl border p-5 ${bgClasses[variant]}`}>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span>{icon}</span>
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
        {content}
      </p>
    </div>
  );
}
