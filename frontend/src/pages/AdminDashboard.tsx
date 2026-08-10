import { useState } from "react";
import { Link } from "wouter";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import bgAdmin from "@/assets/bg-admin.webp";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  CreditCard,
  Cpu,
  DollarSign,
  Eye,
  Network as NetworkIcon,
  Percent,
  Search,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import AutonomyScoreCard from "@/components/agents/AutonomyScoreCard";
import { Skeleton } from "@/components/ui/skeleton";

const BRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface KPIProps {
  icon: typeof Users;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  accent: string;
}

function KPICard({ icon: Icon, label, value, change, trend, accent }: KPIProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-quantum-cyan/40 hover:shadow-quantum">
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full ${accent} opacity-0 blur-3xl transition-opacity group-hover:opacity-100`}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">// {label}</p>
          <p className="mt-3 font-sans text-2xl font-bold text-white">{value}</p>
          {change && (
            <p
              className={`mt-2 inline-flex items-center gap-1 text-xs ${
                trend === "up" ? "text-quantum-lime" : "text-red-400"
              }`}
            >
              {trend === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {change}
            </p>
          )}
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const listUsersQuery = trpc.admin.listUsers.useQuery({
    page: 1,
    limit: 10,
    search: searchTerm || undefined,
  });

  const marketplaceStatsQuery = trpc.admin.marketplaceStats.useQuery({
    periodDays: 30,
  });

  const networkStatsQuery = trpc.admin.getNetworkStats.useQuery();

  const users = listUsersQuery.data?.users ?? [];
  const pagination = listUsersQuery.data?.pagination;
  const totals = marketplaceStatsQuery.data?.totals;
  // Comissões via commissionsRouter (publicProcedure)
  const commissionStatsQuery = trpc.commissions.getStats.useQuery();

  const networkStats = networkStatsQuery?.data;


  const totalUsers = networkStats?.totalUsers ?? pagination?.total ?? 0;
  const allAffiliatesCount = networkStats?.activeAffiliates ?? 0;

  const confirmedCents = commissionStatsQuery?.data?.paid ?? 0;
  const pendingCents = commissionStatsQuery?.data?.pending ?? 0;

  const paidPeriodCents = totals?.grossPeriodCents ?? 0;

  return (
    <AdminDashboardLayout>
      <div className="relative space-y-8 font-sans antialiased">
        {/* Background atmosférico fixo do command center */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${bgAdmin})` }}
          aria-hidden="true"
        />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-obsidian/90 via-obsidian/75 to-obsidian" aria-hidden="true" />
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-obsidian-700 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
              // ADMIN_CMD_CENTER
            </p>
            <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Painel{" "}
              <span className="bg-gradient-to-r from-quantum-cyan to-quantum-purple bg-clip-text text-transparent">
                Administrativo
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Visão global da malha MMN — métricas em tempo real, monitoramento de agentes IA e
              auditoria operacional.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded border border-quantum-lime/30 bg-quantum-lime/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-quantum-lime">
              <span className="h-2 w-2 animate-pulse rounded-full bg-quantum-lime shadow-[0_0_8px_#7CFFB2]" />
              Sistema operacional
            </span>
            <span className="inline-flex items-center gap-2 rounded border border-quantum-cyan/30 bg-quantum-cyan/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-quantum-cyan">
              <Activity size={12} />
              v1.2.5
            </span>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            icon={Users}
            label="Total de usuários"
            value={String(totalUsers)}
            accent="bg-quantum-cyan/30"
          />
          <KPICard
            icon={TrendingUp}
            label="Afiliados ativos"
            value={String(allAffiliatesCount)}
            accent="bg-quantum-lime/30"
          />
          <KPICard
            icon={DollarSign}
            label="Comissões pagas"
            value={confirmedCents > 0 ? BRL(confirmedCents) : BRL(paidPeriodCents)}
            accent="bg-quantum-purple/30"
          />
          <KPICard
            icon={AlertCircle}
            label="Comissões pendentes"
            value={BRL(pendingCents)}
            accent="bg-amber-400/30"
          />
        </section>

        {/* Autonomy Score da rede */}
        <section>
          <AutonomyScoreCard
            scope="network"
            title="Autonomia operacional da malha"
            subtitle="Média ponderada dos agentes ativos · indicador composto do roadmap Nexus Affil'IA'te."
          />
        </section>

        {/* Grid Comissões em cascata */}
        <section className="grid gap-6 xl:grid-cols-[1fr]">
          {/* Comissões */}
          <div className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-6 backdrop-blur">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">// COMMISSIONS_OPS</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Comissões em cascata</h3>

            <div className="mt-5 flex items-center justify-between rounded border border-obsidian-700 bg-obsidian-900/40 px-4 py-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">// Volume total (período)</p>
                <p className="mt-1 font-sans text-2xl font-bold text-quantum-cyan">
                  {BRL(paidPeriodCents)}
                </p>
              </div>
              <TrendingUp size={28} className="text-quantum-cyan" />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div className="rounded border border-obsidian-700 bg-amber-400/5 p-3">
                <p className="font-sans text-lg font-bold text-amber-300">
                  {pendingCents > 0 ? BRL(pendingCents) : "R$ 0,00"}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">pendentes</p>
              </div>
              <div className="rounded border border-obsidian-700 bg-quantum-lime/5 p-3">
                <p className="font-sans text-lg font-bold text-quantum-lime">
                  {confirmedCents > 0 ? BRL(confirmedCents) : BRL(paidPeriodCents)}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">pagas</p>
              </div>
              <div className="rounded border border-obsidian-700 bg-quantum-purple/5 p-3">
                <p className="font-sans text-lg font-bold text-quantum-purple">
                  {totals?.paidPeriodOrders ?? 0}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">pedidos pagos</p>
              </div>
            </div>

            <Link
              href="/admin/commissions"
              className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-quantum-cyan hover:text-white"
            >
              abrir módulo de comissões <ArrowRight size={12} />
            </Link>
          </div>
        </section>

        {/* Atalhos de comando */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
                // COMMAND_QUICK_ACTIONS
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">Operações administrativas</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { href: "/admin/users", label: "Usuários", icon: Users },
              { href: "/admin/network", label: "Rede", icon: NetworkIcon },
              { href: "/admin/commissions", label: "Comissões", icon: Percent },
              { href: "/admin/payments", label: "Pagamentos", icon: CreditCard },
              { href: "/admin/approvals", label: "Aprovações", icon: CheckCircle2 },
              { href: "/admin/status", label: "Status Sistema", icon: Cpu },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-start gap-2 rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-4 transition-all hover:-translate-y-0.5 hover:border-quantum-cyan/40 hover:shadow-quantum"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">
                  <Icon size={16} />
                </span>
                <span className="font-sans text-sm font-semibold text-white">{label}</span>
                <ArrowRight
                  size={14}
                  className="ml-auto text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-quantum-cyan"
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Tabela de usuários */}
        <section className="rounded-lg border border-obsidian-700 bg-obsidian-800/40 p-6 backdrop-blur">
          <div className="flex flex-col gap-3 border-b border-obsidian-700 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
                // USERS_RECENT
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">Usuários recentes</h3>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuário ou e-mail"
                className="w-full rounded border border-obsidian-700 bg-obsidian-900/60 py-2 pl-9 pr-3 font-mono text-xs text-white placeholder:text-slate-500 focus:border-quantum-cyan/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {listUsersQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-obsidian-800" />
                ))}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-obsidian-700 text-left font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    <th className="px-3 py-2">Usuário</th>
                    <th className="px-3 py-2">E-mail</th>
                    <th className="px-3 py-2">Papel</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Cadastro</th>
                    <th className="px-3 py-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr
                      key={u.id}
                      className="border-b border-obsidian-700/60 transition-colors hover:bg-obsidian-900/40"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-quantum-cyan/30 bg-quantum-cyan/10 text-xs font-bold text-quantum-cyan">
                            {(u.name || "U")
                              .split(" ")
                              .slice(0, 2)
                              .map((n: string) => n[0])
                              .join("")}
                          </span>
                          <span className="font-medium text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-400">{u.email}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                            u.role === "admin"
                              ? "border-quantum-purple/40 bg-quantum-purple/10 text-quantum-purple"
                              : "border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan"
                          }`}
                        >
                          {u.role === "admin" ? <Shield size={10} /> : <Users size={10} />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                            u.affiliateStatus === "active" || u.role === "admin"
                              ? "border-quantum-lime/40 bg-quantum-lime/10 text-quantum-lime"
                              : "border-red-400/40 bg-red-400/10 text-red-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.affiliateStatus === "active" || u.role === "admin" ? "bg-quantum-lime" : "bg-red-400"
                            }`}
                          />
                          {u.affiliateStatus || u.role}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "N/A"}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          href={`/admin/users`}
                          className="inline-flex items-center gap-1 rounded border border-obsidian-700 bg-obsidian-900/40 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-300 transition hover:border-quantum-cyan/40 hover:text-quantum-cyan"
                        >
                          <Eye size={10} /> ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                        Nenhum usuário corresponde ao filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <span>// mostrando {users.length} de {totalUsers}</span>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-quantum-cyan hover:text-white"
            >
              ver todos os usuários <ArrowRight size={10} />
            </Link>
          </div>
        </section>
      </div>
    </AdminDashboardLayout>
  );
}
