import { trpc } from "@/lib/trpc";
import { Users, Sparkles } from "lucide-react";

/**
 * FoundersCounter (Onda 17)
 * ---------------------------------------------------------------------------
 * Faixa fixa no topo da Home mostrando o progresso da meta
 * "1.000 afiliados fundadores rumo ao unicórnio".
 *
 * Fonte de dados: `onda1.milestonePublicProgress` (publicProcedure), payload:
 *   { ok, milestone: { key, current, target, pct, label, reached, reachedAt } }
 *
 * Comportamento tolerante a falha: se o endpoint estiver indisponível ou
 * ainda em loading, o componente NÃO renderiza nada — nunca quebra a Home.
 */
export function FoundersCounter() {
  const q = (trpc as any).onda1?.milestonePublicProgress?.useQuery?.(undefined, {
    refetchInterval: 60_000,
    retry: false,
    staleTime: 30_000,
  });

  const milestone = q?.data?.milestone;
  if (!milestone) return null;

  const current = Number(milestone.current || 0);
  const target = Number(milestone.target || 1000);
  const pct = Math.min(100, Math.max(0, Number(milestone.pct || 0)));
  const label: string = milestone.label || "afiliados fundadores · rumo ao unicórnio";
  const reached = !!milestone.reached;

  return (
    <div className="relative z-30 border-b border-quantum-cyan/25 bg-gradient-to-r from-obsidian via-obsidian-900 to-obsidian">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-2.5 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex items-center gap-2 text-xs md:text-[13px]">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-quantum-cyan/40 bg-quantum-cyan/10 text-quantum-cyan">
            {reached ? <Sparkles size={12} /> : <Users size={12} />}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-quantum-cyan">
            // NEXUS_FOUNDERS
          </span>
          <span className="text-slate-300">
            <span className="font-semibold text-white">{current.toLocaleString("pt-BR")}</span>
            <span className="mx-1 text-slate-500">/</span>
            <span className="text-slate-400">{target.toLocaleString("pt-BR")}</span>
            <span className="ml-2 hidden text-slate-400 md:inline">{label}</span>
          </span>
        </div>
        <div className="flex flex-1 items-center gap-2 md:max-w-md">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-obsidian-700"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso da meta founders: ${pct}%`}
          >
            <div
              className={`h-full rounded-full ${
                reached
                  ? "bg-emerald-400"
                  : "bg-gradient-to-r from-quantum-cyan via-quantum-cyan to-quantum-lime"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] tabular-nums text-slate-400">
            {pct.toFixed(pct < 10 ? 1 : 0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default FoundersCounter;
