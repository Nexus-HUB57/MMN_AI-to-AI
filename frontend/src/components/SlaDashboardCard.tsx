import { trpc } from "../lib/trpc";

/**
 * SLA Dashboard Card · Owner: Otavio COO/AI · Onda 7 Sprint 1 M2
 */
export function SlaDashboardCard() {
  const query = (trpc as any).onda1?.slaSnapshot?.useQuery?.(undefined, {
    refetchInterval: 30000,
  });

  if (!query) return null;
  const data = query.data;
  if (!data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
        <div className="text-sm text-slate-400">SLA Dashboard · carregando…</div>
      </div>
    );
  }

  const statusColor = {
    healthy: "text-emerald-400",
    degraded: "text-amber-400",
    critical: "text-red-400",
  }[data.overallStatus as string] || "text-slate-400";

  const heal = data.autoHealStats;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">SLA Dashboard</h3>
        <span className={`text-sm font-mono ${statusColor}`}>
          ● {data.overallStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-500">Auto-Heal 24h</div>
          <div className="text-2xl font-bold text-white">{heal.total}</div>
          <div className="text-xs text-emerald-400">{heal.successRate}% success</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Escalated</div>
          <div className="text-2xl font-bold text-white">{heal.escalated}</div>
          <div className="text-xs text-slate-400">{heal.healed} healed</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-slate-500 mb-2">Endpoints críticos (p95)</div>
        {(data.endpoints || []).slice(0, 4).map((ep: any) => (
          <div key={ep.endpoint} className="flex justify-between text-xs">
            <span className="text-slate-400 truncate max-w-[240px]" title={ep.endpoint}>
              {ep.endpoint.replace("/api/trpc/", "")}
            </span>
            <span className="text-white font-mono">
              {ep.p95Ms}ms · {ep.successRate.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-500">
        Owner: Otávio Nexus Ops (COO/AI) · updated: {new Date(data.timestamp).toLocaleTimeString('pt-BR')}
      </div>
    </div>
  );
}

export default SlaDashboardCard;
