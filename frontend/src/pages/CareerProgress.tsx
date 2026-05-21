/**
 * CareerProgress - Página de Progressão de Carreira e XP
 * Sistema de gamificação com 27 níveis organizados em 5 categorias
 */

import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import {
  Trophy,
  TrendingUp,
  Star,
  Zap,
  Award,
  Target,
  BarChart3,
  History,
  ChevronRight,
  Crown,
  Medal,
  Flame,
  Sparkles
} from "lucide-react";

const CATEGORY_CONFIG = {
  "Afiliado": { icon: Star, color: "text-blue-500", bg: "bg-blue-500/10" },
  "Preditivo": { icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
  "Generativo": { icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
  "Orquestrador": { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  "IA Agêntica": { icon: Sparkles, color: "text-rose-500", bg: "bg-rose-500/10" },
};

export default function CareerProgress() {
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard" | "history">("overview");

  const { data: xpData, isLoading: xpLoading } = trpc.xp.getMyXP.useQuery();
  const { data: careerLevels, isLoading: levelsLoading } = trpc.xp.getCareerLevels.useQuery();
  const { data: leaderboard, isLoading: leaderboardLoading } = trpc.xp.getLeaderboard.useQuery();

  const currentLevel = careerLevels?.find(l => l.id === xpData?.currentLevelId);
  const nextLevel = careerLevels?.find(l => l.id === (xpData?.currentLevelId ?? 0) + 1);

  const xpProgress = xpData && currentLevel && nextLevel
    ? ((xpData.totalXp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100
    : 0;

  const CategoryIcon = currentLevel
    ? CATEGORY_CONFIG[currentLevel.category as keyof typeof CATEGORY_CONFIG]?.icon || Star
    : Star;

  return (
    <main className="page-shell">
      <div className="topbar">
        <div>
          <span className="pill">Carreira</span>
          <h1>Progressão de Carreira</h1>
          <p className="lead compact">
            Acompanhe sua evolução no programa de milhas e desbloqueie novos níveis.
          </p>
        </div>
        <div className="cta-row">
          <Link href="/dashboard" className="btn btn-secondary">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <nav className="flex gap-2 mb-6">
        {[
          { id: "overview", label: "Visão Geral", icon: BarChart3 },
          { id: "leaderboard", label: "Ranking", icon: Trophy },
          { id: "history", label: "Histórico", icon: History },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-panel hover:bg-panel-hover"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Conteúdo Baseado na Tab */}
      {activeTab === "overview" && (
        <div className="grid gap-6">
          {/* Card Principal de Nível */}
          <section className="panel">
            <div className="flex items-center justify-between mb-6">
              <h2>Seu Nível Atual</h2>
              <span className={`pill ${currentLevel ? "bg-success/20 text-success" : "bg-muted"}`}>
                {currentLevel?.category || "Carregando..."}
              </span>
            </div>

            {xpLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-panel rounded-lg" />
              </div>
            ) : xpData && currentLevel ? (
              <div className="space-y-6">
                {/* Nível e Categoria */}
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full ${CATEGORY_CONFIG[currentLevel.category as keyof typeof CATEGORY_CONFIG]?.bg || "bg-panel"} flex items-center justify-center`}>
                    <CategoryIcon className={`w-8 h-8 ${CATEGORY_CONFIG[currentLevel.category as keyof typeof CATEGORY_CONFIG]?.color || "text-primary"}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{currentLevel.name}</h3>
                    <p className="text-muted">Nível {currentLevel.levelNumber} • {currentLevel.category}</p>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Progresso para {nextLevel?.name || " máximo"}</span>
                    <span className="font-medium">{xpData.totalXp.toLocaleString()} XP</span>
                  </div>
                  <div className="h-3 bg-panel rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${Math.min(xpProgress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>{currentLevel.minXp.toLocaleString()} XP</span>
                    <span>{nextLevel ? `${nextLevel.minXp.toLocaleString()} XP` : "Máximo"}</span>
                  </div>
                </div>

                {/* Stats Rápidas */}
                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{xpData.totalXp.toLocaleString()}</p>
                    <p className="text-xs text-muted">XP Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">{xpData.monthlyXp.toLocaleString()}</p>
                    <p className="text-xs text-muted">XP Mensal</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{xpData.rank || "-"}</p>
                    <p className="text-xs text-muted">Ranking</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">{currentLevel.bonusCommission}%</p>
                    <p className="text-xs text-muted">Bônus Com.</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted">Nenhum dado de XP disponível.</p>
            )}
          </section>

          {/* Detalhes por Categoria de Níveis */}
          {careerLevels && (
            <section className="panel">
              <h2 className="mb-4">Todos os Níveis de Carreira</h2>
              <div className="space-y-6">
                {["Afiliado", "Preditivo", "Generativo", "Orquestrador", "IA Agêntica"].map(category => {
                  const categoryLevels = careerLevels.filter(l => l.category === category);
                  const catConfig = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
                  const CatIcon = catConfig?.icon || Star;

                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CatIcon className={`w-5 h-5 ${catConfig?.color || "text-primary"}`} />
                        <h3 className="font-semibold">{category}</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {categoryLevels.map(level => {
                          const isCurrentLevel = level.id === xpData?.currentLevelId;
                          const isUnlocked = (xpData?.totalXp ?? 0) >= level.minXp;

                          return (
                            <div
                              key={level.id}
                              className={`p-3 rounded-lg border transition-all ${
                                isCurrentLevel
                                  ? "border-primary bg-primary/10"
                                  : isUnlocked
                                    ? "border-success/30 bg-success/5"
                                    : "border-border bg-panel opacity-60"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{level.name}</span>
                                {isCurrentLevel && <span className="text-xs pill bg-primary">Atual</span>}
                              </div>
                              <p className="text-xs text-muted">Nível {level.levelNumber}</p>
                              <p className="text-xs text-muted mt-1">
                                {level.minXp.toLocaleString()} XP • +{level.bonusCommission}% bônus
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Multiplicadores de XP */}
          <section className="panel">
            <h2 className="mb-4">Multiplicadores de XP</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { source: "Vendas", multiplier: "10x", color: "text-success" },
                { source: "Comissões", multiplier: "5x", color: "text-primary" },
                { source: "Bônus", multiplier: "15x", color: "text-accent" },
                { source: "Network", multiplier: "3x", color: "text-warning" },
              ].map(item => (
                <div key={item.source} className="p-4 bg-panel rounded-lg text-center">
                  <p className={`text-2xl font-bold ${item.color}`}>{item.multiplier}</p>
                  <p className="text-sm text-muted">{item.source}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <section className="panel">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-warning" />
            <h2>Ranking dos Top Afiliados</h2>
          </div>

          {leaderboardLoading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 bg-panel rounded-lg" />
              ))}
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const isTop3 = index < 3;
                const medalColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

                return (
                  <div
                    key={entry.affiliateId}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                      isTop3 ? "bg-warning/10" : "bg-panel hover:bg-panel-hover"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isTop3 ? `bg-warning/20 ${medalColors[index]}` : "bg-muted"
                    }`}>
                      {isTop3 ? (
                        <Medal className="w-5 h-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{entry.affiliateName}</p>
                      <p className="text-xs text-muted">{entry.currentLevelName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{entry.totalXp.toLocaleString()} XP</p>
                      <p className="text-xs text-muted">Nível {entry.currentLevelNumber}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted text-center py-8">Nenhum dado de ranking disponível.</p>
          )}
        </section>
      )}

      {activeTab === "history" && (
        <section className="panel">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-6 h-6 text-primary" />
            <h2>Histórico de Transações XP</h2>
          </div>

          <div className="text-center py-12">
            <Flame className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
            <p className="text-muted">
              Histórico detalhado de transações XP será implementado em breve.
            </p>
            <p className="text-sm text-muted mt-2">
              Acompanhe suas ganhos de XP por vendas, comissões, bônus e mais.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}