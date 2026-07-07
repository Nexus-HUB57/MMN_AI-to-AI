import { trpc } from "@/lib/trpc";
import { HeartPulse, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * AutoHealCard (Onda 17)
 * Card com estatísticas do subsistema Auto-Heal do orquestrador.
 * Fonte: onda1.slaSnapshot (publicProcedure) — contém autoHealStats.
 */
export function AutoHealCard() {
  const q = (trpc as any).onda1?.slaSnapshot?.useQuery?.(undefined, {
    refetchInterval: 60_000,
    retry: false,
  });
  const stats = q?.data?.autoHealStats || {};
  const total = Number(stats.total ?? 0);
  const success = Number(stats.success ?? 0);
  const successRate = Number(stats.successRate ?? (total ? success / total : 1));
  const rateLabel = `${(successRate * 100).toFixed(1)}%`;
  const healthy = total === 0 || successRate >= 0.95;

  return (
    <div className={`rounded-lg border ${healthy ? "border-emerald-400/30 bg-emerald-400/5" : "border-rose-400/30 bg-rose-400/5"} p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400">
            // AUTO_HEAL
          </p>
          <div className="mt-1 flex items-center gap-2">
            {healthy ? (
              <CheckCircle2 size={18} className="text-emerald-300" />
            ) : (
              <AlertCircle size={18} className="text-rose-300" />
            )}
            <span className={`text-lg font-bold ${healthy ? "text-emerald-300" : "text-rose-300"}`}>
              {healthy ? "SAUDÁVEL" : "ATENÇÃO"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {total === 0 ? "Sem incidentes no ciclo" : `${success}/${total} auto-remediações · ${rateLabel}`}
          </p>
        </div>
        <div className={`rounded-full border p-3 ${healthy ? "border-emerald-400/40 text-emerald-300" : "border-rose-400/40 text-rose-300"}`}>
          <HeartPulse size={20} />
        </div>
      </div>
    </div>
  );
}

export default AutoHealCard;
