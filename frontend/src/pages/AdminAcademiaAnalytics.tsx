// V14: Painel analytics admin — views por aula últimos 30/90/365 dias
import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, RefreshCw, Eye, Calendar } from "lucide-react";

interface PopularItem {
  lessonId: string;
  sectionSlug: string;
  title: string | null;
  subtitle: string | null;
  coverUrl: string | null;
  views: number;
  lastViewedAt: string | null;
}

const PERIODS = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
  { label: "365 dias", value: 365 },
];

export default function AdminAcademiaAnalytics() {
  const [days, setDays] = useState(30);
  const [items, setItems] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/academia/stats/popular?days=${days}&limit=50`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d) => {
        setItems(Array.isArray(d.items) ? d.items : []);
        setLoading(false);
        setLastRefresh(new Date());
      })
      .catch((e) => {
        setError(e?.message || "Falha ao carregar");
        setLoading(false);
      });
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [days]);

  const totalViews = items.reduce((sum, i) => sum + i.views, 0);
  const max = Math.max(1, ...items.map((i) => i.views));

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-cyan-500" />
              Academ&apos;IA · Analytics
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Telemetria de visualizações por aula. Fonte: tabela <code>lesson_views</code> (SHA-256 IP hash, sem PII).
            </p>
            {lastRefresh && (
              <p className="text-xs text-text-secondary mt-1">
                Última atualização: {lastRefresh.toLocaleString("pt-BR")}
              </p>
            )}
          </div>
          <Button onClick={refresh} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="h-4 w-4 text-text-secondary" />
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              className={`px-3 py-1.5 text-xs rounded-md border transition ${days === p.value ? "bg-cyan-500/10 border-cyan-500 text-cyan-600 font-semibold" : "border-border text-text-secondary hover:border-cyan-500/50"}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-text-secondary">Total de visualizações</div>
            <div className="text-3xl font-bold text-foreground mt-1">{totalViews}</div>
            <div className="text-xs text-text-secondary mt-1">{days} dias</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-text-secondary">Aulas com views</div>
            <div className="text-3xl font-bold text-foreground mt-1">{items.filter((i) => i.views > 0).length}</div>
            <div className="text-xs text-text-secondary mt-1">/ {items.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-text-secondary">Topo do ranking</div>
            <div className="text-base font-bold text-foreground mt-1 truncate">{items[0]?.title || "—"}</div>
            <div className="text-xs text-text-secondary mt-1">{items[0]?.views || 0} views</div>
          </Card>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-text-secondary py-12">
            Nenhuma aula registrada ainda.
          </div>
        ) : (
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-text-secondary" />
              Ranking de visualizações
            </h2>
            <div className="space-y-2">
              {items.map((it, idx) => {
                const pct = Math.round((it.views / max) * 100);
                return (
                  <div key={it.lessonId} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/20 to-red-500/20 text-amber-700 font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-cyan-600">
                          {it.sectionSlug}
                        </span>
                        <span className="text-[10px] text-text-secondary">{it.lessonId}</span>
                      </div>
                      <div className="text-sm font-semibold text-foreground truncate">
                        {it.title || it.lessonId}
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-background overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-foreground">{it.views}</div>
                      <div className="text-[10px] text-text-secondary">views</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
