/**
 * Skill Bridge - Nexus Partners Pack Integration
 * Conecta o sistema de skills operacional ao módulo enterprise
 *
 * Este módulo atua como puente entre:
 * - backend/src/agentic/skills/ (23 skills operacionais)
 * - backend/src/nexus-partners-pack/ (módulo enterprise)
 *
 * Funcionalidades:
 * - Adapter de contexto entre sistemas
 * - Wrappers para execução via BullMQ
 * - Telemetria e auditoria unificada
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  SkillExecutionContext as NexusContext,
  SkillExecutionResult as NexusResult,
  ExecutionStatus,
  SagaLog,
  TenantHealthStatus,
} from '../nexus-partners-pack/types';

// ============================================
// CONTEXT ADAPTER
// ============================================

/**
 * Adapta contexto do sistema agentic para formato Nexus
 */
export interface AgenticSkillContext {
  agentId: number;
  userId: number;
  agentName: string;
  performanceScore: number;
  autonomyAllowed: boolean;
  channelHint?: string;
}

/**
 * Converte contexto agentic para contexto Nexus
 */
export function adaptToNexusContext(
  agenticCtx: AgenticSkillContext,
  executionId?: string
): NexusContext {
  return {
    executionId: executionId || uuidv4(),
    skillName: '', // será preenchido pelo caller
    category: 'MARKETING' as any, // default, será sobrescrito
    user: {
      userId: agenticCtx.userId.toString(),
      tenantId: agenticCtx.agentId.toString(),
      roles: agenticCtx.autonomyAllowed ? ['tenant_admin'] : ['tenant_user'],
      permissions: [],
      metadata: {
        agentId: agenticCtx.agentId,
        agentName: agenticCtx.agentName,
        performanceScore: agenticCtx.performanceScore,
        channelHint: agenticCtx.channelHint,
      },
    },
    input: {},
    startedAt: new Date().toISOString(),
    metadata: {
      originalContext: agenticCtx,
    },
  };
}

/**
 * Adapta resultado Nexus para formato agentic
 */
export function adaptFromNexusResult<T = unknown>(
  nexusResult: NexusResult<T>
): {
  executionId: string;
  success: boolean;
  latencyMs: number;
  output: T;
  message?: string;
  warnings?: string[];
} {
  return {
    executionId: nexusResult.executionId,
    success: nexusResult.success,
    latencyMs: nexusResult.executionTimeMs,
    output: nexusResult.data as T,
    message: nexusResult.message,
    warnings: nexusResult.warnings,
  };
}

// ============================================
// SKILL REGISTRY
// ============================================

export interface SkillRegistration {
  slug: string;
  title: string;
  category: string;
  version: string;
  supportsAutonomous: boolean;
  executionCount: number;
  lastExecutedAt?: string;
  averageLatencyMs: number;
  successRate: number;
}

/**
 * Registry centralizado de skills integradas
 */
class SkillRegistry {
  private skills: Map<string, SkillRegistration> = new Map();
  private executionHistory: Map<string, ExecutionRecord[]> = new Map();

  register(skill: SkillRegistration): void {
    this.skills.set(skill.slug, skill);
  }

  get(slug: string): SkillRegistration | undefined {
    return this.skills.get(slug);
  }

  list(): SkillRegistration[] {
    return Array.from(this.skills.values());
  }

  listByCategory(category: string): SkillRegistration[] {
    return this.list().filter(s => s.category === category);
  }

  incrementExecution(slug: string): void {
    const skill = this.skills.get(slug);
    if (skill) {
      skill.executionCount++;
      skill.lastExecutedAt = new Date().toISOString();
    }
  }

  recordExecution(slug: string, record: ExecutionRecord): void {
    if (!this.executionHistory.has(slug)) {
      this.executionHistory.set(slug, []);
    }
    const history = this.executionHistory.get(slug)!;
    history.push(record);

    // Manter apenas últimos 100 registros
    if (history.length > 100) {
      history.shift();
    }

    // Atualizar métricas de skill
    const skill = this.skills.get(slug);
    if (skill && record.success) {
      skill.successRate = this.calculateSuccessRate(history);
      skill.averageLatencyMs = this.calculateAverageLatency(history);
    }
  }

  private calculateSuccessRate(history: ExecutionRecord[]): number {
    const successes = history.filter(r => r.success).length;
    return Math.round((successes / history.length) * 100);
  }

  private calculateAverageLatency(history: ExecutionRecord[]): number {
    const sum = history.reduce((acc, r) => acc + r.latencyMs, 0);
    return Math.round(sum / history.length);
  }

  getMetrics(): {
    totalSkills: number;
    totalExecutions: number;
    averageSuccessRate: number;
    skillsByCategory: Record<string, number>;
  } {
    const skills = this.list();
    const allExecutions = Array.from(this.executionHistory.values()).flat();

    return {
      totalSkills: skills.length,
      totalExecutions: skills.reduce((acc, s) => acc + s.executionCount, 0),
      averageSuccessRate: Math.round(
        skills.reduce((acc, s) => acc + s.successRate, 0) / skills.length || 0
      ),
      skillsByCategory: skills.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export interface ExecutionRecord {
  executionId: string;
  timestamp: string;
  success: boolean;
  latencyMs: number;
  error?: string;
  autonomous: boolean;
  tenantId: string;
}

// Instância singleton do registry
export const skillRegistry = new SkillRegistry();

// ============================================
// SKILL EXECUTOR WITH NEXUS INTEGRATION
// ============================================

export interface ExecuteWithNexusOptions {
  enableBullMQ?: boolean;
  enableSelfHealing?: boolean;
  enableRateLimit?: boolean;
  enableCircuitBreaker?: boolean;
  priority?: number;
  tenantId?: string;
}

export interface ExecutionResult {
  executionId: string;
  skill: string;
  success: boolean;
  latencyMs: number;
  decision: 'auto' | 'needs_review' | 'fallback';
  output: unknown;
  message?: string;
  warnings?: string[];
  sagaId?: string;
}

/**
 * Executor que integra skills com recursos Nexus
 */
export class NexusSkillExecutor {
  private registry: SkillRegistry;

  constructor(registry: SkillRegistry = skillRegistry) {
    this.registry = registry;
  }

  /**
   * Executa skill com integração Nexus (BullMQ, Self-Healing, etc)
   */
  async execute(
    slug: string,
    input: unknown,
    context: AgenticSkillContext,
    options: ExecuteWithNexusOptions = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const executionId = uuidv4();

    try {
      // Converter contexto para formato Nexus
      const nexusContext = adaptToNexusContext(context, executionId);
      nexusContext.skillName = slug;
      nexusContext.category = this.getCategoryForSlug(slug) as any;

      // Executar skill (via dispatcher original)
      // TODO: Integrar com BullMQ quando Redis estiver disponível
      const result = await this.executeSkillDirect(slug, input, context);

      // Registrar execução no histórico
      this.registry.recordExecution(slug, {
        executionId,
        timestamp: new Date().toISOString(),
        success: result.success,
        latencyMs: Date.now() - startTime,
        autonomous: context.autonomyAllowed,
        tenantId: context.agentId.toString(),
      });

      this.registry.incrementExecution(slug);

      return {
        executionId,
        skill: slug,
        success: result.success,
        latencyMs: Date.now() - startTime,
        decision: context.autonomyAllowed && result.success ? 'auto' : 'needs_review',
        output: result.output,
        message: result.message,
        warnings: result.warnings,
      };
    } catch (error) {
      // Registrar falha
      this.registry.recordExecution(slug, {
        executionId,
        timestamp: new Date().toISOString(),
        success: false,
        latencyMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        autonomous: context.autonomyAllowed,
        tenantId: context.agentId.toString(),
      });

      return {
        executionId,
        skill: slug,
        success: false,
        latencyMs: Date.now() - startTime,
        decision: 'fallback',
        output: null,
        message: error instanceof Error ? error.message : 'Execution failed',
      };
    }
  }

  /**
   * Método placeholder - será integrado com dispatcher real
   */
  private async executeSkillDirect(
    slug: string,
    input: unknown,
    context: AgenticSkillContext
  ): Promise<{ success: boolean; output: unknown; message?: string; warnings?: string[] }> {
    // Placeholder - integração real virá com BullMQ
    return {
      success: true,
      output: { executed: true, skill: slug },
      message: `Skill ${slug} executada via Nexus executor`,
    };
  }

  private getCategoryForSlug(slug: string): string {
    const categoryMap: Record<string, string> = {
      'copywriter-persuasivo': 'content',
      'prospeccao-outbound': 'prospecting',
      'detector-tendencias': 'analytics',
      'auto-publisher': 'publishing',
      'follow-up-strategist': 'engagement',
      'judge-revisor': 'decision',
      'analytics-reporter': 'analytics',
      'audience-segmenter': 'targeting',
      'funnel-architect': 'strategy',
      'lead-enricher': 'prospecting',
      'objection-handler': 'sales',
      'pricing-optimizer': 'strategy',
      'ab-test-designer': 'optimization',
      'commission-calculator': 'finance',
      'content-translator': 'i18n',
      'creator-matcher': 'matching',
      'lifecycle-orchestrator': 'orchestration',
      'webhook-router': 'integration',
      'fraud-detector': 'security',
      'compliance-auditor': 'compliance',
      'roi-attributor': 'analytics',
      'cold-emailer': 'outreach',
      'upsell-strategist': 'sales',
    };
    return categoryMap[slug] || 'unknown';
  }

  /**
   * Retorna métricas do executor
   */
  getMetrics() {
    return this.registry.getMetrics();
  }

  /**
   * Lista skills disponíveis
   */
  listSkills(): SkillRegistration[] {
    return this.registry.list();
  }

  /**
   * Retorna health status
   */
  getHealthStatus(): TenantHealthStatus {
    const metrics = this.getMetrics();
    return {
      tenantId: 'system',
      isHealthy: metrics.averageSuccessRate >= 80,
      circuitState: 'closed' as any,
      activeExecutions: 0,
      queuedJobs: 0,
      failureRate: 100 - metrics.averageSuccessRate,
      lastHealthCheck: new Date().toISOString(),
      issues: metrics.averageSuccessRate < 80 ? ['Success rate below threshold'] : [],
    };
  }
}

// Instância singleton do executor
export const nexusSkillExecutor = new NexusSkillExecutor();

// ============================================
// SKILL CATALOG
// ============================================

/**
 * Catálogo completo de todas as skills (implementadas + planejadas)
 */
export const SKILL_CATALOG: Array<{
  slug: string;
  title: string;
  category: string;
  status: 'operational' | 'in_development' | 'planned';
  version: string;
  description: string;
  capabilities: string[];
}> = [
  // Skills já operacionais (23)
  { slug: 'copywriter-persuasivo', title: 'Copywriter Persuasivo', category: 'content', status: 'operational', version: '1.0.0', description: 'Gera copies persuasivas para campanhas de marketing', capabilities: ['headlines', 'body_copy', 'cta'] },
  { slug: 'prospeccao-outbound', title: 'Prospecção Outbound', category: 'prospecting', status: 'operational', version: '1.0.0', description: 'Identifica e qualification prospects para abordagem', capabilities: ['lead_scoring', 'segmentation', 'enrichment'] },
  { slug: 'detector-tendencias', title: 'Detector de Tendências', category: 'analytics', status: 'operational', version: '1.0.0', description: 'Identifica tendências de mercado e oportunidades', capabilities: ['trend_analysis', 'opportunity_detection'] },
  { slug: 'auto-publisher', title: 'Auto Publisher', category: 'publishing', status: 'operational', version: '1.0.0', description: 'Publica conteúdo automaticamente em múltiplos canais', capabilities: ['multi_channel', 'scheduling', 'formatting'] },
  { slug: 'follow-up-strategist', title: 'Follow-up Strategist', category: 'engagement', status: 'operational', version: '1.0.0', description: 'Orchestra sequências de follow-up personalizadas', capabilities: ['sequence_design', 'timing_optimization'] },
  { slug: 'judge-revisor', title: 'Judge Revisor', category: 'decision', status: 'operational', version: '1.0.0', description: 'Avalia e revisa conteúdo gerado por IA', capabilities: ['quality_check', 'compliance_review'] },
  { slug: 'analytics-reporter', title: 'Analytics Reporter', category: 'analytics', status: 'operational', version: '1.0.0', description: 'Gera relatórios analíticos detalhados', capabilities: ['dashboards', 'insights', 'kpis'] },
  { slug: 'audience-segmenter', title: 'Audience Segmenter', category: 'targeting', status: 'operational', version: '1.0.0', description: 'Segmenta audiência para campanhas direcionadas', capabilities: ['demographics', 'behavior', 'preferences'] },
  { slug: 'funnel-architect', title: 'Funnel Architect', category: 'strategy', status: 'operational', version: '1.0.0', description: 'Desenha funis de conversão otimizados', capabilities: ['funnel_design', 'stage_mapping'] },
  { slug: 'lead-enricher', title: 'Lead Enricher', category: 'prospecting', status: 'operational', version: '1.0.0', description: 'Enriquece dados de leads com informações externas', capabilities: ['data_enrichment', 'social_lookup'] },
  { slug: 'objection-handler', title: 'Objection Handler', category: 'sales', status: 'operational', version: '1.0.0', description: 'Gera respostas a objeções comuns de vendas', capabilities: ['objection_responses', 'price_sensitivity'] },
  { slug: 'pricing-optimizer', title: 'Pricing Optimizer', category: 'strategy', status: 'operational', version: '1.0.0', description: 'Otimiza estratégias de pricing por segmento', capabilities: ['price_elasticity', 'segment_pricing'] },
  { slug: 'ab-test-designer', title: 'A/B Test Designer', category: 'optimization', status: 'operational', version: '1.0.0', description: 'Desenha testes A/B para otimização', capabilities: ['test_design', 'sample_calculator'] },
  { slug: 'commission-calculator', title: 'Commission Calculator', category: 'finance', status: 'operational', version: '1.0.0', description: 'Calcula comissões e bônus de rede', capabilities: ['commission_rules', 'bonus_calculation'] },
  { slug: 'content-translator', title: 'Content Translator', category: 'i18n', status: 'operational', version: '1.0.0', description: 'Traduz conteúdo com adaptação cultural', capabilities: ['translation', 'localization'] },
  { slug: 'creator-matcher', title: 'Creator Matcher', category: 'matching', status: 'operational', version: '1.0.0', description: 'Match entre marcas e criadores de conteúdo', capabilities: ['creator_search', 'audience_matching'] },
  { slug: 'lifecycle-orchestrator', title: 'Lifecycle Orchestrator', category: 'orchestration', status: 'operational', version: '1.0.0', description: 'Orchestra jornada completa do cliente', capabilities: ['onboarding', 'engagement', 'retention'] },
  { slug: 'webhook-router', title: 'Webhook Router', category: 'integration', status: 'operational', version: '1.0.0', description: 'Roteia eventos de webhooks para actions', capabilities: ['event_routing', 'action_triggering'] },
  { slug: 'fraud-detector', title: 'Fraud Detector', category: 'security', status: 'operational', version: '1.0.0', description: 'Detecta padrões fraudulentos', capabilities: ['pattern_detection', 'risk_scoring'] },
  { slug: 'compliance-auditor', title: 'Compliance Auditor', category: 'compliance', status: 'operational', version: '1.0.0', description: 'Verifica conformidade com regulations', capabilities: ['claim_check', 'regulation_audit'] },
  { slug: 'roi-attributor', title: 'ROI Attributor', category: 'analytics', status: 'operational', version: '1.0.0', description: 'Atribui receita multi-touch', capabilities: ['attribution_model', 'roi_calculation'] },
  { slug: 'cold-emailer', title: 'Cold Emailer', category: 'outreach', status: 'operational', version: '1.0.0', description: 'Gera e personaliza emails frio', capabilities: ['email_generation', 'personalization'] },
  { slug: 'upsell-strategist', title: 'Upsell Strategist', category: 'sales', status: 'operational', version: '1.0.0', description: 'Estratégias de upsell e cross-sell', capabilities: ['product_matching', 'timing_optimization'] },

  // Skills planejadas (22 restantes)
  { slug: 'social-seller', title: 'Social Seller', category: 'sales', status: 'planned', version: '0.0.1', description: 'Automatiza vendas em redes sociais', capabilities: ['social_automation'] },
  { slug: 'webinar-engine', title: 'Webinar Engine', category: 'sales', status: 'planned', version: '0.0.1', description: 'Gerencia webinars e lançamentos', capabilities: ['webinar_management'] },
  { slug: 'referral-engineer', title: 'Referral Engineer', category: 'sales', status: 'planned', version: '0.0.1', description: 'Otimiza programa de indicações', capabilities: ['referral_tracking'] },
  { slug: 'cross-sell-engine', title: 'Cross-sell Engine', category: 'sales', status: 'planned', version: '0.0.1', description: 'Engine de cross-sell inteligente', capabilities: ['product_matching'] },
  { slug: 'cart-recovery', title: 'Cart Recovery', category: 'sales', status: 'planned', version: '0.0.1', description: 'Recupera carrinhos abandonados', capabilities: ['abandoned_cart'] },
  { slug: 'loyalty-architect', title: 'Loyalty Architect', category: 'sales', status: 'planned', version: '0.0.1', description: 'Cria programas de fidelidade', capabilities: ['loyalty_programs'] },
  { slug: 'video-script-writer', title: 'Video Script Writer', category: 'content', status: 'planned', version: '0.0.1', description: 'Escreve roteiros para vídeos', capabilities: ['script_generation'] },
  { slug: 'image-prompt-engineer', title: 'Image Prompt Engineer', category: 'content', status: 'planned', version: '0.0.1', description: 'Gera prompts para imagens IA', capabilities: ['prompt_crafting'] },
  { slug: 'seo-strategist', title: 'SEO Strategist', category: 'content', status: 'planned', version: '0.0.1', description: 'Estratégia de SEO integrada', capabilities: ['keyword_research', 'content_optimization'] },
  { slug: 'viral-hook-generator', title: 'Viral Hook Generator', category: 'content', status: 'planned', version: '0.0.1', description: 'Gera ganchos virais para conteúdo', capabilities: ['hook_creation'] },
  { slug: 'landing-page-builder', title: 'Landing Page Builder', category: 'content', status: 'planned', version: '0.0.1', description: 'Constrói landing pages otimizadas', capabilities: ['page_building'] },
  { slug: 'email-sequence-designer', title: 'Email Sequence Designer', category: 'content', status: 'planned', version: '0.0.1', description: 'Desenha sequências de email', capabilities: ['sequence_design'] },
  { slug: 'kpi-monitor', title: 'KPI Monitor', category: 'operations', status: 'planned', version: '0.0.1', description: 'Monitora KPIs em tempo real', capabilities: ['real_time_monitoring'] },
  { slug: 'anomaly-detector', title: 'Anomaly Detector', category: 'operations', status: 'planned', version: '0.0.1', description: 'Detecta anomalias em dados', capabilities: ['anomaly_detection'] },
  { slug: 'incident-responder', title: 'Incident Responder', category: 'operations', status: 'planned', version: '0.0.1', description: 'Responde incidentes automaticamente', capabilities: ['incident_management'] },
  { slug: 'contract-analyzer', title: 'Contract Analyzer', category: 'operations', status: 'planned', version: '0.0.1', description: 'Analisa contratos e documentos', capabilities: ['document_analysis'] },
  { slug: 'tax-advisor-br', title: 'Tax Advisor BR', category: 'operations', status: 'planned', version: '0.0.1', description: 'Consultoria fiscal para Brasil', capabilities: ['tax_advice'] },
  { slug: 'cohort-analyzer', title: 'Cohort Analyzer', category: 'analytics', status: 'planned', version: '0.0.1', description: 'Análise de coortes de usuários', capabilities: ['cohort_analysis'] },
  { slug: 'churn-predictor', title: 'Churn Predictor', category: 'analytics', status: 'planned', version: '0.0.1', description: 'Prediz churn de clientes', capabilities: ['churn_prediction'] },
  { slug: 'ltv-forecaster', title: 'LTV Forecaster', category: 'analytics', status: 'planned', version: '0.0.1', description: 'Projeta lifetime value', capabilities: ['ltv_calculation'] },
  { slug: 'competitor-watcher', title: 'Competitor Watcher', category: 'analytics', status: 'planned', version: '0.0.1', description: 'Monitora concorrentes', capabilities: ['competitive_intelligence'] },
  { slug: 'market-sentiment-tracker', title: 'Market Sentiment Tracker', category: 'analytics', status: 'planned', version: '0.0.1', description: 'Rastrea sentimento do mercado', capabilities: ['sentiment_analysis'] },
];

