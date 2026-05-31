/**
 * Nexus Partners Pack - Partners Dashboard Page
 * Dashboard completo com métricas em tempo real e algoritmos de crescimento exponencial
 */

import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users, TrendingUp, DollarSign, Award, Shield, Star, Crown, Diamond,
  ArrowUpRight, ArrowDownRight, Activity, Target, Zap, BarChart3,
  ChevronRight, Plus, Settings, RefreshCw, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, Percent, Network, AlertCircle
} from "lucide-react";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface PartnerTier {
  tier: 'silver' | 'gold' | 'platinum' | 'diamond';
  label: string;
  color: string;
  icon: typeof Shield;
  minVolume: number;
  commissionRate: number;
}

interface GrowthMetrics {
  volumeMultiplier: number;
  networkBonus: number;
  referralBonus: number;
  totalCommissionRate: number;
  growthPotential: {
    potentialTier: string;
    monthsToPromote: number;
    confidence: number;
  };
}

interface PartnerStats {
  totalPartners: number;
  activePartners: number;
  inactivePartners: number;
  totalVolume: number;
  totalCommissions: number;
  averageTier: string;
  tierDistribution: Record<string, number>;
  topPerformers: Array<{
    id: number;
    tier: string;
    volume: number;
    referralCount: number;
  }>;
  growthRate: number;
  averageVolumePerPartner: number;
}

// ============================================================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================================================

const TIER_CONFIG: Record<string, PartnerTier> = {
  silver: {
    tier: 'silver',
    label: 'Silver',
    color: '#C0C0C0',
    icon: Shield,
    minVolume: 0,
    commissionRate: 0.05,
  },
  gold: {
    tier: 'gold',
    label: 'Gold',
    color: '#FFD700',
    icon: Star,
    minVolume: 5000,
    commissionRate: 0.08,
  },
  platinum: {
    tier: 'platinum',
    label: 'Platinum',
    color: '#E5E4E2',
    icon: Crown,
    minVolume: 20000,
    commissionRate: 0.12,
  },
  diamond: {
    tier: 'diamond',
    label: 'Diamond',
    color: '#B9F2FF',
    icon: Diamond,
    minVolume: 100000,
    commissionRate: 0.15,
  },
};

const TIER_BENEFITS: Record<string, string[]> = {
  silver: ['dashboard_basic', 'reports_weekly', 'email_support'],
  gold: ['dashboard_advanced', 'reports_daily', 'priority_support', 'marketing_materials'],
  platinum: ['dashboard_advanced', 'reports_realtime', 'priority_support', 'marketing_materials', 'api_access', 'custom_integrations'],
  diamond: ['all_features', 'dedicated_account_manager', 'custom_reporting', 'early_access', 'beta_features', 'volume_discounts'],
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend = 'up',
  format = 'number'
}: {
  title: string;
  value: number | string;
  change?: number;
  icon: typeof Users;
  trend?: 'up' | 'down';
  format?: 'number' | 'currency' | 'percent';
}) {
  const formattedValue = useMemo(() => {
    if (typeof value === 'string') return value;
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('pt-BR').format(value);
    }
  }, [value, format]);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{formattedValue}</p>
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-slate-700/50 rounded-xl">
            <Icon className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.silver;
  const Icon = config.icon;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
    </div>
  );
}

function TierProgress({ currentTier, currentVolume }: { currentTier: string; currentVolume: number }) {
  const tiers: string[] = ['silver', 'gold', 'platinum', 'diamond'];
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = tiers[currentIndex + 1];

  if (!nextTier) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
          <Diamond className="w-3 h-3 mr-1" />
          Tier Máximo Alcançado
        </Badge>
      </div>
    );
  }

  const nextMinVolume = TIER_CONFIG[nextTier].minVolume;
  const currentMinVolume = TIER_CONFIG[currentTier].minVolume;
  const progress = Math.min(100, ((currentVolume - currentMinVolume) / (nextMinVolume - currentMinVolume)) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">Progresso para {TIER_CONFIG[nextTier].label}</span>
        <span className="text-slate-300">{progress.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${TIER_CONFIG[currentTier].color}, ${TIER_CONFIG[nextTier].color})`
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Atual: R$ {currentVolume.toLocaleString('pt-BR')}</span>
        <span>Meta: R$ {nextMinVolume.toLocaleString('pt-BR')}</span>
      </div>
    </div>
  );
}

function PartnerCard({ partner, onView }: { partner: any; onView: (id: number) => void }) {
  return (
    <div
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all cursor-pointer"
      onClick={() => onView(partner.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{partner.referralCode}</h3>
          <p className="text-sm text-slate-400">ID: {partner.id}</p>
        </div>
        <TierBadge tier={partner.tier} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Volume Total</p>
          <p className="text-lg font-semibold text-white">
            R$ {Number(partner.totalVolume).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Indicações</p>
          <p className="text-lg font-semibold text-white">{partner.referralCount}</p>
        </div>
      </div>

      <TierProgress currentTier={partner.tier} currentVolume={Number(partner.totalVolume)} />
    </div>
  );
}

function TierDistributionChart({ distribution }: { distribution: Record<string, number> }) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const percentages = Object.entries(distribution).map(([tier, count]) => ({
    tier,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));

  return (
    <div className="space-y-3">
      {percentages.map(({ tier, count, percentage }) => {
        const config = TIER_CONFIG[tier];
        const Icon = config.icon;

        return (
          <div key={tier} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <span className="text-slate-300">{config.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">{count}</span>
                <span className="text-slate-500 w-12 text-right">{percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${percentage}%`, backgroundColor: config.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GrowthAlgorithmCard({ partnerId }: { partnerId: number }) {
  const { data: benefits, isLoading } = trpc.partners.calculatePartnerBenefits.useQuery({ partnerId });

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-1/3" />
            <div className="h-8 bg-slate-700 rounded" />
            <div className="h-4 bg-slate-700 rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!benefits) return null;

  const commissionRate = (benefits.totalCommissionRate * 100).toFixed(2);

  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span>Crescimento Exponencial</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
          <p className="text-sm text-slate-400 mb-1">Taxa de Comissão Efetiva</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            {commissionRate}%
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-slate-700/20 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Volume</p>
            <p className="text-lg font-bold text-cyan-400">{(benefits.volumeMultiplier * 100).toFixed(0)}%</p>
          </div>
          <div className="text-center p-3 bg-slate-700/20 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Rede</p>
            <p className="text-lg font-bold text-emerald-400">+{(benefits.networkBonus * 100).toFixed(1)}%</p>
          </div>
          <div className="text-center p-3 bg-slate-700/20 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Indicação</p>
            <p className="text-lg font-bold text-amber-400">+{(benefits.referralBonus * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Potencial de Crescimento</span>
          </div>
          <p className="text-white font-semibold">
            Próximo tier: <TierBadge tier={benefits.tier} />
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-400 mb-2">Benefícios Ativos</p>
          <div className="flex flex-wrap gap-2">
            {benefits.currentBenefits.map((benefit, idx) => (
              <Badge key={idx} variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
                {benefit.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PartnersDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: stats, refetch: refetchStats } = trpc.partners.stats.useQuery();
  const { data: partnersList, refetch: refetchPartners } = trpc.partners.list.useQuery({
    tier: tierFilter !== 'all' ? tierFilter as any : undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    search: searchTerm || undefined,
    page: currentPage,
    limit: 12,
  });

  const { data: selectedPartnerData, refetch: refetchPartner } = trpc.partners.get.useQuery(
    { id: selectedPartner! },
    { enabled: !!selectedPartner }
  );

  const { data: tierConfigs } = trpc.partners.listTierConfigs.useQuery();

  const createPartnerMutation = trpc.partners.create.useMutation({
    onSuccess: () => {
      refetchPartners();
      refetchStats();
      setIsCreateDialogOpen(false);
    },
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTierChange = (value: string) => {
    setTierFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleViewPartner = (id: number) => {
    setSelectedPartner(id);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([refetchStats(), refetchPartners()]);
    setIsLoading(false);
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.08),transparent_45%),linear-gradient(180deg,#020617,#0f172a)] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quantum-cyan" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.08),transparent_45%),linear-gradient(180deg,#020617,#0f172a)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-quantum-cyan" />
              <span>Nexus Partners Pack</span>
            </h1>
            <p className="text-slate-400 mt-1">Dashboard de Parceiros Estratégicos com Crescimento Exponencial</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Parceiro
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Criar Novo Parceiro</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Preencha os dados para cadastrar um novo parceiro estratégico.
                  </DialogDescription>
                </DialogHeader>
                <CreatePartnerForm
                  onSubmit={(data) => createPartnerMutation.mutate(data)}
                  isLoading={createPartnerMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total de Parceiros" value={stats.totalPartners} icon={Users} />
          <MetricCard
            title="Parceiros Ativos"
            value={stats.activePartners}
            change={stats.totalPartners > 0 ? (stats.activePartners / stats.totalPartners) * 100 : 0}
            icon={CheckCircle}
            trend="up"
          />
          <MetricCard title="Volume Total" value={stats.totalVolume} icon={DollarSign} format="currency" />
          <MetricCard
            title="Taxa de Crescimento"
            value={stats.growthRate}
            icon={TrendingUp}
            format="percent"
            trend={stats.growthRate >= 0 ? 'up' : 'down'}
          />
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="partners" className="data-[state=active]:bg-slate-700">
              <Users className="w-4 h-4 mr-2" />
              Parceiros
            </TabsTrigger>
            <TabsTrigger value="algorithms" className="data-[state=active]:bg-slate-700">
              <Zap className="w-4 h-4 mr-2" />
              Algoritmos
            </TabsTrigger>
            <TabsTrigger value="tiers" className="data-[state=active]:bg-slate-700">
              <Award className="w-4 h-4 mr-2" />
              Tiers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Distribuição por Tier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TierDistributionChart distribution={stats.tierDistribution} />
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Volume Médio por Parceiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8">
                    <p className="text-4xl font-bold text-white mb-2">
                      R$ {stats.averageVolumePerPartner.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-slate-400">
                      Baseado em {stats.totalPartners} parceiros
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total de Comissões Pagas</span>
                      <span className="text-white font-medium">
                        R$ {stats.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Saldo em Commissionamento</span>
                      <span className="text-emerald-400 font-medium">
                        R$ {(stats.totalVolume * 0.1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Top 10 Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Rank</TableHead>
                      <TableHead className="text-slate-400">ID</TableHead>
                      <TableHead className="text-slate-400">Tier</TableHead>
                      <TableHead className="text-slate-400">Volume</TableHead>
                      <TableHead className="text-slate-400">Indicações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topPerformers.map((performer, index) => (
                      <TableRow key={performer.id} className="border-slate-700">
                        <TableCell className="font-medium text-white">
                          {index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '3' : `#${index + 1}`}
                        </TableCell>
                        <TableCell className="text-slate-300">#{performer.id}</TableCell>
                        <TableCell>
                          <TierBadge tier={performer.tier} />
                        </TableCell>
                        <TableCell className="text-white">
                          R$ {performer.volume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-slate-300">{performer.referralCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[300px]">
                <Input
                  placeholder="Buscar por código ou ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <Select value={tierFilter} onValueChange={handleTierChange}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Filtrar por tier" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todos os Tiers</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="suspended">Suspensos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partnersList?.partners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} onView={handleViewPartner} />
              ))}
            </div>

            {partnersList && partnersList.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="bg-slate-800 border-slate-700 text-white"
                >
                  Anterior
                </Button>
                <span className="text-slate-400 px-4">
                  Página {currentPage} de {partnersList.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === partnersList.totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="bg-slate-800 border-slate-700 text-white"
                >
                  Próxima
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="algorithms" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Engine de Crescimento Exponencial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Multiplicador de Volume</p>
                      <p className="text-2xl font-bold text-cyan-400">+5%</p>
                      <p className="text-xs text-slate-400 mt-1">a cada R$ 10k acima do mínimo</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Bônus de Rede</p>
                      <p className="text-2xl font-bold text-emerald-400">+0.2%</p>
                      <p className="text-xs text-slate-400 mt-1">por indicação acima de 50%</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Bônus de Indicação</p>
                      <p className="text-2xl font-bold text-amber-400">5-15%</p>
                      <p className="text-xs text-slate-400 mt-1">tier escalonado</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Potencial Máximo</p>
                      <p className="text-2xl font-bold text-purple-400">2x</p>
                      <p className="text-xs text-slate-400 mt-1">taxa de comissão</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <h4 className="font-medium text-white mb-3">Fórmula de Crescimento</h4>
                    <div className="font-mono text-sm text-cyan-400 bg-slate-900 p-3 rounded">
                      <p>TaxaEfetiva = (TaxaBase × MultiplicadorVolume) + BônusRede + BônusIndicação</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Predictive Scoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-300">Score de Tempo</span>
                      </div>
                      <span className="font-medium text-white">30%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-300">Score de Volume</span>
                      </div>
                      <span className="font-medium text-white">40%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Network className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-300">Score de Referrals</span>
                      </div>
                      <span className="font-medium text-white">30%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400">
                      O sistema calcula automaticamente o potencial de crescimento de cada parceiro
                      baseado em métricas históricas e projeta o tempo até a próxima promoção.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {selectedPartner && <GrowthAlgorithmCard partnerId={selectedPartner} />}
          </TabsContent>

          <TabsContent value="tiers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(TIER_CONFIG).map((config) => {
                const Icon = config.icon;
                const count = stats.tierDistribution[config.tier] || 0;

                return (
                  <Card key={config.tier} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: config.color }} />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: `${config.color}20` }}>
                          <Icon className="w-6 h-6" style={{ color: config.color }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{config.label}</h3>
                          <p className="text-sm text-slate-400">{count} parceiros</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Volume Mínimo</span>
                          <span className="text-white">R$ {config.minVolume.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Taxa Base</span>
                          <span className="text-emerald-400">{(config.commissionRate * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-xs text-slate-500 mb-2">Benefícios:</p>
                        <div className="flex flex-wrap gap-1">
                          {TIER_BENEFITS[config.tier]?.slice(0, 3).map((benefit) => (
                            <Badge key={benefit} variant="outline" className="text-xs" style={{ borderColor: config.color, color: config.color }}>
                              {benefit.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {(TIER_BENEFITS[config.tier]?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs text-slate-500">
                              +{(TIER_BENEFITS[config.tier]?.length || 0) - 3} mais
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
        </Tabs>
      </div>
    </div>
  );
}

function CreatePartnerForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: { userId: number; tier: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    userId: '',
    tier: 'silver',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      userId: parseInt(formData.userId, 10),
      tier: formData.tier,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="userId" className="text-slate-300">ID do Usuário</Label>
        <Input
          id="userId"
          type="number"
          placeholder="Digite o ID do usuário"
          value={formData.userId}
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          className="bg-slate-800 border-slate-700 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tier" className="text-slate-300">Tier</Label>
        <Select
          value={formData.tier}
          onValueChange={(value) => setFormData({ ...formData, tier: value })}
        >
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
            <SelectItem value="diamond">Diamond</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
      >
        {isLoading ? 'Criando...' : 'Criar Parceiro'}
      </Button>
    </form>
  );
}