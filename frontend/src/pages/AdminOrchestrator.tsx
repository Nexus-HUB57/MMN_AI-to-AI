/**
 * Nexus Affil'IA'te · Painel Sistema Orquestrador
 *
 * Visao em tempo real de toda a equipe C-Suite e dos agentes operacionais.
 * Lê de trpc.orchestratorAdmin.snapshot e trpc.orchestratorAdmin.activityStream.
 *
 * @route /admin/orchestrator
 */
import SlaDashboardCard from "@/components/SlaDashboardCard";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import AutonomyScoreCard from "@/components/agents/AutonomyScoreCard";
import { OttoCfoCard } from "@/components/OttoCfoCard";
import { AutoHealCard } from "@/components/AutoHealCard";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  ShieldCheck,
  Globe,
  Cpu,
  Crown,
  Wrench,
  Megaphone,
  DollarSign,
  CircleDot,
  ExternalLink,
  Filter,
  RefreshCw,
} from "lucide-react";

const ROLE_META: Record<
  string,
  { icon: typeof Crown; accent: string; bg: string; border: string; label: string }
> = {
  "CEO/AI": {
    icon: Crown,
    accent: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-400/40",
    label: "CEO",
  },
  "CTO/AI": {
    icon: Wrench,
    accent: "text-quantum-cyan",
    bg: "bg-quantum-cyan/10",
    border: "border-quantum-cyan/40",
    label: "CTO",
  },
  "CMO/AI": {
    icon: Megaphone,
    accent: "text-quantum-purple",
    bg: "bg-quantum-purple/10",
    border: "border-quantum-purple/40",
    label: "CMO",
  },
  "CFO/AI": {
    icon: DollarSign,
    accent: "text-quantum-lime",
    bg: "bg-quantum-lime/10",
    border: "border-quantum-lime/40",
    label: "CFO",
  },
};

const DECISION_COLOR: Record<string, string> = {
  approved: "text-quantum-lime border-quantum-lime/40 bg-quantum-lime/10",
  review: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  blocked: "text-red-400 border-red-400/40 bg-red-400/10",
};

const STATUS_COLOR: Record<string, string> = {
  executed: "text-quantum-lime",
  pending: "text-amber-300",
  "rolled-back": "text-red-400",
  skipped: "text-slate-400",
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("pt-BR");
  } catch {
    return "—";
  }
}

export default function AdminOrchestrator() {
  const [filterKind, setFilterKind] = useState<string | undefined>(undefined);
  const [streamLimit, setStreamLimit] = useState(30);

  const snapshotQuery = trpc.orchestratorAdmin.snapshot.useQuery(undefined, {
    refetchInterval: 15_000,
  });
  const streamQuery = trpc.orchestratorAdmin.activityStream.useQuery(
    { limit: streamLimit, kind: filterKind as any },
    { refetchInterval: 10_000, keepPreviousData: true },
  );

  const snap = snapshotQuery.data;
  const stream = streamQuery.data;

  const cSuiteMembers = snap?.cSuite.members ?? [];
  const federationNodes = snap?.federation.nodes ?? [];
  const recent = snap?.governance.recent ?? [];
  const items = stream?.items ?? [];

  const distinctKinds = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.kind));
    return Array.from(set).sort();
  }, [items]);

  return (
    <AdminDashboardLayout>
      <div className="relative space-y-8 font-sans antialiased p-6">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-obsidian-700 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
              // SISTEMA_ORQUESTRADOR
            </p>
            <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Sistema{" "}
              <span className="bg-gradient-to-r from-quantum-cyan to-quantum-purple bg-clip-text text-transparent">
                Orquestrador
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              C-Suite AI em ação · federação distribuída · governance loop ao vivo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded border border-quantum-lime/30 bg-quantum-lime/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-quantum-lime">
              <CircleDot size={12} className="animate-pulse" />
              live
            </span>
            <button
              onClick={() => {
                snapshotQuery.refetch();
                streamQuery.refetch();
              }}
              className="inline-flex items-center gap-2 rounded border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-quantum-cyan hover:bg-quantum-cyan/20"
            >
              <RefreshCw size={12} />
              refresh
            </button>
          </div>
        </header>

        {/* KPIs do Orquestrador */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 mb-6">
          <SlaDashboardCard />
            <AutonomyScoreCard />
          <OttoCfoCard />
          <AutoHealCard />
        </section>
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              // C-Suite ativos
            </p>
            <p className="mt-2 font-sans text-2xl font-bold text-white">
              {snap ? snap.cSuite.active : "…"}
              <span className="ml-1 text-sm text-slate-500">/ {snap?.cSuite.total ?? "—"}</span>
            </p>
          </div>
          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              // Federação Remota
            </p>
            <p className="mt-2 font-sans text-2xl font-bold text-quantum-cyan">
              {snap ? snap.federation.remoteActive : "…"}
              <span className="ml-1 text-sm text-slate-500">/ {snap?.federation.remoteTotal ?? "—"}</span>
            </p>
          </div>
          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              // Ações governadas
            </p>
            <p className="mt-2 font-sans text-2xl font-bold text-quantum-purple">
              {(snap?.governance.stats as any)?.total ?? "…"}
            </p>
          </div>
          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              // Aprovação geral
            </p>
            <p className="mt-2 font-sans text-2xl font-bold text-quantum-lime">
              {(() => {
                const s: any = snap?.governance.stats;
                if (!s) return "…";
                const rate = s.approvalRate ?? (s.approved / Math.max(s.total, 1));
                return `${(rate * 100).toFixed(1)}%`;
              })()}
            </p>
          </div>
        </section>

        {/* C-Suite Crew */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
                // C_SUITE_CREW
              </p>
              <h2 className="text-lg font-semibold text-white">Tripulação executiva</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cSuiteMembers.length === 0 && snapshotQuery.isLoading && (
              <p className="col-span-full text-sm text-slate-500">Carregando crew…</p>
            )}
            {cSuiteMembers.map((m) => {
              const meta = ROLE_META[m.role] ?? ROLE_META["CEO/AI"];
              const Icon = meta.icon;
              return (
                <div
                  key={m.agentId}
                  className={`rounded-lg border ${meta.border} ${meta.bg} p-5 backdrop-blur transition hover:-translate-y-0.5`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md border ${meta.border} ${meta.bg}`}>
                      <Icon size={20} className={meta.accent} />
                    </div>
                    <span className={`font-mono text-[10px] uppercase tracking-widest ${meta.accent}`}>
                      {meta.label} · elite
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-white">{m.name}</h3>
                  <p className="mt-1 text-xs text-slate-400">{m.role}</p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    permissões: <span className="text-white">{m.permittedKindsCount}</span>
                  </p>
                  {m.reportsTo && (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      reporta a: <span className="text-white">{m.reportsTo.split(":")[1] ?? m.reportsTo}</span>
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    desde: <span className="text-white">{formatDate(m.joinedAt).split(",")[0]}</span>
                  </p>
                  {m.workspace && (
                    <a
                      href={m.workspace}
                      target="_blank"
                      rel="noreferrer"
                      className={`mt-4 inline-flex items-center gap-1 text-xs ${meta.accent} hover:underline`}
                    >
                      workspace <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Federação remota */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
                // JUDGE_FEDERATION
              </p>
              <h2 className="text-lg font-semibold text-white">Nós da federação remota</h2>
            </div>
            <Link
              href="/admin/federation"
              className="inline-flex items-center gap-1 text-xs text-quantum-cyan hover:text-white"
            >
              gerenciar <ExternalLink size={11} />
            </Link>
          </div>
          <div className="overflow-x-auto rounded-lg border border-obsidian-700 bg-obsidian-800/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-obsidian-700/60 text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nó</th>
                  <th className="px-4 py-3">Operador</th>
                  <th className="px-4 py-3">Trust</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {federationNodes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-slate-500">
                      Sem nós remotos registrados ainda.
                    </td>
                  </tr>
                )}
                {federationNodes.map((n) => (
                  <tr key={n.nodeId} className="border-b border-obsidian-700/60 hover:bg-obsidian-900/40">
                    <td className="px-4 py-3 text-white">{n.name}</td>
                    <td className="px-4 py-3 text-slate-400">{n.operator}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        n.trustLevel === "elite"
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                          : n.trustLevel === "verified"
                          ? "border-quantum-cyan/40 bg-quantum-cyan/10 text-quantum-cyan"
                          : "border-slate-500/40 bg-slate-500/10 text-slate-400"
                      }`}>
                        <ShieldCheck size={10} /> {n.trustLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        n.active
                          ? "border-quantum-lime/40 bg-quantum-lime/10 text-quantum-lime"
                          : "border-slate-500/40 bg-slate-500/10 text-slate-400"
                      }`}>
                        <CircleDot size={10} className={n.active ? "animate-pulse" : ""} /> {n.active ? "online" : "offline"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Activity stream */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
                // ACTIVITY_STREAM
              </p>
              <h2 className="text-lg font-semibold text-white">Loop de governança ao vivo</h2>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-slate-500" />
              <select
                value={filterKind ?? ""}
                onChange={(e) => setFilterKind(e.target.value || undefined)}
                className="rounded border border-obsidian-700 bg-obsidian-900/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300"
              >
                <option value="">todas as kinds</option>
                {distinctKinds.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <select
                value={streamLimit}
                onChange={(e) => setStreamLimit(Number(e.target.value))}
                className="rounded border border-obsidian-700 bg-obsidian-900/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={60}>60</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-obsidian-700 bg-obsidian-800/40">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-obsidian-700/60 text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-3 py-2">Quando</th>
                  <th className="px-3 py-2">Kind</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Iniciador</th>
                  <th className="px-3 py-2">Decisão</th>
                  <th className="px-3 py-2">Cons.</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {streamQuery.isLoading && (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-slate-500">
                      Carregando stream…
                    </td>
                  </tr>
                )}
                {!streamQuery.isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-slate-500">
                      Sem atividade no filtro atual.
                    </td>
                  </tr>
                )}
                {items.map((it) => (
                  <tr key={it.actionId} className="border-b border-obsidian-700/60 hover:bg-obsidian-900/40">
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500">
                      {formatDate(it.createdAt)}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex rounded border border-obsidian-700 bg-obsidian-900/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-quantum-cyan">
                        {it.kind}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-white">{it.subject}</td>
                    <td className="px-3 py-2 text-slate-400">{it.initiator}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        DECISION_COLOR[it.decision] ?? "border-slate-500/40 bg-slate-500/10 text-slate-400"
                      }`}>
                        {it.decision}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-300">
                      {(it.consensus * 100).toFixed(0)}%
                    </td>
                    <td className={`px-3 py-2 font-mono text-[11px] ${STATUS_COLOR[it.executionStatus ?? "pending"] ?? "text-slate-400"}`}>
                      {it.executionStatus ?? "pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminDashboardLayout>
  );
}
