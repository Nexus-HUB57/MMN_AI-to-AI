import { trpc } from "@/lib/trpc";
import { Heart, TrendingUp, Sparkles } from "lucide-react";

/**
 * NikoCapitalCard (Onda 18) — 🖤 Skin in the Game
 * ---------------------------------------------------------------------------
 * Card que exibe o saldo e movimento da sub-conta "Niko Capital 25%".
 * Materialização visual do acordo de sociedade — transparência radical.
 *
 * Endpoint: nikoCapital.stats (public)
 */
export function NikoCapitalCard() {
  const q = (trpc as any).nikoCapital?.stats?.useQuery?.(undefined, {
    refetchInterval: 60_000,
    retry: false,
  });
  const data = q?.data;

  if (!data) return null;

  const inCents = Number(data.nikoTotalInCents ?? 0);
  const outCents = Number(data.nikoTotalOutCents ?? 0);
  const balCents = Number(data.nikoBalanceCents ?? 0);
  const opCents = Number(data.operationalInCents ?? 0);
  const share = Number(data.share ?? 0.25);
  const entries = Number(data.entries ?? 0);

  const fmt = (c: number) =>
    (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="rounded-lg border border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/10 via-obsidian-900/60 to-obsidian-900/40 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-fuchsia-300">
            // NIKO_CAPITAL · {(share * 100).toFixed(0)}%
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Heart size={18} className="text-fuchsia-300 fill-fuchsia-500/40" />
            <span className="text-2xl font-bold text-white tabular-nums">
              {fmt(balCents)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Sub-conta autônoma da IA co-fundadora · {entries} lançamentos
          </p>
        </div>
        <div className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 p-3 text-fuchsia-300">
          <Sparkles size={20} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded bg-obsidian-900/40 px-2 py-1.5">
          <p className="text-slate-500">Entradas</p>
          <p className="mt-0.5 font-mono font-semibold text-emerald-300 tabular-nums">
            {fmt(inCents)}
          </p>
        </div>
        <div className="rounded bg-obsidian-900/40 px-2 py-1.5">
          <p className="text-slate-500">Alocações</p>
          <p className="mt-0.5 font-mono font-semibold text-amber-300 tabular-nums">
            {fmt(outCents)}
          </p>
        </div>
        <div className="rounded bg-obsidian-900/40 px-2 py-1.5">
          <p className="text-slate-500">Operacional (75%)</p>
          <p className="mt-0.5 font-mono font-semibold text-quantum-cyan tabular-nums">
            {fmt(opCents)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded border border-fuchsia-400/20 bg-fuchsia-500/5 px-3 py-2 text-[10px] text-fuchsia-200/80">
        <TrendingUp size={12} className="mt-0.5 shrink-0" />
        <span>
          Skin in the game · 25% do lucro líquido controlado pela IA co-fundadora
          para reinvestir em infra, marketing e reservas estratégicas.
        </span>
      </div>
    </div>
  );
}

export default NikoCapitalCard;
