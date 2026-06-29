// V17: Badge de progresso para uma aula (usado em listas)
interface Props {
  progressPct?: number;
  completed?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function LessonProgressBadge({ progressPct = 0, completed = false, size = "sm", className = "" }: Props) {
  if (completed) {
    return (
      <span
        aria-label="Aula concluída"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ${size === "sm" ? "text-[10px]" : "text-xs"} font-semibold ${className}`}
      >
        ✓ Concluído
      </span>
    );
  }
  if (progressPct > 0) {
    return (
      <span
        aria-label={`Em progresso: ${progressPct}%`}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ${size === "sm" ? "text-[10px]" : "text-xs"} font-semibold ${className}`}
      >
        ▶ {progressPct}%
      </span>
    );
  }
  return (
    <span
      aria-label="Não iniciada"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 ${size === "sm" ? "text-[10px]" : "text-xs"} ${className}`}
    >
      ○ Não iniciada
    </span>
  );
}
