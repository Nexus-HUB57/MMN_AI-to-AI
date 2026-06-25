// V17: Trilha personalizada — combina resume + next-suggested + popular
import { useEffect, useState } from "react";

interface TrailItem {
  lessonId: string;
  title: string | null;
  subtitle: string | null;
  sectionSlug: string;
  coverUrl: string | null;
  progressPct?: number;
  completed?: boolean;
  reason: string;
}

const _prefetched = new Set<string>();
function prefetchLesson(id: string) {
  if (_prefetched.has(id)) return;
  _prefetched.add(id);
  fetch(`/api/academia/lesson/${encodeURIComponent(id)}`).catch(() => {});
}

export default function AcademiaPersonalTrail() {
  const [items, setItems] = useState<TrailItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/api/academia/lesson-progress/me?userId=1").then((r) => r.ok ? r.json() : { items: [], resume: null }),
      fetch("/api/academia/stats/popular?days=30&limit=3").then((r) => r.ok ? r.json() : { items: [] }),
    ])
      .then(([progressData, popularData]) => {
        if (!mounted) return;
        const combined: TrailItem[] = [];

        // 1) Continuar de onde parou
        if (progressData?.resume) {
          combined.push({
            lessonId: progressData.resume.lessonId,
            title: progressData.resume.title,
            subtitle: progressData.resume.subtitle,
            sectionSlug: progressData.resume.sectionSlug,
            coverUrl: progressData.resume.coverUrl,
            progressPct: progressData.resume.progressPct || 0,
            completed: progressData.resume.completed,
            reason: "📚 Continue de onde parou",
          });
        }

        // 2) Próxima após a última concluída
        const lastCompleted = (progressData?.items || []).find((i: any) => i.completed);
        if (lastCompleted) {
          fetch(`/api/academia/lesson/${encodeURIComponent(lastCompleted.lessonId)}/next-suggested`)
            .then((r) => r.ok ? r.json() : null)
            .then((d) => {
              if (mounted && d?.next) {
                setItems((prev) => {
                  if (prev.some((p) => p.lessonId === d.next.lessonId)) return prev;
                  return [...prev, {
                    lessonId: d.next.lessonId, title: d.next.title, subtitle: d.next.subtitle,
                    sectionSlug: d.next.sectionSlug, coverUrl: d.next.coverUrl,
                    reason: "✨ Próximo passo natural",
                  }];
                });
              }
            }).catch(() => {});
        }

        // 3) Top popular
        (popularData?.items || []).slice(0, 2).forEach((p: any) => {
          if (combined.some((c) => c.lessonId === p.lessonId)) return;
          combined.push({
            lessonId: p.lessonId, title: p.title, subtitle: p.subtitle,
            sectionSlug: p.sectionSlug, coverUrl: p.coverUrl,
            reason: "🔥 Em alta na comunidade",
          });
        });

        setItems(combined);
        setLoading(false);

        // Prefetch todos
        combined.forEach((i) => prefetchLesson(i.lessonId));
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800 mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse mb-3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          🎯 Sua trilha personalizada
        </h3>
        <a href="/academia/ead/curso" className="text-xs text-cyan-600 hover:underline">Ver tudo →</a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.slice(0, 3).map((it) => (
          <a
            key={it.lessonId + it.reason}
            href={`/academia/ead/curso/${it.lessonId}`}
            onMouseEnter={() => prefetchLesson(it.lessonId)}
            onFocus={() => prefetchLesson(it.lessonId)}
            className="block rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-cyan-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 transition group"
            aria-label={`${it.reason}: ${it.title}`}
          >
            <div className="relative aspect-video bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
              {it.coverUrl ? (
                <img src={it.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <span className="text-5xl">🎓</span>
                </div>
              )}
              {typeof it.progressPct === "number" && it.progressPct > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${it.completed ? 100 : it.progressPct}%` }}
                  ></div>
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="text-[10px] uppercase tracking-wide text-cyan-600 mb-1">
                {it.reason}
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-cyan-600 transition">
                {it.title || it.lessonId}
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate">{it.subtitle || "—"}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
