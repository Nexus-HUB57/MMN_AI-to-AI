// V12: Painel "Novidades da Academ'IA" — últimas 5 aulas publicadas
import { useEffect, useState } from "react";

interface WhatsNewItem {
  lessonId: string;
  sectionSlug: string;
  title: string | null;
  subtitle: string | null;
  level: string | null;
  videoUrl: string | null;
  htmlUrl: string | null;
  coverUrl: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d atrás`;
  return d.toLocaleDateString("pt-BR");
}

const SECTION_LABEL: Record<string, string> = {
  curso: "Curso",
  lab: "Lab Nexus",
  lib: "Lib Nexus",
  playbook: "Playbook",
  webinar: "Webinar",
  treinamento: "Treinamento",
};

export default function AcademiaWhatsNew() {
  const [items, setItems] = useState<WhatsNewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/academia/whats-new?limit=5")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!mounted) return;
        setItems(Array.isArray(d.items) ? d.items : []);
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Falha ao carregar");
        setLoading(false);
      });
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

  if (error || items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          🆕 Novidades da Academ&apos;IA
        </h3>
        <a href="/academia/ead/curso" className="text-xs text-cyan-600 hover:underline">Ver tudo →</a>
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <a
            key={it.lessonId}
            href={`/academia/ead/curso/${it.lessonId}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            {it.coverUrl ? (
              <img src={it.coverUrl} alt="" className="w-14 h-14 object-cover rounded-md flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎓</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-cyan-600">
                  {SECTION_LABEL[it.sectionSlug] || it.sectionSlug}
                </span>
                {it.isFeatured && <span className="text-[10px] text-amber-600">⭐</span>}
                {it.videoUrl && <span className="text-[10px] text-purple-600">🎬</span>}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {it.title || it.lessonId}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {it.subtitle || "—"} · {timeAgo(it.publishedAt)}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
