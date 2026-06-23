// V14: Card "Aulas em alta" — top views nos últimos 30 dias
import { useEffect, useState } from "react";

interface PopularItem {
  lessonId: string;
  sectionSlug: string;
  title: string | null;
  subtitle: string | null;
  coverUrl: string | null;
  videoUrl: string | null;
  htmlUrl: string | null;
  views: number;
  lastViewedAt: string | null;
}

const SECTION_LABEL: Record<string, string> = {
  curso: "Curso", lab: "Lab", lib: "Lib",
  playbook: "Playbook", webinar: "Webinar", treinamento: "Treinamento",
};

export default function AcademiaPopular() {
  const [items, setItems] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasViews, setHasViews] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/academia/stats/popular?days=30&limit=5")
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d) => {
        if (!mounted) return;
        const arr: PopularItem[] = Array.isArray(d.items) ? d.items : [];
        setItems(arr);
        setHasViews(arr.some((i) => i.views > 0));
        setLoading(false);
      })
      .catch(() => { if (mounted) { setLoading(false); } });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800 mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse mb-3"></div>
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          🔥 Aulas em alta {hasViews ? "" : "(sem views ainda)"}
        </h3>
        <a href="/academia/ead/curso" className="text-xs text-cyan-600 hover:underline">Ver tudo →</a>
      </div>
      <div className="space-y-2">
        {items.map((it, idx) => (
          <a
            key={it.lessonId}
            href={`/academia/ead/curso/${it.lessonId}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-400/20 to-red-500/20 text-amber-600 font-bold text-sm flex-shrink-0">
              {idx + 1}
            </div>
            {it.coverUrl ? (
              <img src={it.coverUrl} alt="" className="w-12 h-12 object-cover rounded-md flex-shrink-0" loading="lazy" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🎓</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-cyan-600">
                  {SECTION_LABEL[it.sectionSlug] || it.sectionSlug}
                </span>
                {it.videoUrl && <span className="text-[10px] text-purple-600">🎬</span>}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {it.title || it.lessonId}
              </div>
              <div className="text-xs text-gray-500">
                {it.views} visualização{it.views === 1 ? "" : "es"} · 30 dias
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
