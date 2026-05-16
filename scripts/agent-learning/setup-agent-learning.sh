#!/usr/bin/env bash
# ==============================================================================
# Script de Configuração do Loop de Aprendizado de Agentes
# Projeto: MMN_AI-to-AI
# Autor: MiniMax Agent
# Data: 2026-05-16
# Versão: 1.0.0
# ==============================================================================
# Este script configura o sistema de aprendizado contínuo dos agentes,
# permitindo que aprendam e melhorem baseando-se em resultados de operações.
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

# Criar diretório de aprendizado
setup_learning_directory() {
    log_info "Configurando diretório de aprendizado..."

    mkdir -p "$SERVICES_DIR/agent-learning"
    log_success "Diretório de aprendizado criado"
}

# Criar serviço de registro de métricas
create_metrics_recorder() {
    log_info "Criando serviço de registro de métricas..."

    cat > "$SERVICES_DIR/agent-learning/metrics-recorder.ts" << 'EOF'
/**
 * Serviço de Registro de Métricas de Agentes
 * Responsável por registrar métricas detalhadas de cada operação do agente
 */

import { db } from '../../db';
import { nanoid } from 'nanoid';

export interface OperationMetric {
  agentId: string;
  operationType: string;
  success: boolean;
  executionTime: number;
  resultScore: number;
  parameters: Record<string, unknown>;
  context: Record<string, unknown>;
  timestamp: Date;
}

export interface PerformanceTrend {
  agentId: string;
  period: 'daily' | 'weekly' | 'monthly';
  avgScore: number;
  successRate: number;
  totalOperations: number;
  improvementRate: number;
}

/**
 * Registrar métrica de operação
 */
export async function recordOperationMetric(metric: Omit<OperationMetric, 'timestamp'>): Promise<string> {
  const id = nanoid();
  const timestamp = new Date();

  // TODO: Inserir no banco de dados
  // Por enquanto, apenas log
  console.log('[AgentLearning] Recording metric:', {
    id,
    ...metric,
    timestamp: timestamp.toISOString(),
  });

  return id;
}

/**
 * Registrar resultado de conteúdo gerado
 */
export async function recordContentResult(params: {
  agentId: string;
  contentId: string;
  platform: string;
  engagement: number;
  conversions: number;
  qualityScore: number;
}) {
  return recordOperationMetric({
    agentId: params.agentId,
    operationType: 'content_generation',
    success: params.qualityScore >= 0.5,
    executionTime: 0, // Placeholder
    resultScore: params.qualityScore,
    parameters: {
      contentId: params.contentId,
      platform: params.platform,
      engagement: params.engagement,
      conversions: params.conversions,
    },
    context: {
      qualityScore: params.qualityScore,
    },
  });
}

/**
 * Registrar resultado de venda
 */
export async function recordSaleResult(params: {
  agentId: string;
  orderId: string;
  affiliateId: string;
  commission: number;
  conversionTime: number;
}) {
  return recordOperationMetric({
    agentId: params.agentId,
    operationType: 'sale',
    success: params.commission > 0,
    executionTime: params.conversionTime,
    resultScore: params.commission > 0 ? 1 : 0,
    parameters: {
      orderId: params.orderId,
      affiliateId: params.affiliateId,
      commission: params.commission,
    },
    context: {},
  });
}

/**
 * Registrar resultado de prospecção
 */
export async function recordProspectingResult(params: {
  agentId: string;
  leadsGenerated: number;
  leadsQualified: number;
  conversionRate: number;
}) {
  return recordOperationMetric({
    agentId: params.agentId,
    operationType: 'prospecting',
    success: params.leadsQualified > 0,
    executionTime: 0,
    resultScore: params.conversionRate,
    parameters: {
      leadsGenerated: params.leadsGenerated,
      leadsQualified: params.leadsQualified,
    },
    context: {
      conversionRate: params.conversionRate,
    },
  });
}

/**
 * Buscar histórico de métricas de um agente
 */
export async function getAgentMetricsHistory(
  agentId: string,
  limit: number = 100
): Promise<OperationMetric[]> {
  // TODO: Implementar busca no banco de dados
  return [];
}

/**
 * Calcular tendência de performance de um agente
 */
export async function calculatePerformanceTrend(
  agentId: string,
  period: 'daily' | 'weekly' | 'monthly'
): Promise<PerformanceTrend> {
  const metrics = await getAgentMetricsHistory(agentId, 1000);

  if (metrics.length === 0) {
    return {
      agentId,
      period,
      avgScore: 0,
      successRate: 0,
      totalOperations: 0,
      improvementRate: 0,
    };
  }

  // Filtrar por período
  const now = new Date();
  const periodMs = {
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
  }[period];

  const periodStart = new Date(now.getTime() - periodMs);
  const periodMetrics = metrics.filter(m => m.timestamp >= periodStart);

  const avgScore = periodMetrics.reduce((sum, m) => sum + m.resultScore, 0) / periodMetrics.length;
  const successRate = (periodMetrics.filter(m => m.success).length / periodMetrics.length) * 100;

  // Calcular taxa de melhoria comparando com período anterior
  const previousStart = new Date(periodStart.getTime() - periodMs);
  const previousMetrics = metrics.filter(
    m => m.timestamp >= previousStart && m.timestamp < periodStart
  );

  const previousAvgScore = previousMetrics.length > 0
    ? previousMetrics.reduce((sum, m) => sum + m.resultScore, 0) / previousMetrics.length
    : avgScore;

  const improvementRate = previousAvgScore > 0
    ? ((avgScore - previousAvgScore) / previousAvgScore) * 100
    : 0;

  return {
    agentId,
    period,
    avgScore: Math.round(avgScore * 100) / 100,
    successRate: Math.round(successRate * 100) / 100,
    totalOperations: periodMetrics.length,
    improvementRate: Math.round(improvementRate * 100) / 100,
  };
}
EOF

    log_success "Serviço de registro de métricas criado"
}

# Criar serviço de análise de padrões
create_pattern_analyzer() {
    log_info "Criando serviço de análise de padrões..."

    cat > "$SERVICES_DIR/agent-learning/pattern-analyzer.ts" << 'EOF'
/**
 * Serviço de Análise de Padrões
 * Identifica padrões de sucesso e fracasso nas operações dos agentes
 */

import { getAgentMetricsHistory, OperationMetric } from './metrics-recorder';

export interface Pattern {
  id: string;
  type: 'timing' | 'content' | 'platform' | 'audience';
  description: string;
  successRate: number;
  sampleSize: number;
  confidence: number;
  recommendations: string[];
}

export interface ContentPattern {
  hashtags: string[];
  tone: string;
  length: number;
  callToAction: string;
  successRate: number;
}

export interface TimingPattern {
  bestHours: number[];
  bestDays: number[];
  avgEngagement: number;
}

/**
 * Analisar padrões de conteúdo bem-sucedido
 */
export async function analyzeContentPatterns(
  agentId: string
): Promise<ContentPattern[]> {
  const metrics = await getAgentMetricsHistory(agentId, 500);

  const contentMetrics = metrics.filter(m => m.operationType === 'content_generation');

  if (contentMetrics.length < 10) {
    return [];
  }

  // Agrupar por similaridade de contexto
  // Por enquanto, retornar padrão genérico
  return [{
    hashtags: [],
    tone: 'persuasive',
    length: 150,
    callToAction: 'link_click',
    successRate: contentMetrics
      .filter(m => m.success)
      .length / contentMetrics.length,
  }];
}

/**
 * Analisar padrões de timing
 */
export async function analyzeTimingPatterns(
  agentId: string
): Promise<TimingPattern> {
  const metrics = await getAgentMetricsHistory(agentId, 500);

  // Agrupar por hora e dia
  const hourStats: Record<number, { total: number; success: number }> = {};
  const dayStats: Record<number, { total: number; success: number }> = {};

  metrics.forEach(m => {
    const hour = m.timestamp.getHours();
    const day = m.timestamp.getDay();

    if (!hourStats[hour]) hourStats[hour] = { total: 0, success: 0 };
    if (!dayStats[day]) dayStats[day] = { total: 0, success: 0 };

    hourStats[hour].total++;
    dayStats[day].total++;

    if (m.success) {
      hourStats[hour].success++;
      dayStats[day].success++;
    }
  });

  const bestHours = Object.entries(hourStats)
    .filter(([_, stats]) => stats.total >= 5)
    .sort((a, b) => (b[1].success / b[1].total) - (a[1].success / a[1].total))
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  const bestDays = Object.entries(dayStats)
    .filter(([_, stats]) => stats.total >= 5)
    .sort((a, b) => (b[1].success / b[1].total) - (a[1].success / a[1].total))
    .slice(0, 3)
    .map(([day]) => parseInt(day));

  const avgEngagement = metrics.reduce((sum, m) => sum + m.resultScore, 0) / metrics.length;

  return {
    bestHours,
    bestDays,
    avgEngagement: Math.round(avgEngagement * 100) / 100,
  };
}

/**
 * Identificar correlações entre parâmetros e resultados
 */
export async function identifyCorrelations(
  agentId: string
): Promise<Pattern[]> {
  const metrics = await getAgentMetricsHistory(agentId, 500);

  // TODO: Implementar algoritmo de correlação
  // Por enquanto, retornar padrões placeholder
  return [];
}

/**
 * Gerar recomendações baseadas em padrões
 */
export function generateRecommendations(patterns: Pattern[]): string[] {
  return patterns
    .filter(p => p.successRate < 0.6)
    .map(p => p.recommendations)
    .flat();
}
EOF

    log_success "Serviço de análise de padrões criado"
}

# Criar serviço de ajuste de comportamento
create_behavior_ajuster() {
    log_info "Criando serviço de ajuste de comportamento..."

    cat > "$SERVICES_DIR/agent-learning/behavior-adjuster.ts" << 'EOF'
/**
 * Serviço de Ajuste de Comportamento de Agentes
 * Implementa o闭环 de feedback que permite aos agentes aprenderem e melhorarem
 */

import { calculatePerformanceTrend } from './metrics-recorder';
import { analyzeContentPatterns, analyzeTimingPatterns, identifyCorrelations, generateRecommendations } from './pattern-analyzer';
import { db } from '../../db';
import { agents } from '../../database/schemas/schema-final';
import { eq } from 'drizzle-orm';

export interface AgentAdjustment {
  agentId: string;
  adjustments: {
    parameter: string;
    oldValue: unknown;
    newValue: unknown;
    reason: string;
  }[];
  confidence: number;
  estimatedImprovement: number;
}

/**
 * Avaliar e ajustar comportamento de um agente
 */
export async function evaluateAndAdjust(agentId: string): Promise<AgentAdjustment> {
  console.log(`[AgentLearning] Evaluating agent: ${agentId}`);

  // Coletar tendências de performance
  const dailyTrend = await calculatePerformanceTrend(agentId, 'daily');
  const weeklyTrend = await calculatePerformanceTrend(agentId, 'weekly');

  // Analisar padrões
  const contentPatterns = await analyzeContentPatterns(agentId);
  const timingPatterns = await analyzeTimingPatterns(agentId);
  const correlations = await identifyCorrelations(agentId);

  // Determinar ajustes necessários
  const adjustments: AgentAdjustment['adjustments'] = [];

  // Ajuste de performance score
  if (weeklyTrend.avgScore > 0) {
    adjustments.push({
      parameter: 'performanceScore',
      oldValue: 'current',
      newValue: weeklyTrend.avgScore * 100,
      reason: `Média de performance semanal: ${weeklyTrend.avgScore}`,
    });
  }

  // Ajuste de estratégia de conteúdo
  if (contentPatterns.length > 0) {
    const bestPattern = contentPatterns.reduce((best, current) =>
      current.successRate > best.successRate ? current : best
    );

    adjustments.push({
      parameter: 'contentStrategy.bestTone',
      oldValue: 'current',
      newValue: bestPattern.tone,
      reason: `Tom com maior taxa de sucesso: ${bestPattern.successRate * 100}%`,
    });
  }

  // Ajuste de timing
  if (timingPatterns.bestHours.length > 0) {
    adjustments.push({
      parameter: 'contentStrategy.bestHours',
      oldValue: 'current',
      newValue: timingPatterns.bestHours,
      reason: 'Horários com melhor engajamento identificados',
    });
  }

  // Aplicar ajustes ao banco de dados
  if (adjustments.length > 0) {
    await applyAdjustments(agentId, adjustments);
  }

  // Calcular confiança e melhoria estimada
  const confidence = Math.min(0.9, 0.5 + (weeklyTrend.totalOperations / 100));
  const estimatedImprovement = weeklyTrend.improvementRate;

  return {
    agentId,
    adjustments,
    confidence: Math.round(confidence * 100) / 100,
    estimatedImprovement: Math.round(estimatedImprovement * 100) / 100,
  };
}

/**
 * Aplicar ajustes ao agente
 */
async function applyAdjustments(
  agentId: string,
  adjustments: AgentAdjustment['adjustments']
): Promise<void> {
  // Buscar agente atual
  const agentData = await db
    .select()
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  if (!agentData.length) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  const agent = agentData[0];

  // Aplicar ajustes de performance score
  const performanceAdjustment = adjustments.find(a => a.parameter === 'performanceScore');
  if (performanceAdjustment) {
    await db.update(agents)
      .set({ performanceScore: performanceAdjustment.newValue as number })
      .where(eq(agents.id, agentId));
  }

  // Aplicar ajustes de estratégia
  const strategyAdjustment = adjustments.find(a => a.parameter.startsWith('contentStrategy'));
  if (strategyAdjustment && agent.contentStrategy) {
    let currentStrategy: Record<string, unknown>;
    try {
      currentStrategy = typeof agent.contentStrategy === 'string'
        ? JSON.parse(agent.contentStrategy)
        : agent.contentStrategy as unknown as Record<string, unknown>;
    } catch {
      currentStrategy = {};
    }

    const paramParts = strategyAdjustment.parameter.split('.');
    if (paramParts.length === 3 && paramParts[0] === 'contentStrategy') {
      currentStrategy[paramParts[1]] = paramParts[2] === 'bestHours'
        ? strategyAdjustment.newValue
        : strategyAdjustment.newValue;

      await db.update(agents)
        .set({ contentStrategy: JSON.stringify(currentStrategy) })
        .where(eq(agents.id, agentId));
    }
  }

  console.log(`[AgentLearning] Applied ${adjustments.length} adjustments to agent ${agentId}`);
}

/**
 * Avaliar todos os agentes (para execução periódica)
 */
export async function evaluateAllAgents(): Promise<AgentAdjustment[]> {
  console.log('[AgentLearning] Evaluating all agents...');

  const allAgents = await db.select().from(agents);

  const results: AgentAdjustment[] = [];

  for (const agent of allAgents) {
    if (agent.status === 'active') {
      try {
        const adjustment = await evaluateAndAdjust(agent.id);
        results.push(adjustment);
      } catch (error) {
        console.error(`[AgentLearning] Error evaluating agent ${agent.id}:`, error);
      }
    }
  }

  console.log(`[AgentLearning] Evaluated ${results.length} agents`);
  return results;
}
EOF

    log_success "Serviço de ajuste de comportamento criado"
}

# Criar export do módulo
setup_exports() {
    log_info "Configurando exports do módulo de aprendizado..."

    cat > "$SERVICES_DIR/agent-learning/index.ts" << 'EOF'
/**
 * Módulo de Aprendizado de Agentes
 * Exporta serviços para coleta de métricas, análise de padrões e ajuste de comportamento
 */

export * from './metrics-recorder';
export * from './pattern-analyzer';
export * from './behavior-adjuster';
EOF

    log_success "Exports configurados"
}

# Função principal
main() {
    echo ""
    echo "========================================"
    echo "  CONFIGURAÇÃO DO LOOP DE APRENDIZADO"
    echo "  Projeto: MMN_AI-to-AI"
    echo "========================================"
    echo ""

    setup_learning_directory
    create_metrics_recorder
    create_pattern_analyzer
    create_behavior_ajuster
    setup_exports

    echo ""
    log_success "Sistema de aprendizado de agentes configurado com sucesso"
    echo ""
    echo "Arquivos criados:"
    echo "  - $SERVICES_DIR/agent-learning/metrics-recorder.ts"
    echo "  - $SERVICES_DIR/agent-learning/pattern-analyzer.ts"
    echo "  - $SERVICES_DIR/agent-learning/behavior-adjuster.ts"
    echo "  - $SERVICES_DIR/agent-learning/index.ts"
    echo ""
    echo "Fluxo de aprendizado:"
    echo "  1. Agente executa operação"
    echo "  2. Métricas são registradas (metrics-recorder.ts)"
    echo "  3. Padrões são identificados (pattern-analyzer.ts)"
    echo "  4. Comportamento é ajustado (behavior-adjuster.ts)"
    echo ""
}

# Executar função principal
main "$@"