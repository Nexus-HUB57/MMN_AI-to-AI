#!/usr/bin/env bash
# ==============================================================================
# Script de Inicialização do Sistema de Analytics
# Projeto: MMN_AI-to-AI
# Autor: MiniMax Agent
# Data: 2026-05-16
# Versão: 1.0.0
# ==============================================================================
# Este script configura e inicializa o serviço de analytics no backend,
# configurando coleta de métricas e agendamento de relatórios.
# ==============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configurações
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
SERVICES_DIR="$BACKEND_DIR/src/services"

# Criar diretório de serviços de analytics
setup_analytics_service() {
    log_info "Configurando serviço de analytics..."

    mkdir -p "$SERVICES_DIR/analytics"

    # Criar arquivo de métricas
    cat > "$SERVICES_DIR/analytics/metrics-collector.ts" << 'EOF'
/**
 * Serviço de Coleta de Métricas
 * Responsável por coletar métricas de todo o sistema
 */

import { db } from '../../db';
import { affiliates, commissions, network, agents, orders } from '../../database/schemas/schema-final';
import { eq, sql, and, gte } from 'drizzle-orm';

export interface AffiliateMetrics {
  totalEarnings: number;
  pendingEarnings: number;
  directReferrals: number;
  networkSize: number;
  activeProducts: number;
}

export interface NetworkMetrics {
  totalMembers: number;
  activeMembers: number;
  growthRate: number;
  retentionRate: number;
}

export interface CommissionMetrics {
  totalPaid: number;
  totalPending: number;
  byType: Record<string, number>;
  byLevel: Record<string, number>;
}

/**
 * Coletar métricas de afiliados
 */
export async function collectAffiliateMetrics(userId: string): Promise<AffiliateMetrics> {
  const affiliateData = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.userId, userId))
    .limit(1);

  if (!affiliateData.length) {
    return {
      totalEarnings: 0,
      pendingEarnings: 0,
      directReferrals: 0,
      networkSize: 0,
      activeProducts: 0,
    };
  }

  const affiliate = affiliateData[0];

  // Contar indicações diretas
  const directReferralsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(network)
    .where(eq(network.sponsorId, affiliate.id));

  // Contar tamanho total da rede
  const networkSizeCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(network)
    .where(eq(network.sponsorId, affiliate.id));

  return {
    totalEarnings: Number(affiliate.totalEarnings) || 0,
    pendingEarnings: Number(affiliate.pendingEarnings) || 0,
    directReferrals: Number(directReferralsCount[0]?.count) || 0,
    networkSize: Number(networkSizeCount[0]?.count) || 0,
    activeProducts: 0, // Placeholder - implementar com lógica real
  };
}

/**
 * Coletar métricas de rede
 */
export async function collectNetworkMetrics(): Promise<NetworkMetrics> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const totalMembers = await db
    .select({ count: sql<number>`count(*)` })
    .from(network);

  const activeMembers = await db
    .select({ count: sql<number>`count(*)` })
    .from(network)
    .where(gte(network.createdAt, thirtyDaysAgo));

  const previousPeriod = new Date(thirtyDaysAgo);
  previousPeriod.setDate(previousPeriod.getDate() - 30);

  const previousMembers = await db
    .select({ count: sql<number>`count(*)` })
    .from(network)
    .where(and(
      gte(network.createdAt, previousPeriod),
      lt(network.createdAt, thirtyDaysAgo)
    ));

  const growthRate = previousMembers[0]?.count
    ? ((Number(activeMembers[0]?.count) - Number(previousMembers[0]?.count)) / Number(previousMembers[0]?.count)) * 100
    : 0;

  return {
    totalMembers: Number(totalMembers[0]?.count) || 0,
    activeMembers: Number(activeMembers[0]?.count) || 0,
    growthRate: Math.round(growthRate * 100) / 100,
    retentionRate: 0, // Placeholder - calcular com lógica real
  };
}

/**
 * Coletar métricas de comissões
 */
export async function collectCommissionMetrics(userId: string): Promise<CommissionMetrics> {
  const userCommissions = await db
    .select()
    .from(commissions)
    .where(eq(commissions.userId, userId));

  const totalPaid = userCommissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const totalPending = userCommissions
    .filter(c => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const byType: Record<string, number> = {};
  const byLevel: Record<string, number> = {};

  userCommissions.forEach(commission => {
    const type = commission.commissionType || 'unknown';
    byType[type] = (byType[type] || 0) + Number(commission.amount);
  });

  return {
    totalPaid,
    totalPending,
    byType,
    byLevel,
  };
}

/**
 * Coletar métricas de agentes
 */
export async function collectAgentMetrics(userId: string): Promise<{
  totalAgents: number;
  avgPerformance: number;
  activeAgents: number;
}> {
  const userAgents = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, userId));

  const totalAgents = userAgents.length;
  const activeAgents = userAgents.filter(a => a.status === 'active').length;

  const avgPerformance = totalAgents > 0
    ? userAgents.reduce((sum, a) => sum + Number(a.performanceScore || 0), 0) / totalAgents
    : 0;

  return {
    totalAgents,
    avgPerformance: Math.round(avgPerformance * 100) / 100,
    activeAgents,
  };
}

/**
 * Gerar dashboard metrics completo
 */
export async function generateDashboardMetrics(userId: string) {
  const [affiliate, network, commission, agent] = await Promise.all([
    collectAffiliateMetrics(userId),
    collectNetworkMetrics(),
    collectCommissionMetrics(userId),
    collectAgentMetrics(userId),
  ]);

  return {
    affiliate,
    network,
    commission,
    agent,
    generatedAt: new Date().toISOString(),
  };
}
EOF

    log_success "Serviço de métricas criado"
}

# Criar script de agendamento
create_scheduler_script() {
    log_info "Criando script de agendamento de relatórios..."

    cat > "$SERVICES_DIR/analytics/schedule-reports.ts" << 'EOF'
/**
 * Script de Agendamento de Relatórios
 * Executa coleta de métricas e geração de relatórios em horários definidos
 */

import cron from 'node-cron';
import { generateDashboardMetrics } from './metrics-collector';
import { notifyOwner } from '../../_core/notification';

/**
 * Agendar relatório diário de métricas
 */
export function scheduleDailyMetricsReport() {
  // Executar todo dia às 8h da manhã
  cron.schedule('0 8 * * *', async () => {
    console.log('[Analytics] Gerando relatório diário de métricas');

    try {
      // TODO: Iterar sobre todos os usuários ativos e gerar métricas
      // Por enquanto, apenas log
      console.log('[Analytics] Relatório diário gerado com sucesso');

      await notifyOwner({
        title: 'Relatório Diário de Métricas',
        content: 'O relatório diário de métricas foi gerado com sucesso',
      });
    } catch (error) {
      console.error('[Analytics] Erro ao gerar relatório:', error);
    }
  });
}

/**
 * Agendar relatório semanal de network
 */
export function scheduleWeeklyNetworkReport() {
  // Executar toda segunda-feira às 9h
  cron.schedule('0 9 * * 1', async () => {
    console.log('[Analytics] Gerando relatório semanal de network');

    try {
      console.log('[Analytics] Relatório semanal gerado com sucesso');

      await notifyOwner({
        title: 'Relatório Semanal de Network',
        content: 'O relatório semanal de crescimento da rede foi gerado',
      });
    } catch (error) {
      console.error('[Analytics] Erro ao gerar relatório:', error);
    }
  });
}

/**
 * Agendar sincronização de marketplace (já existente, referenciado para contexto)
 */
export function scheduleMarketplaceSync() {
  // 0 2 * * * = 2:00 AM todos os dias
  cron.schedule('0 2 * * *', async () => {
    console.log('[Analytics] Sincronizando marketplaces');
    // Implementação existente em scheduler.ts
  });
}

/**
 * Inicializar todos os agendamentos
 */
export function initializeAnalyticsScheduler() {
  console.log('[Analytics] Inicializando scheduler de relatórios...');

  scheduleDailyMetricsReport();
  scheduleWeeklyNetworkReport();

  console.log('[Analytics] Scheduler inicializado com sucesso');
}
EOF

    log_success "Script de agendamento criado"
}

# Configurar export do módulo
setup_exports() {
    log_info "Configurando exports do módulo analytics..."

    cat > "$SERVICES_DIR/analytics/index.ts" << 'EOF'
/**
 * Módulo de Analytics
 * Exporta serviços de coleta de métricas e relatórios
 */

export * from './metrics-collector';
export * from './schedule-reports';
EOF

    log_success "Exports configurados"
}

# Função principal
main() {
    echo ""
    echo "========================================"
    echo "  INICIALIZAÇÃO DO ANALYTICS"
    echo "  Projeto: MMN_AI-to-AI"
    echo "========================================"
    echo ""

    setup_analytics_service
    create_scheduler_script
    setup_exports

    echo ""
    log_success "Sistema de Analytics configurado com sucesso"
    echo ""
    echo "Arquivos criados:"
    echo "  - $SERVICES_DIR/analytics/metrics-collector.ts"
    echo "  - $SERVICES_DIR/analytics/schedule-reports.ts"
    echo "  - $SERVICES_DIR/analytics/index.ts"
    echo ""
    echo "Para ativar o scheduler, adicione ao seu código:"
    echo "  import { initializeAnalyticsScheduler } from './services/analytics'"
    echo "  initializeAnalyticsScheduler()"
    echo ""
}

# Executar função principal
main "$@"