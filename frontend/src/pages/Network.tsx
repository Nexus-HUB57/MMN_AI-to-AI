import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, Package, Calendar, TrendingUp, RefreshCw, ChevronRight } from "lucide-react";

/**
 * Network.tsx — Rede Binária N.O (Onda 19)
 * ---------------------------------------------------------------------------
 * Substitui o placeholder "Seção em Desenvolvimento" pela árvore real.
 * Cada direto exibe DUAS luzes:
 *   🟢/🔴 Aquisição do Pack     (packAcquired = pack_activations.status active)
 *   🟢/🔴 Ativação Mensal        (monthlyActive = adimplente no ciclo atual)
 *
 * Fonte: network.getMyBinaryNetwork (public com userId opcional).
 * Tolerante a falha: se endpoint indisponível, mostra estado vazio.
 */

function StatusDot({ active, label }: { active: boolean; label: string }) {
  const cls = active
    ? "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.65)]"
    : "bg-rose-500 shadow-[0_0_8px_2px_rgba(244,63,94,0.55)]";
  const textColor = active ? "text-emerald-300" : "text-rose-300";
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-obsidian-900/60 px-2 py-0.5">
      <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full ${cls}`} />
      <span className={`font-mono text-[10px] uppercase tracking-widest ${textColor}`}>
        {label}
      </span>
    </div>
  );
}

function AffiliateNode({ affiliate }: { affiliate: any }) {
  const initials = (affiliate.name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0])
    .join("")
    .toUpperCase();
  const overallActive = affiliate.status === "active";
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition ${
        overallActive
          ? "border-emerald-400/25 bg-emerald-400/5"
          : "border-rose-400/25 bg-rose-400/5"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold ${
          overallActive
            ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200"
            : "border-rose-400/60 bg-rose-400/10 text-rose-200"
        }`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-white">
            {affiliate.name}
          </p>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            L{affiliate.level}
          </span>
        </div>
        <p className="truncate text-[11px] text-slate-400">{affiliate.email}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatusDot
            active={!!affiliate.packAcquired}
            label={affiliate.packAcquired ? "Pack A²" : "Sem Pack"}
          />
          <StatusDot
            active={!!affiliate.monthlyActive}
            label={affiliate.monthlyActive ? "Ativação OK" : "Inadimplente"}
          />
        </div>
      </div>
      <ChevronRight size={16} className="shrink-0 text-slate-500" />
    </div>
  );
}

export default function Network() {
  const { user } = useAuth();
  const userIdNum = useMemo(() => {
    const raw = user?.id;
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [user?.id]);

  const q = (trpc as any).networkExtended?.getMyBinaryNetwork?.useQuery?.(
    userIdNum ? { userId: userIdNum, maxDepth: 5 } : undefined,
    { refetchInterval: 60_000, retry: false }
  );

  const data = q?.data;
  const isLoading = !!q?.isLoading;
  const directs: any[] = data?.directs || [];
  const totals = data?.totals || { level1: 0, active: 0, inactive: 0, total: 0 };
  const rootName = data?.root?.name || user?.name || "Você";

  const handleRefresh = () => q?.refetch?.();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
              // NEXUS_NETWORKING_OPERACIONAL
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white">
              Seu Networking Operacional &quot;N.O&quot;
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Visualize sua rede de indicados com luzes de status em tempo real.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded border border-quantum-cyan/40 bg-quantum-cyan/10 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-quantum-cyan transition hover:bg-quantum-cyan/20"
          >
            <RefreshCw size={12} />
            Atualizar
          </button>
        </div>

        {/* Totais */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-obsidian-700 bg-obsidian-900/40 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Diretos (L1)
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Users size={16} className="text-quantum-cyan" />
              <span className="text-2xl font-bold text-white">
                {totals.level1 || 0}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-300">
              Ativos
            </p>
            <div className="mt-1 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-300" />
              <span className="text-2xl font-bold text-emerald-200">
                {totals.active || 0}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-rose-400/25 bg-rose-400/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-rose-300">
              Inativos
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Package size={16} className="text-rose-300" />
              <span className="text-2xl font-bold text-rose-200">
                {totals.inactive || 0}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-obsidian-700 bg-obsidian-900/40 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Total rede
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Calendar size={16} className="text-slate-300" />
              <span className="text-2xl font-bold text-white">
                {totals.total || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Root (você) */}
        <div className="rounded-lg border border-quantum-cyan/30 bg-quantum-cyan/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-quantum-cyan">
            // ROOT_NODE · Você
          </p>
          <h2 className="mt-1 text-lg font-bold text-white">{rootName}</h2>
          <p className="text-xs text-slate-400">Nível 0 · Nexus Node ativo</p>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-obsidian-700 bg-obsidian-900/40 p-3 text-[11px] text-slate-300">
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Legenda:
          </span>
          <StatusDot active={true} label="Pack Ativo" />
          <StatusDot active={false} label="Sem Pack" />
          <StatusDot active={true} label="Ativação OK" />
          <StatusDot active={false} label="Inadimplente" />
        </div>

        {/* Directs */}
        <div className="rounded-lg border border-obsidian-700 bg-obsidian-900/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
              // INDICADOS_DIRETOS
            </p>
            <span className="font-mono text-[10px] tabular-nums text-slate-500">
              {directs.length} nós
            </span>
          </div>

          {isLoading && (
            <div className="py-10 text-center text-sm text-slate-400 animate-pulse">
              Sincronizando rede...
            </div>
          )}

          {!isLoading && directs.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-400">
                Sua rede ainda está vazia. Compartilhe seu link de indicação
                para começar a construir seu N.O.
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-quantum-cyan">
                // BINARY_NETWORK · CAPACIDADE_ILIMITADA
              </p>
            </div>
          )}

          {!isLoading && directs.length > 0 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {directs.map((d: any) => (
                <AffiliateNode key={d.affiliateId} affiliate={d} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
