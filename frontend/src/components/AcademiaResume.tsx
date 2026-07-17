// V15: Card "Continuar de onde parou" — retomada automática via lesson_progress
import { useEffect, useState } from "react";

interface ResumeItem {
  lessonId: string;
  title: string | null;
  subtitle: string | null;
  sectionSlug: string;
  coverUrl: string | null;
  videoUrl: string | null;
  htmlUrl: string | null;
  watchedSeconds: number;
  lastPosition: number;
  durationS: number | null;
  completed: boolean;
  updatedAt: string | null;
  progressPct: number | null;
}

export default function AcademiaResume() {
  const [resume, setResume] = useState<ResumeItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Tenta com userId placeholder se backend não estiver autenticando via cookie
    fetch("/api/academia/lesson-progress/me", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (mounted) { setResume(d?.resume || null); setLoading(false); } })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading || !resume) return null;
  const pct = resume.progressPct ?? 0;

  return (
    <div className="bg-gradient-to-br from-cyan-500/5 to-purple-500/5 dark:from-cyan-900/20 dark:to-purple-900/20 rounded-lg p-6 shadow-lg border border-cyan-500/20 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📚 Continuar de onde parou
        </h3>
        {resume.completed && <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full">✓ Concluído</span>}
      </div>
      <a href={`/academia/ead/curso/${resume.lessonId}`} className="flex items-center gap-4 group">
        {resume.coverUrl ? (
          <img src={resume.coverUrl} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" loading="lazy" />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">🎓</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wide text-cyan-600 mb-1">
            {resume.sectionSlug}
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-cyan-600 transition">
            {resume.title || resume.lessonId}
          </div>
          <div className="text-sm text-gray-500 truncate mb-2">{resume.subtitle || "—"}</div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all" style={{ width: `${pct}%` }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {pct}% · {resume.lastPosition}s de {resume.durationS || "?"}s assistidos
          </div>
        </div>
        <div className="text-cyan-600 group-hover:translate-x-1 transition-transform">→</div>
      </a>
    </div>
  );
}
