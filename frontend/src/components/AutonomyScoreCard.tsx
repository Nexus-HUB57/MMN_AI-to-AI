import { trpc } from "@/lib/trpc";
import { Activity } from "lucide-react";

/**
 * AutonomyScoreCard (Onda 17)
 * Card com o score de autonomia composto (0-5) do Nexus.
 * Fonte: onda1.autonomyScoreCurrent (publicProcedure).
 */
export function AutonomyScoreCard() {
  const q = (trpc as any).onda1?.autonomyScoreCurrent?.useQuery?.(undefined, {
    refetchInterval: 60_000,
    retry: false,
  });
  const data = q?.data;
  const composite: number = Number(data?.composite ?? 0);
  const dims: Record<string, number> = data?.dimensions || {};

  const level =
    composite >= 4 ? { label: "AUTÔNOMO", color: "text-emerald-300", border: "border-emerald-400/40", bg: "bg-emerald-400/10" }
      : composite >= 3 ? { label: "ADAPTATIVO", color: "text-quantum-cyan", border: "border-quantum-cyan/40", bg: "bg-quantum-cyan/10" }
      : composite >= 2 ? { label: "ASSISTIDO", color: "text-amber-300", border: "border-amber-400/40", bg: "bg-amber-400/10" }
      : { label: "MANUAL", color: "text-rose-300", border: "border-rose-400/40", bg: "bg-rose-400/10" };

  return (
    <div className={`rounded-lg border ${level.border} ${level.bg} p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400">
            // AUTONOMY_SCORE
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${level.color}`}>
              {composite.toFixed(2)}
            </span>
            <span className="text-sm text-slate-500">/ 5.00</span>
          </div>
          <p className={`mt-1 font-mono text-[11px] font-semibold ${level.color}`}>
            {level.label}
          </p>
        </div>
        <div className={`rounded-full border ${level.border} p-3 ${level.color}`}>
          <Activity size={20} />
        </div>
      </div>

      {Object.keys(dims).length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          {Object.entries(dims).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between rounded bg-obsidian-900/40 px-2 py-1">
              <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
              <span className="font-mono font-semibold text-white">{Number(val).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AutonomyScoreCard;
