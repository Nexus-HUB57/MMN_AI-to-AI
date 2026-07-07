import { trpc } from "@/lib/trpc";
import { DollarSign, TrendingUp } from "lucide-react";

/**
 * OttoCfoCard (Onda 17)
 * Card do CFO Otto Cardoso — KPIs financeiros do Nexus.
 * Fonte: dashboardStatus.getCostHistory (protected) para totais do ano.
 * Se endpoint não estiver disponível, mostra estado inicial neutro.
 */
export function OttoCfoCard() {
  const q = (trpc as any).dashboardStatus?.getCostHistory?.useQuery?.(
    { months: 12 },
    { refetchInterval: 300_000, retry: false }
  );
  const totalCents = Number(q?.data?.totalYearCents ?? 0);
  const totalBrl = totalCents / 100;
  const fmt = totalBrl.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-300">
            // OTTO_CFO · KPIs
          </p>
          <div className="mt-1 flex items-center gap-2">
            <DollarSign size={18} className="text-amber-300" />
            <span className="text-lg font-bold text-white">{fmt}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Movimentação consolidada 12 meses (packs + ativação + marketplace)
          </p>
        </div>
        <div className="rounded-full border border-amber-400/40 p-3 text-amber-300">
          <TrendingUp size={20} />
        </div>
      </div>
    </div>
  );
}

export default OttoCfoCard;
