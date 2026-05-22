"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Gift,
  Star,
  Award,
  TrendingUp,
  Zap,
  Crown,
  Cpu,
} from "lucide-react";
import TopSponsors from "./TopSponsors";
import { trpc } from "@/lib/trpc";

interface BonusGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: string;
  rewardType: "cash" | "prize" | "percentage";
  icon: React.ReactNode;
  category: "network" | "sales" | "leadership" | "achievement";
  deadline?: Date;
  status: "active" | "completed" | "expired";
}

interface BonusStats {
  totalCommissions: number;
  pendingCommissions: number;
  availableCommissions: number;
  recentSalesVolume: number;
  averageTicket: number;
}

const orderDate = (value: unknown) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const shouldFormatProgressAsCurrency = (bonus: BonusGoal) =>
  bonus.maxProgress >= 1000;

export default function BonusPage() {
  const [selectedBonus, setSelectedBonus] = useState<BonusGoal | null>(null);

  const { data: profile, isLoading: isLoadingProfile } =
    trpc.mmn.getProfile.useQuery();
  const { data: statsData, isLoading: isLoadingStats } =
    trpc.mmn.getStats.useQuery(undefined, {
      enabled: !!profile,
    });
  const { data: directReferrals = [], isLoading: isLoadingReferrals } =
    trpc.mmn.getDirectReferrals.useQuery(undefined, {
      enabled: !!profile,
    });
  const { data: recentOrders = [], isLoading: isLoadingOrders } =
    trpc.mmn.getRecentOrders.useQuery(undefined, {
      enabled: !!profile,
    });
  const { data: dashboardMetrics } = trpc.dashboard.getMetrics.useQuery(
    undefined,
    {
      enabled: !!profile,
    },
  );

  const loading =
    isLoadingProfile || isLoadingStats || isLoadingReferrals || isLoadingOrders;

  const paidLikeOrders = useMemo(
    () =>
      recentOrders.filter((order: any) =>
        ["confirmed", "shipped", "delivered"].includes(String(order.status)),
      ),
    [recentOrders],
  );

  const salesVolume = useMemo(
    () =>
      paidLikeOrders.reduce(
        (sum: number, order: any) => sum + Number(order.amount ?? 0),
        0,
      ),
    [paidLikeOrders],
  );

  const averageTicket =
    paidLikeOrders.length > 0 ? salesVolume / paidLikeOrders.length : 0;
  const totalCommissions = Number(
    statsData?.total ?? profile?.totalCommissions ?? 0,
  );
  const pendingCommissions = Number(
    statsData?.pending ?? profile?.pendingCommissions ?? 0,
  );
  const availableCommissions = Math.max(
    totalCommissions - pendingCommissions,
    0,
  );
  const agentIsActive = dashboardMetrics?.agent?.status === "active";

  const stats = useMemo<BonusStats>(
    () => ({
      totalCommissions,
      pendingCommissions,
      availableCommissions,
      recentSalesVolume: salesVolume,
      averageTicket,
    }),
    [
      averageTicket,
      availableCommissions,
      pendingCommissions,
      salesVolume,
      totalCommissions,
    ],
  );

  const bonuses = useMemo<BonusGoal[]>(() => {
    const fastStartStatus =
      directReferrals.length >= 5 ? "completed" : "active";
    const salesStatus = salesVolume >= 50000 ? "completed" : "active";
    const consistencyProgress = Math.min(paidLikeOrders.length, 10);
    const consistencyStatus =
      consistencyProgress >= 10 ? "completed" : "active";
    const walletStatus = availableCommissions >= 10000 ? "completed" : "active";
    const agentStatus = agentIsActive ? "completed" : "active";

    return [
      {
        id: "bonus-fast-start",
        title: "Bônus de Início Rápido",
        description:
          "Atinja 5 novos afiliados diretos para acelerar a expansão da rede.",
        progress: directReferrals.length,
        maxProgress: 5,
        reward: "R$ 500,00",
        rewardType: "cash",
        icon: <TrendingUp className="text-neon-cyan" />,
        category: "network",
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: fastStartStatus,
      },
      {
        id: "bonus-sales-volume",
        title: "Prêmio Esmeralda",
        description:
          "Consolide volume recente de vendas para capturar campanhas de maior escala.",
        progress: salesVolume,
        maxProgress: 50000,
        reward: "Viagem para Resort",
        rewardType: "prize",
        icon: <Award className="text-neon-pink" />,
        category: "sales",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: salesStatus,
      },
      {
        id: "bonus-consistency",
        title: "Bônus de Consistência",
        description:
          "Mantenha um bloco sólido de pedidos confirmados para aumentar previsibilidade operacional.",
        progress: consistencyProgress,
        maxProgress: 10,
        reward: "R$ 2.000,00",
        rewardType: "cash",
        icon: <Zap className="text-yellow-400" />,
        category: "sales",
        status: consistencyStatus,
      },
      {
        id: "bonus-wallet",
        title: "Meta de Caixa Operacional",
        description:
          "Alcance saldo disponível robusto para reinvestimento, tráfego e escala da operação.",
        progress: availableCommissions,
        maxProgress: 10000,
        reward: "Participação estratégica",
        rewardType: "percentage",
        icon: <Crown className="text-purple-500" />,
        category: "achievement",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: walletStatus,
      },
      {
        id: "bonus-agent",
        title: "Ativação do Agente IA",
        description:
          "Coloque o agente em modo ativo para iniciar ciclos reais de produtividade assistida.",
        progress: agentIsActive ? 1 : 0,
        maxProgress: 1,
        reward: "Boost operacional",
        rewardType: "prize",
        icon: <Cpu className="text-green-400" />,
        category: "leadership",
        status: agentStatus,
      },
    ];
  }, [
    agentIsActive,
    availableCommissions,
    directReferrals.length,
    paidLikeOrders.length,
    salesVolume,
  ]);

  const getProgressPercentage = (bonus: BonusGoal): number => {
    return Math.min(
      100,
      Math.round((bonus.progress / bonus.maxProgress) * 100),
    );
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-purple-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getDaysRemaining = (deadline?: Date): number | null => {
    if (!deadline) return null;
    const diff = deadline.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const latestOrderDate = useMemo(() => {
    const dates = recentOrders
      .map((order: any) => orderDate(order.createdAt))
      .filter(Boolean) as Date[];
    return dates.length > 0
      ? dates.sort((a, b) => b.getTime() - a.getTime())[0]
      : null;
  }, [recentOrders]);

  const activeBonuses = bonuses.filter((b) => b.status === "active");
  const completedBonuses = bonuses.filter((b) => b.status === "completed");

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
          <p className="text-neon-cyan font-space-mono">
            Carregando metas operacionais...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-orbitron font-bold text-glow-pink">
          Bônus e Prêmios
        </h1>
        <p className="text-neon-cyan font-space-mono">
          Metas agora conectadas ao estado real da carteira, rede, pedidos
          recentes e status do agente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hud-frame bg-black/40 border-neon-cyan/30">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-text-secondary uppercase font-space-mono mb-2">
              Total de Comissões
            </p>
            <p className="text-2xl font-bold text-neon-cyan font-orbitron">
              {formatCurrency(stats.totalCommissions)}
            </p>
          </CardContent>
        </Card>

        <Card className="hud-frame bg-black/40 border-neon-pink/30">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-text-secondary uppercase font-space-mono mb-2">
              Pendentes
            </p>
            <p className="text-2xl font-bold text-neon-pink font-orbitron">
              {formatCurrency(stats.pendingCommissions)}
            </p>
          </CardContent>
        </Card>

        <Card className="hud-frame bg-black/40 border-green-500/30">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-text-secondary uppercase font-space-mono mb-2">
              Disponíveis
            </p>
            <p className="text-2xl font-bold text-green-500 font-orbitron">
              {formatCurrency(stats.availableCommissions)}
            </p>
          </CardContent>
        </Card>

        <Card className="hud-frame bg-black/40 border-yellow-500/30">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-text-secondary uppercase font-space-mono mb-2">
              Volume Recente
            </p>
            <p className="text-2xl font-bold text-yellow-500 font-orbitron">
              {formatCurrency(stats.recentSalesVolume)}
            </p>
          </CardContent>
        </Card>

        <Card className="hud-frame bg-black/40 border-purple-500/30">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-text-secondary uppercase font-space-mono mb-2">
              Ticket Médio
            </p>
            <p className="text-2xl font-bold text-purple-500 font-orbitron">
              {formatCurrency(stats.averageTicket)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-orbitron text-white flex items-center gap-2">
            <Gift className="text-neon-pink" /> Metas Ativas (
            {activeBonuses.length})
          </h2>

          {activeBonuses.length > 0 ? (
            <div className="grid gap-6">
              {activeBonuses.map((bonus) => {
                const percentage = getProgressPercentage(bonus);
                const daysRemaining = getDaysRemaining(bonus.deadline);

                return (
                  <Card
                    key={bonus.id}
                    className="hud-frame bg-black/40 border-neon-cyan/30 cursor-pointer hover:border-neon-cyan/60 transition-all"
                    onClick={() => setSelectedBonus(bonus)}
                  >
                    <div className="corner-bracket top-left"></div>
                    <div className="corner-bracket top-right"></div>
                    <div className="corner-bracket bottom-left"></div>
                    <div className="corner-bracket bottom-right"></div>

                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-black/60 rounded-lg border border-neon-cyan/20">
                          {bonus.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-orbitron text-white">
                            {bonus.title}
                          </CardTitle>
                          <p className="text-sm text-text-secondary font-space-mono">
                            {bonus.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-secondary uppercase font-space-mono">
                          Prêmio
                        </p>
                        <p className="text-lg font-bold text-neon-pink font-orbitron">
                          {bonus.reward}
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-space-mono">
                          <span className="text-neon-cyan">Progresso</span>
                          <span className="text-white">{percentage}%</span>
                        </div>
                        <Progress
                          value={percentage}
                          className={`h-2 bg-black/60 ${getProgressColor(percentage)}`}
                        />
                        <p className="text-xs text-text-secondary font-space-mono">
                          {shouldFormatProgressAsCurrency(bonus)
                            ? `${formatCurrency(bonus.progress)} de ${formatCurrency(bonus.maxProgress)}`
                            : `${bonus.progress} de ${bonus.maxProgress}`}
                        </p>
                      </div>

                      {daysRemaining !== null && (
                        <div className="flex items-center gap-2 p-2 bg-black/60 rounded border border-yellow-500/20">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <p className="text-xs text-yellow-500 font-space-mono">
                            {daysRemaining} dias restantes
                          </p>
                        </div>
                      )}

                      <Button className="w-full btn-neon-cyan font-orbitron text-xs">
                        VER DETALHES DA META
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="hud-frame bg-black/40 border-neon-cyan/30">
              <CardContent className="pt-6 text-center">
                <p className="text-text-secondary font-space-mono">
                  Nenhuma meta ativa no momento
                </p>
              </CardContent>
            </Card>
          )}

          {completedBonuses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-orbitron text-green-500 flex items-center gap-2">
                <Trophy className="text-green-500" /> Metas Completadas (
                {completedBonuses.length})
              </h3>
              <div className="grid gap-4">
                {completedBonuses.map((bonus) => (
                  <Card
                    key={bonus.id}
                    className="hud-frame bg-black/40 border-green-500/30"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
                            {bonus.icon}
                          </div>
                          <div>
                            <p className="font-orbitron text-green-500">
                              {bonus.title}
                            </p>
                            <p className="text-sm text-text-secondary font-space-mono">
                              Prêmio: {bonus.reward}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-500 font-orbitron">
                            ✓ Completada
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-orbitron text-white flex items-center gap-2">
            <Star className="text-yellow-500" /> Top Patrocinadores
          </h2>
          <TopSponsors />

          <Card className="hud-frame bg-black/40 border-neon-cyan/30">
            <CardHeader>
              <CardTitle className="text-lg font-orbitron text-white">
                Leituras Operacionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm font-space-mono text-text-secondary">
              <p>
                Indicados diretos rastreados:{" "}
                <span className="text-white">{directReferrals.length}</span>
              </p>
              <p>
                Pedidos recentes considerados:{" "}
                <span className="text-white">{recentOrders.length}</span>
              </p>
              <p>
                Status do agente:{" "}
                <span className="text-white">
                  {agentIsActive ? "ativo" : "configurando"}
                </span>
              </p>
              <p>
                Último pedido:{" "}
                <span className="text-white">
                  {latestOrderDate
                    ? latestOrderDate.toLocaleDateString("pt-BR")
                    : "sem registros"}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedBonus && (
        <Card className="fixed inset-0 z-50 m-4 max-w-2xl mx-auto my-auto hud-frame bg-black/95 border-neon-cyan/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black/60 rounded-lg border border-neon-cyan/20">
                {selectedBonus.icon}
              </div>
              <div>
                <CardTitle className="text-2xl font-orbitron text-white">
                  {selectedBonus.title}
                </CardTitle>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedBonus(null)}
              className="text-neon-cyan border-neon-cyan/30"
            >
              ✕
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-text-secondary font-space-mono">
              {selectedBonus.description}
            </p>

            <div className="space-y-3">
              <div className="flex justify-between text-sm font-space-mono">
                <span className="text-neon-cyan">Progresso</span>
                <span className="text-white">
                  {getProgressPercentage(selectedBonus)}%
                </span>
              </div>
              <Progress
                value={getProgressPercentage(selectedBonus)}
                className={`h-3 bg-black/60 ${getProgressColor(getProgressPercentage(selectedBonus))}`}
              />
              <p className="text-xs text-text-secondary font-space-mono">
                {shouldFormatProgressAsCurrency(selectedBonus)
                  ? `${formatCurrency(selectedBonus.progress)} de ${formatCurrency(selectedBonus.maxProgress)}`
                  : `${selectedBonus.progress} de ${selectedBonus.maxProgress}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-black/60 rounded border border-neon-cyan/20">
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Tipo de Prêmio
                </p>
                <p className="font-bold text-neon-pink font-orbitron">
                  {selectedBonus.reward}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Categoria
                </p>
                <p className="font-bold text-neon-cyan font-orbitron capitalize">
                  {selectedBonus.category}
                </p>
              </div>
              {selectedBonus.deadline && (
                <div>
                  <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                    Prazo
                  </p>
                  <p className="font-bold text-yellow-500 font-orbitron">
                    {getDaysRemaining(selectedBonus.deadline)} dias
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-text-secondary uppercase font-space-mono mb-1">
                  Status
                </p>
                <p className="font-bold text-green-500 font-orbitron capitalize">
                  {selectedBonus.status}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-neon-cyan/20">
              <Button className="flex-1 btn-neon-cyan font-orbitron text-sm">
                Acompanhar Meta
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-neon-cyan/30 text-neon-cyan font-orbitron text-sm"
                onClick={() => setSelectedBonus(null)}
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
