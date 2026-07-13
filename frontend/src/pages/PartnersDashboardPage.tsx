import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  calculateFallbackPartnerBenefits,
  createFallbackPartner,
  getFallbackPartner,
  getFallbackPartnerStats,
  listFallbackPartners,
  listFallbackTierConfigs,
  type FallbackPartner,
  type FallbackPartnerStats,
  type PartnerTier,
} from "@/lib/nexus-partners-fallback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnersDeliveryPanels from "@/components/PartnersDeliveryPanels";
import PartnersAccessGuard from "@/components/PartnersAccessGuard";
import PartnersPremiumOnboarding from "@/components/PartnersPremiumOnboarding";
import PartnersActivationWizard from "@/components/PartnersActivationWizard";
import PartnersRuntimeConsole from "@/components/PartnersRuntimeConsole";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  Crown,
  Diamond,
  DollarSign,
  Network,
  Plus,
  RefreshCw,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

type TierConfig = {
  tier: PartnerTier;
  label: string;
  color: string;
  icon: typeof Shield;
  minVolume: number;
  commissionRate: number;
};

const TIER_CONFIG: Record<PartnerTier, TierConfig> = {
  silver: {
    tier: "silver",
    label: "Silver",
    color: "#C0C0C0",
    icon: Shield,
    minVolume: 0,
    commissionRate: 0.05,
  },
  gold: {
    tier: "gold",
    label: "Gold",
    color: "#FFD700",
    icon: Star,
    minVolume: 5000,
    commissionRate: 0.08,
  },
  platinum: {
    tier: "platinum",
    label: "Platinum",
    color: "#E5E4E2",
    icon: Crown,
    minVolume: 20000,
    commissionRate: 0.12,
  },
  diamond: {
    tier: "diamond",
    label: "Diamond",
    color: "#B9F2FF",
    icon: Diamond,
    minVolume: 100000,
    commissionRate: 0.15,
  },
};

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "up",
  format = "number",
}: {
  title: string;
  value: number | string;
  change?: number;
  icon: typeof Users;
  trend?: "up" | "down";
  format?: "number" | "currency" | "percent";
}) {
  const formattedValue = useMemo(() => {
    if (typeof value === "string") return value;
    if (format === "currency") {
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    }
    if (format === "percent") {
      return `${value.toFixed(1)}%`;
    }
    return new Intl.NumberFormat("pt-BR").format(value);
  }, [format, value]);

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-2 text-2xl font-bold text-white">{formattedValue}</p>
            {change !== undefined && (
              <div className={`mt-2 inline-flex items-center gap-1 text-sm ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                {trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-quantum-cyan">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TierBadge({ tier }: { tier: PartnerTier }) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function TierProgress({ currentTier, currentVolume }: { currentTier: PartnerTier; currentVolume: number }) {
  const tiers: PartnerTier[] = ["silver", "gold", "platinum", "diamond"];
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = tiers[currentIndex + 1];

  if (!nextTier) {
    return (
      <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
        <Diamond className="mr-1 h-3 w-3" />
        Tier máximo alcançado
      </Badge>
    );
  }

  const currentMin = TIER_CONFIG[currentTier].minVolume;
  const nextMin = TIER_CONFIG[nextTier].minVolume;
  const progress = Math.min(100, ((currentVolume - currentMin) / Math.max(1, nextMin - currentMin)) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Progresso para {TIER_CONFIG[nextTier].label}</span>
        <span>{Math.max(0, progress).toFixed(1)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(0, progress)}%`,
            background: `linear-gradient(90deg, ${TIER_CONFIG[currentTier].color}, ${TIER_CONFIG[nextTier].color})`,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>Atual: R$ {currentVolume.toLocaleString("pt-BR")}</span>
        <span>Meta: R$ {nextMin.toLocaleString("pt-BR")}</span>
      </div>
    </div>
  );
}

function TierDistributionChart({ distribution }: { distribution: FallbackPartnerStats["tierDistribution"] }) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-3">
      {(Object.entries(distribution) as Array<[PartnerTier, number]>).map(([tier, count]) => {
        const config = TIER_CONFIG[tier];
        const Icon = config.icon;
        const percentage = total ? (count / total) * 100 : 0;

        return (
          <div key={tier} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: config.color }} />
                <span className="text-slate-300">{config.label}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>{count}</span>
                <span className="w-12 text-right">{percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: config.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GrowthAlgorithmCard({ partnerId, fallbackMode, revision }: { partnerId: number; fallbackMode: boolean; revision: number }) {
  const benefitsQuery = trpc.partners.calculatePartnerBenefits.useQuery({ partnerId }, { enabled: !fallbackMode });

  const benefits = useMemo(() => {
    if (!fallbackMode && benefitsQuery.data) {
      return {
        ...benefitsQuery.data,
        currentBenefits: (benefitsQuery.data as { currentBenefits?: string[]; tierBenefits?: string[] }).currentBenefits
          ?? (benefitsQuery.data as { currentBenefits?: string[]; tierBenefits?: string[] }).tierBenefits
          ?? [],
      };
    }
    return calculateFallbackPartnerBenefits(partnerId);
  }, [benefitsQuery.data, fallbackMode, partnerId, revision]);

  if ((benefitsQuery.isLoading && !fallbackMode) || !benefits) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-1/3 rounded bg-slate-700" />
            <div className="h-8 rounded bg-slate-700" />
            <div className="h-4 w-2/3 rounded bg-slate-700" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const commissionRate = (benefits.totalCommissionRate * 100).toFixed(2);

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Zap className="h-5 w-5 text-amber-300" />
          Crescimento exponencial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-center">
          <p className="text-sm text-slate-400">Taxa de comissão efetiva</p>
          <p className="mt-2 text-3xl font-bold text-white">{commissionRate}%</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
            <p className="text-xs text-slate-500">Volume</p>
            <p className="mt-1 text-lg font-bold text-cyan-300">{(benefits.volumeMultiplier * 100).toFixed(0)}%</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
            <p className="text-xs text-slate-500">Rede</p>
            <p className="mt-1 text-lg font-bold text-emerald-300">+{(benefits.networkBonus * 100).toFixed(1)}%</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
            <p className="text-xs text-slate-500">Indicação</p>
            <p className="mt-1 text-lg font-bold text-amber-300">+{(benefits.referralBonus * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-purple-200">
            <Target className="h-4 w-4" />
            Potencial de crescimento
          </div>
          <TierBadge tier={benefits.tier as PartnerTier} />
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-400">Benefícios ativos</p>
          <div className="flex flex-wrap gap-2">
            {benefits.currentBenefits.map((benefit) => (
              <Badge key={benefit} variant="outline" className="border-white/10 bg-black/20 text-slate-200">
                {benefit.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PartnersDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localRevision, setLocalRevision] = useState(0);

  const statsQuery = trpc.partners.stats.useQuery();
  const partnersQuery = trpc.partners.list.useQuery({
    tier: tierFilter !== "all" ? (tierFilter as never) : undefined,
    status: statusFilter !== "all" ? (statusFilter as never) : undefined,
    search: searchTerm || undefined,
    page: currentPage,
    limit: 12,
  });
  const partnerQuery = trpc.partners.get.useQuery({ id: selectedPartner ?? 0 }, { enabled: !!selectedPartner });
  const tierConfigsQuery = trpc.partners.listTierConfigs.useQuery();
  const createPartnerMutation = trpc.partners.create.useMutation({
    onSuccess: () => {
      void statsQuery.refetch();
      void partnersQuery.refetch();
      setIsCreateDialogOpen(false);
    },
  });

  const apiOffline = statsQuery.isError || partnersQuery.isError || tierConfigsQuery.isError;

  const stats = useMemo<FallbackPartnerStats>(() => {
    if (statsQuery.data) return statsQuery.data as FallbackPartnerStats;
    // ONDA 27: sem fallback fictício. Se não há dados, mostrar zeros reais.
    return {
      totalPartners: 0,
      activePartners: 0,
      inactivePartners: 0,
      totalVolume: 0,
      totalCommissions: 0,
      averageTier: "silver",
      tierDistribution: { silver: 0, gold: 0, platinum: 0, diamond: 0 },
      topPerformers: [],
      growthRate: 0,
      averageVolumePerPartner: 0,
    } as FallbackPartnerStats;
  }, [statsQuery.data, localRevision]);

  const partnersList = useMemo(() => {
    if (partnersQuery.data) return partnersQuery.data;
    // ONDA 27: sem fallback fictício. Se não há dados, retornar lista vazia real.
    return { partners: [], total: 0, page: 1, pageSize: 12, totalPages: 0 } as any;
  }, [partnersQuery.data, tierFilter, statusFilter, searchTerm, currentPage, localRevision]);

  const selectedPartnerData = useMemo<FallbackPartner | null>(() => {
    if (partnerQuery.data) return partnerQuery.data as FallbackPartner;
    if (!selectedPartner) return null;
    return getFallbackPartner(selectedPartner);
  }, [partnerQuery.data, selectedPartner, localRevision]);

  const tierConfigs = useMemo(() => {
    if (tierConfigsQuery.data) return tierConfigsQuery.data;
    return listFallbackTierConfigs();
  }, [tierConfigsQuery.data]);

  const handleRefresh = async () => {
    setIsLoading(true);
    if (apiOffline) {
      window.setTimeout(() => {
        setLocalRevision((current) => current + 1);
        setIsLoading(false);
      }, 350);
      return;
    }

    await Promise.all([statsQuery.refetch(), partnersQuery.refetch(), partnerQuery.refetch()]);
    setIsLoading(false);
  };

  const handleCreatePartner = (data: { userId: number; tier: string }) => {
    if (apiOffline) {
      createFallbackPartner(data);
      setLocalRevision((current) => current + 1);
      setIsCreateDialogOpen(false);
      return;
    }
    createPartnerMutation.mutate(data as never);
  };

  return (
    <PartnersAccessGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,229,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Nexus Partners Pack</Badge>
                <Badge className="border border-amber-400/30 bg-amber-400/10 text-amber-200">Painel operacional</Badge>
                <Badge className="border border-white/10 bg-white/5 text-slate-200">Tiers, comissões e crescimento</Badge>
              </div>
              <h1 className="flex items-center gap-3 text-3xl font-black text-white md:text-4xl">
                <Users className="h-8 w-8 text-quantum-cyan" />
                Painel Partners
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Console do Nexus Partners Pack para acompanhar parceiros, distribuição por tier, volume, comissão efetiva e potencial de crescimento da malha comercial.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-btn">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo parceiro
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-white/10 bg-slate-950 text-white">
                  <DialogHeader>
                    <DialogTitle>Criar novo parceiro</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Cadastro operacional do Nexus Partners Pack.
                    </DialogDescription>
                  </DialogHeader>
                  <CreatePartnerForm
                    onSubmit={handleCreatePartner}
                    isLoading={apiOffline ? isLoading : createPartnerMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        <PartnersActivationWizard />
        <PartnersPremiumOnboarding />

        {apiOffline && (
          <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Faça login para visualizar seu Nexus Partners Pack. Painel público exibe métricas reais zeradas até autenticação e/ou cadastro do primeiro parceiro.
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total de parceiros" value={stats.totalPartners} icon={Users} />
          <MetricCard
            title="Parceiros ativos"
            value={stats.activePartners}
            change={stats.totalPartners > 0 ? (stats.activePartners / stats.totalPartners) * 100 : 0}
            icon={CheckCircle}
            trend="up"
          />
          <MetricCard title="Volume total" value={stats.totalVolume} icon={DollarSign} format="currency" />
          <MetricCard title="Taxa de crescimento" value={stats.growthRate} icon={TrendingUp} format="percent" trend={stats.growthRate >= 0 ? "up" : "down"} />
        </section>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="border border-white/10 bg-white/5">
            <TabsTrigger value="dashboard"><BarChart3 className="mr-2 h-4 w-4" />Dashboard</TabsTrigger>
            <TabsTrigger value="partners"><Users className="mr-2 h-4 w-4" />Parceiros</TabsTrigger>
            <TabsTrigger value="algorithms"><Zap className="mr-2 h-4 w-4" />Algoritmos</TabsTrigger>
            <TabsTrigger value="tiers"><Award className="mr-2 h-4 w-4" />Tiers</TabsTrigger>
            <TabsTrigger value="materials"><Star className="mr-2 h-4 w-4" />Materiais</TabsTrigger>
            <TabsTrigger value="performance"><Activity className="mr-2 h-4 w-4" />Performance</TabsTrigger>
            <TabsTrigger value="runtime"><Shield className="mr-2 h-4 w-4" />Runtime & OpenAPI</TabsTrigger>
            <TabsTrigger value="apis"><Zap className="mr-2 h-4 w-4" />APIs do Agente</TabsTrigger>
            <TabsTrigger value="chatbot"><Network className="mr-2 h-4 w-4" />Chatbot</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Award className="h-5 w-5 text-amber-300" />
                    Distribuição por tier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TierDistributionChart distribution={stats.tierDistribution} />
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <DollarSign className="h-5 w-5 text-emerald-300" />
                    Volume médio por parceiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center">
                    <p className="text-4xl font-bold text-white">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.averageVolumePerPartner)}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">Baseado em {stats.totalPartners} parceiros</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Comissões totais</span>
                      <span className="font-semibold text-white">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.totalCommissions)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tier dominante</span>
                      <TierBadge tier={stats.averageTier} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Star className="h-5 w-5 text-yellow-300" />
                  Top performers
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {stats.topPerformers.map((performer, index) => (
                  <button
                    type="button"
                    key={performer.id}
                    onClick={() => setSelectedPartner(performer.id)}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-white/20 hover:bg-white/5"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rank {index + 1}</p>
                    <p className="mt-2 text-lg font-bold text-white">#{performer.id}</p>
                    <div className="mt-3"><TierBadge tier={performer.tier} /></div>
                    <p className="mt-4 text-sm text-slate-300">
                      Volume {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(performer.volume)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{performer.referralCount} indicações</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-[280px] flex-1">
                <Input
                  placeholder="Buscar por código, ID ou usuário..."
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                />
              </div>
              <Select value={tierFilter} onValueChange={(value) => { setTierFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[180px] border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Filtrar tier" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-950 text-white">
                  <SelectItem value="all">Todos os tiers</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[180px] border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-950 text-white">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="suspended">Suspensos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {partnersList.partners.map((partner) => (
                <button
                  type="button"
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner.id)}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-left backdrop-blur transition hover:-translate-y-0.5 hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{partner.referralCode}</p>
                      <p className="mt-1 text-xs text-slate-500">ID #{partner.id} · usuário {partner.userId}</p>
                    </div>
                    <TierBadge tier={partner.tier} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Volume</p>
                      <p className="mt-2 text-base font-bold text-white">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(partner.totalVolume)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Indicações</p>
                      <p className="mt-2 text-base font-bold text-white">{partner.referralCount}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <TierProgress currentTier={partner.tier} currentVolume={partner.totalVolume} />
                  </div>
                </button>
              ))}
            </div>

            {selectedPartnerData && (
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white">Parceiro selecionado</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Código</p>
                    <p className="mt-2 font-semibold text-white">{selectedPartnerData.referralCode}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tier</p>
                    <div className="mt-2"><TierBadge tier={selectedPartnerData.tier} /></div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Volume</p>
                    <p className="mt-2 font-semibold text-white">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedPartnerData.totalVolume)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                    <p className="mt-2 font-semibold capitalize text-white">{selectedPartnerData.status}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {partnersList.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="border-white/10 bg-white/5 text-white"
                >
                  Anterior
                </Button>
                <span className="px-4 text-sm text-slate-400">Página {currentPage} de {partnersList.totalPages}</span>
                <Button
                  variant="outline"
                  disabled={currentPage === partnersList.totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(partnersList.totalPages, page + 1))}
                  className="border-white/10 bg-white/5 text-white"
                >
                  Próxima
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="algorithms" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-amber-400/20 bg-amber-400/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-amber-300" />
                    Engine de crescimento exponencial
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-slate-500">Multiplicador de volume</p>
                    <p className="mt-2 text-2xl font-bold text-cyan-300">+5%</p>
                    <p className="mt-1 text-xs text-slate-400">a cada R$ 10 mil acima do mínimo</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-slate-500">Bônus de rede</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-300">+0,2%</p>
                    <p className="mt-1 text-xs text-slate-400">por bloco relevante de indicações</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-slate-500">Bônus de indicação</p>
                    <p className="mt-2 text-2xl font-bold text-amber-300">5–15%</p>
                    <p className="mt-1 text-xs text-slate-400">tier escalonado</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs text-slate-500">Potencial máximo</p>
                    <p className="mt-2 text-2xl font-bold text-purple-300">2x</p>
                    <p className="mt-1 text-xs text-slate-400">taxa efetiva</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-500/20 bg-purple-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="h-5 w-5 text-purple-300" />
                    Predictive scoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-3 text-slate-300"><Clock className="h-4 w-4" />Score de tempo</div>
                    <span className="font-semibold text-white">30%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-3 text-slate-300"><DollarSign className="h-4 w-4" />Score de volume</div>
                    <span className="font-semibold text-white">40%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-3 text-slate-300"><Network className="h-4 w-4" />Score de referrals</div>
                    <span className="font-semibold text-white">30%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {selectedPartner ? (
              <GrowthAlgorithmCard partnerId={selectedPartner} fallbackMode={apiOffline} revision={localRevision} />
            ) : (
              <Card className="border-white/10 bg-white/5">
                <CardContent className="p-6 text-sm text-slate-300">
                  Selecione um parceiro na aba <strong className="text-white">Parceiros</strong> ou em <strong className="text-white">Top performers</strong> para abrir o breakdown do algoritmo de crescimento.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tiers" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {tierConfigs.map((config) => {
                const tierKey = (config.tier ?? "silver") as PartnerTier;
                const visual = TIER_CONFIG[tierKey];
                const Icon = visual.icon;
                const count = stats.tierDistribution[tierKey] ?? 0;
                const benefits = (config.benefits as string[] | undefined) ?? [];
                const commissionRate = typeof config.commissionRate === "number" ? config.commissionRate : visual.commissionRate;
                const minVolume = typeof config.minVolume === "number" ? config.minVolume : visual.minVolume;

                return (
                  <Card key={tierKey} className="overflow-hidden border-white/10 bg-white/5">
                    <div className="h-2" style={{ backgroundColor: visual.color }} />
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${visual.color}20` }}>
                          <Icon className="h-5 w-5" style={{ color: visual.color }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{config.label ?? visual.label}</h3>
                          <p className="text-sm text-slate-400">{count} parceiros</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Volume mínimo</span>
                          <span className="text-white">R$ {minVolume.toLocaleString("pt-BR")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Taxa base</span>
                          <span className="text-emerald-300">{(commissionRate * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Benefícios</p>
                        <div className="flex flex-wrap gap-2">
                          {benefits.slice(0, 3).map((benefit) => (
                            <Badge key={benefit} variant="outline" className="border-white/10 bg-black/20 text-slate-200">
                              {benefit.replace(/_/g, " ")}
                            </Badge>
                          ))}
                          {benefits.length > 3 && (
                            <Badge variant="outline" className="border-white/10 bg-black/20 text-slate-400">
                              +{benefits.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="materials" className="space-y-6">
            <PartnersDeliveryPanels.Materials />
          </TabsContent>
          <TabsContent value="performance" className="space-y-6">
            <PartnersDeliveryPanels.Performance />
          </TabsContent>
          <TabsContent value="runtime" className="space-y-6">
            <PartnersRuntimeConsole />
          </TabsContent>
          <TabsContent value="apis" className="space-y-6">
            <PartnersDeliveryPanels.ApiBindings />
          </TabsContent>
          <TabsContent value="chatbot" className="space-y-6">
            <PartnersDeliveryPanels.Chatbot />
          </TabsContent>
        </Tabs>
        </div>
      </DashboardLayout>
    </PartnersAccessGuard>
  );
}

function CreatePartnerForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: { userId: number; tier: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({ userId: "", tier: "silver" });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ userId: Number(formData.userId), tier: formData.tier });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userId" className="text-slate-300">ID do usuário</Label>
        <Input
          id="userId"
          type="number"
          placeholder="Digite o ID do usuário"
          value={formData.userId}
          onChange={(event) => setFormData((current) => ({ ...current, userId: event.target.value }))}
          className="border-white/10 bg-white/5 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tier" className="text-slate-300">Tier</Label>
        <Select value={formData.tier} onValueChange={(value) => setFormData((current) => ({ ...current, tier: value }))}>
          <SelectTrigger className="border-white/10 bg-white/5 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-slate-950 text-white">
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
            <SelectItem value="diamond">Diamond</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading} className="gradient-btn w-full">
        {isLoading ? "Criando..." : "Criar parceiro"}
      </Button>
    </form>
  );
}
