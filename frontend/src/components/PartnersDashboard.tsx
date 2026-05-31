import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import {
  Users,
  TrendingUp,
  Award,
  Copy,
  ChevronRight,
  BarChart3,
  Gift,
  Star,
  Trophy,
  Target,
  Zap,
  Crown,
  Shield,
  Gem,
  Loader2,
} from "lucide-react";

interface Partner {
  id: string;
  name: string;
  tier: "silver" | "gold" | "platinum" | "diamond";
  volume: number;
  commissions: number;
  referrals: number;
  status: "active" | "pending" | "suspended";
}

interface PartnerStats {
  totalPartners: number;
  activePartners: number;
  totalVolume: number;
  totalCommissions: number;
  averageTier: string;
}

const TIER_CONFIG = {
  silver: {
    label: "Prata",
    color: "from-gray-400 to-gray-500",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500",
    icon: Shield,
    benefits: ["Dashboard Básico", "Relatórios Semanais"],
  },
  gold: {
    label: "Ouro",
    color: "from-amber-400 to-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500",
    icon: Award,
    benefits: ["Dashboard Avançado", "Relatórios Diários", "Suporte Prioritário"],
  },
  platinum: {
    label: "Platina",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500",
    icon: Crown,
    benefits: ["Dashboard em Tempo Real", "API de Acesso", "Suporte 24/7"],
  },
  diamond: {
    label: "Diamante",
    color: "from-cyan-400 to-cyan-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500",
    icon: Gem,
    benefits: ["Tudo Anterior", "Gerente Dedicado", "Relatórios Customizados"],
  },
};

export function PartnersDashboard() {
  const [selectedTier, setSelectedTier] = useState<string>("all");

  // Buscar estatísticas via tRPC
  const { data: stats, isLoading: statsLoading } = useQuery(
    trpc.partners.stats.queryOptions()
  );

  // Buscar lista de parceiros via tRPC
  const { data: partnersData, isLoading: partnersLoading } = useQuery(
    trpc.partners.list.queryOptions({
      tier: selectedTier === "all" ? undefined : selectedTier as any,
      page: 1,
      limit: 50,
    })
  );

  // Mapear dados da API para o formato esperado pelo componente
  const partners: Partner[] = (partnersData?.partners || []).map((p: any) => ({
    id: p.id,
    name: `Parceiro ${p.id}`,
    tier: p.tier,
    volume: p.totalVolume,
    commissions: p.commissionBalance,
    referrals: p.referralCount,
    status: "active" as const,
  }));

  const currentStats: PartnerStats = stats || {
    totalPartners: 0,
    activePartners: 0,
    totalVolume: 0,
    totalCommissions: 0,
    averageTier: "gold",
  };

  const filteredPartners =
    selectedTier === "all"
      ? partners
      : partners.filter((p) => p.tier === selectedTier);

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(`https://mmn.ai/partner/${code}`);
    toast.success("Código de indicação copiado!");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const isLoading = statsLoading || partnersLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Dashboard de Parceiros
            </h1>
            <p className="mt-1 text-slate-400">
              Gerencie suas parcerias e acompanhe resultados
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/partners/new"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              <Users className="h-4 w-4" />
              Novo Parceiro
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total de Parceiros</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {currentStats.totalPartners}
                    </p>
                  </div>
                  <div className="rounded-lg bg-cyan-500/20 p-3">
                    <Users className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-green-400">+12%</span>
                  <span className="text-slate-500">vs. mês anterior</span>
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-green-400" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Parceiros Ativos</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {currentStats.activePartners}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-500/20 p-3">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-green-400">
                    {currentStats.totalPartners > 0
                      ? ((currentStats.activePartners / currentStats.totalPartners) * 100).toFixed(1)
                      : 0}%
                  </span>
                  <span className="text-slate-500">taxa de ativação</span>
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Volume Total</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {formatCurrency(currentStats.totalVolume)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-500/20 p-3">
                    <BarChart3 className="h-6 w-6 text-amber-400" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-green-400">+23%</span>
                  <span className="text-slate-500">vs. mês anterior</span>
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Comissões Totais</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {formatCurrency(currentStats.totalCommissions)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-500/20 p-3">
                    <Gift className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-green-400">+18%</span>
                  <span className="text-slate-500">vs. mês anterior</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tiers Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(TIER_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = partners.filter((p) => p.tier === key).length;
            return (
              <button
                key={key}
                onClick={() =>
                  setSelectedTier(selectedTier === key ? "all" : key)
                }
                className={`rounded-xl border p-4 text-left transition-all ${
                  selectedTier === key
                    ? `${config.borderColor} ${config.bgColor}`
                    : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg bg-gradient-to-br ${config.color} p-2`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{config.label}</p>
                    <p className="text-sm text-slate-400">
                      {count} parceiros
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Partners List */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur">
          <div className="border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Lista de Parceiros
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white"
                >
                  <option value="all">Todos os níveis</option>
                  <option value="silver">Prata</option>
                  <option value="gold">Ouro</option>
                  <option value="platinum">Platina</option>
                  <option value="diamond">Diamante</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-600" />
              <p className="mt-4 text-slate-400">
                Nenhum parceiro encontrado
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredPartners.map((partner) => {
                const config = TIER_CONFIG[partner.tier];
                const Icon = config.icon;
                return (
                  <div
                    key={partner.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-slate-700/30"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-lg bg-gradient-to-br ${config.color} p-2`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{partner.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.borderColor} border`}
>
                            {config.label}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              partner.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {partner.status === "active" ? "Ativo" : "Pendente"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Volume</p>
                        <p className="font-medium text-white">
                          {formatCurrency(partner.volume)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Comissões</p>
                        <p className="font-medium text-green-400">
                          {formatCurrency(partner.commissions)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Indicações</p>
                        <p className="font-medium text-white">
                          {partner.referrals}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyReferralCode(partner.id)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                          title="Copiar link de indicação"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Top Performers
            </h2>
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {partners
              .sort((a, b) => b.volume - a.volume)
              .slice(0, 3)
              .map((partner, index) => {
                const config = TIER_CONFIG[partner.tier];
                return (
                  <div
                    key={partner.id}
                    className="flex items-center gap-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                        index === 0
                          ? "bg-amber-500/20 text-amber-400"
                          : index === 1
                            ? "bg-gray-400/20 text-gray-300"
                            : "bg-amber-700/20 text-amber-600"
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{partner.name}</p>
                      <p className="text-sm text-slate-400">
                        {formatCurrency(partner.volume)} volume
                      </p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-medium ${config.bgColor} ${config.borderColor} border`}
                    >
                      {config.label}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Link
            href="/partners/invite"
            className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-cyan-500 hover:bg-slate-700/50"
          >
            <div className="rounded-lg bg-cyan-500/20 p-2">
              <Users className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="font-medium text-white">Convidar Parceiro</p>
              <p className="text-sm text-slate-400">Link de indicação</p>
            </div>
          </Link>

          <Link
            href="/partners/commissions"
            className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-green-500 hover:bg-slate-700/50"
          >
            <div className="rounded-lg bg-green-500/20 p-2">
              <Gift className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-white">Comissões</p>
              <p className="text-sm text-slate-400">Histórico de ganhos</p>
            </div>
          </Link>

          <Link
            href="/partners/analytics"
            className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-purple-500 hover:bg-slate-700/50"
          >
            <div className="rounded-lg bg-purple-500/20 p-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-white">Analytics</p>
              <p className="text-sm text-slate-400">Relatórios detalhados</p>
            </div>
          </Link>

          <Link
            href="/partners/settings"
            className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-amber-500 hover:bg-slate-700/50"
          >
            <div className="rounded-lg bg-amber-500/20 p-2">
              <Star className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-white">Configurações</p>
              <p className="text-sm text-slate-400">Personalizar perfil</p>
            </div>
          </Link>
        </div>

        {/* Info Box - Nexus Partners Pack */}
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-cyan-500/20 p-3">
              <Zap className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                Nexus Partners Pack - Protótipo Agentic
              </h3>
              <p className="mt-2 text-slate-300">
                Ferramenta IA Agentic SaaS oferecida por assinatura mensal. 
                Gerencie parceiros estratégicos, acompanhe métricas em tempo real 
                e escale suas operações com automação inteligente.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-400">
                  Assinatura Mensal
                </span>
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-400">
                  Planos até 48 meses
                </span>
                <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">
                  IA Agentic
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartnersDashboard;
