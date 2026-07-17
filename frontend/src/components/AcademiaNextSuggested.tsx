// V16: Card "Próxima aula sugerida" no rodapé da página de aula
import { useEffect, useState } from "react";

interface NextLesson {
  lessonId: string;
  sectionSlug: string;
  title: string | null;
  subtitle: string | null;
  level: string | null;
  coverUrl: string | null;
  videoUrl: string | null;
}

const _prefetched = new Set<string>();
function prefetchNext(id: string) {
  if (_prefetched.has(id)) return;
  _prefetched.add(id);
  fetch(`/api/academia/lesson/${encodeURIComponent(id)}`).catch(() => {});
}

export default function AcademiaNextSuggested({ lessonId }: { lessonId: string }) {
  const [next, setNext] = useState<NextLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!lessonId) return;
    fetch(`/api/academia/lesson/${encodeURIComponent(lessonId)}/next-suggested`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d) => {
        if (!mounted) return;
        setNext(d.next || null);
        setMessage(d.message || null);
        if (d.next?.lessonId) prefetchNext(d.next.lessonId);
        setLoading(false);
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [lessonId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800 mt-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse mb-3"></div>
        <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!next) {
    return (
      <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-lg p-6 shadow-lg border border-emerald-500/20 mt-4 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
          {message || "Você completou esta trilha!"}
        </div>
        <a href="/academia/ead/curso" className="inline-block mt-3 text-sm text-cyan-600 hover:underline">
          Explorar outras trilhas →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-cyan-500/5 to-purple-500/5 dark:from-cyan-900/20 dark:to-purple-900/20 rounded-lg p-6 shadow-lg border border-cyan-500/20 mt-4">
      <div className="text-xs uppercase tracking-wide text-cyan-600 mb-2 font-semibold">
        ✨ Próxima aula sugerida
      </div>
      <a
        href={`/academia/ead/curso/${next.lessonId}`}
        onMouseEnter={() => prefetchNext(next.lessonId)}
        className="flex items-center gap-4 group"
      >
        {next.coverUrl ? (
          <img src={next.coverUrl} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" loading="lazy" />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">🎓</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-cyan-600 transition">
            {next.title || next.lessonId}
          </div>
          <div className="text-sm text-gray-500 truncate">{next.subtitle || "—"}</div>
          <div className="text-xs text-gray-400 mt-1">
            {next.sectionSlug} · {next.level || "—"}
          </div>
        </div>
        <div className="text-cyan-600 group-hover:translate-x-1 transition-transform text-2xl">→</div>
      </a>
    </div>
  );
}
