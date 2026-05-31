/**
 * Nexus Operations Router
 * API de operações para gestão de tenants, skills e sistema enterprise
 *
 * Endpoints:
 * - GET /nexus/health - Health check do sistema
 * - GET /nexus/skills - Lista todas as skills (catálogo)
 * - GET /nexus/skills/:slug/metrics - Métricas de skill específica
 * - GET /nexus/tenants - Lista tenants
 * - POST /nexus/tenants - Registra novo tenant
 * - GET /nexus/tenants/:id - Status de tenant
 * - GET /nexus/sagas - Lista sagas
 * - GET /nexus/jobs - Lista jobs em queue
 * - GET /nexus/metrics - Métricas gerais do sistema
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../config/trpc';
import {
  skillRegistry,
  nexusSkillExecutor,
  SKILL_CATALOG,
} from '../agentic/skills/skillBridge';
import {
  sagaStore,
  jobQueueStore,
  tenantStateStore,
} from '../nexus-partners-pack/persistence';
import type { SkillCategory, ExecutionStatus } from '../nexus-partners-pack/types';

// ============================================
// SCHEMAS
// ============================================

const TenantSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().optional(),
  maxConcurrentExecutions: z.number().optional(),
  rateLimitPerMinute: z.number().optional(),
});

const ExecuteSkillSchema = z.object({
  slug: z.string(),
  input: z.record(z.unknown()),
  priority: z.number().optional(),
  enableSelfHealing: z.boolean().optional(),
});

const SkillCategoryEnum = z.enum(['MARKETING', 'SALES', 'SUPPORT', 'OPERATIONS', 'ANALYTICS', 'CUSTOM']);

// ============================================
// ROUTER
// ============================================

export const nexusOperationsRouter = router({
  // ==========================================
  // HEALTH & METRICS
  // ==========================================

  /**
   * Health check do sistema Nexus
   */
  health: publicProcedure.query(() => {
    const executorHealth = nexusSkillExecutor.getHealthStatus();
    const skillMetrics = skillRegistry.getMetrics();
    const sagaStats = sagaStore.getStats();
    const jobStats = jobQueueStore.getStats();
    const tenantStats = tenantStateStore.getStats();

    return {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      components: {
        skillExecutor: {
          status: executorHealth.isHealthy ? 'healthy' : 'degraded',
          metrics: skillMetrics,
        },
        sagaStore: {
          status: 'healthy',
          stats: sagaStats,
        },
        jobQueue: {
          status: 'healthy',
          stats: jobStats,
        },
        tenantStore: {
          status: 'healthy',
          stats: tenantStats,
        },
      },
      uptime: process.uptime(),
    };
  }),

  /**
   * Métricas gerais do sistema
   */
  metrics: publicProcedure.query(() => {
    const skillMetrics = skillRegistry.getMetrics();
    const sagaStats = sagaStore.getStats();
    const jobStats = jobQueueStore.getStats();
    const tenantStats = tenantStateStore.getStats();

    return {
      skills: {
        total: skillMetrics.totalSkills,
        operational: SKILL_CATALOG.filter(s => s.status === 'operational').length,
        inDevelopment: SKILL_CATALOG.filter(s => s.status === 'in_development').length,
        planned: SKILL_CATALOG.filter(s => s.status === 'planned').length,
        byCategory: skillMetrics.skillsByCategory,
        totalExecutions: skillMetrics.totalExecutions,
        averageSuccessRate: skillMetrics.averageSuccessRate,
      },
      sagas: {
        total: sagaStats.total,
        byState: sagaStats.byState,
        averageDurationMs: sagaStats.averageDurationMs,
      },
      jobs: {
        queued: jobStats.queued,
        running: jobStats.running,
        completed: jobStats.completed,
        failed: jobStats.failed,
        averageExecutionTimeMs: jobStats.averageExecutionTimeMs,
      },
      tenants: {
        total: tenantStats.total,
        active: tenantStats.active,
        totalExecutions: tenantStats.totalExecutions,
        averageHealthScore: tenantStats.averageHealthScore,
        withIssues: tenantStats.tenantsWithIssues,
      },
      autonomyScore: skillMetrics.averageSuccessRate,
    };
  }),

  // ==========================================
  // SKILLS CATALOG
  // ==========================================

  /**
   * Lista catálogo de skills (completo ou filtrado)
   */
  listSkills: publicProcedure
    .input(z.object({
      status: z.enum(['operational', 'in_development', 'planned']).optional(),
      category: z.string().optional(),
    }).optional())
    .query(({ input }) => {
      let skills = SKILL_CATALOG;

      if (input?.status) {
        skills = skills.filter(s => s.status === input.status);
      }
      if (input?.category) {
        skills = skills.filter(s => s.category === input.category);
      }

      // Adicionar métricas operacionais
      const registeredSkills = skillRegistry.list();
      const registeredMap = new Map(registeredSkills.map(s => [s.slug, s]));

      return skills.map(skill => {
        const metrics = registeredMap.get(skill.slug);
        return {
          ...skill,
          metrics: metrics ? {
            executionCount: metrics.executionCount,
            lastExecutedAt: metrics.lastExecutedAt,
            averageLatencyMs: metrics.averageLatencyMs,
            successRate: metrics.successRate,
          } : null,
        };
      });
    }),

  /**
   * Detalhes de skill específica
   */
  getSkill: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const skill = SKILL_CATALOG.find(s => s.slug === input.slug);
      if (!skill) {
        return { error: 'Skill not found' };
      }

      const metrics = skillRegistry.get(input.slug);

      return {
        ...skill,
        metrics: metrics || null,
        capabilities: skill.capabilities,
      };
    }),

  /**
   * Métricas de skill específica
   */
  getSkillMetrics: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const skill = skillRegistry.get(input.slug);
      if (!skill) {
        return {
          found: false,
          message: 'Skill not yet executed or registered',
        };
      }

      return {
        found: true,
        slug: skill.slug,
        title: skill.title,
        category: skill.category,
        version: skill.version,
        supportsAutonomous: skill.supportsAutonomous,
        executionCount: skill.executionCount,
        lastExecutedAt: skill.lastExecutedAt,
        averageLatencyMs: skill.averageLatencyMs,
        successRate: skill.successRate,
      };
    }),

  /**
   * Executa skill via API (para testes e integração)
   */
  executeSkill: protectedProcedure
    .input(ExecuteSkillSchema)
    .mutation(async ({ ctx, input }) => {
      const context = {
        agentId: ctx.user?.id || 1,
        userId: ctx.user?.id || 1,
        agentName: 'API Client',
        performanceScore: 75,
        autonomyAllowed: true,
        channelHint: 'api',
      };

      const result = await nexusSkillExecutor.execute(
        input.slug,
        input.input,
        context,
        {
          enableSelfHealing: input.enableSelfHealing,
          priority: input.priority,
        }
      );

      return result;
    }),

  // ==========================================
  // TENANT MANAGEMENT
  // ==========================================

  /**
   * Lista todos os tenants
   */
  listTenants: protectedProcedure
    .input(z.object({
      activeOnly: z.boolean().optional(),
    }).optional())
    .query(({ input }) => {
      const tenants = input?.activeOnly
        ? tenantStateStore.listActive()
        : tenantStateStore.list();

      return tenants;
    }),

  /**
   * Registra novo tenant
   */
  registerTenant: protectedProcedure
    .input(TenantSchema)
    .mutation(({ input }) => {
      const state = tenantStateStore.register(input.tenantId);

      if (input.name) {
        tenantStateStore.update(input.tenantId, {
          healthStatus: {
            ...state.healthStatus,
            // @ts-ignore - extended field
            name: input.name,
          },
        });
      }

      return {
        success: true,
        tenant: tenantStateStore.get(input.tenantId),
      };
    }),

  /**
   * Status detalhado de tenant
   */
  getTenantStatus: protectedProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(({ input }) => {
      const state = tenantStateStore.get(input.tenantId);
      if (!state) {
        return { error: 'Tenant not found' };
      }

      return state;
    }),

  /**
   * Reset circuit breaker de tenant
   */
  resetTenantCircuitBreaker: protectedProcedure
    .input(z.object({ tenantId: z.string() }))
    .mutation(({ input }) => {
      tenantStateStore.resetCircuitBreaker(input.tenantId);
      return {
        success: true,
        tenantId: input.tenantId,
        circuitBreakerState: 'closed',
      };
    }),

  // ==========================================
  // SAGA MANAGEMENT
  // ==========================================

  /**
   * Lista sagas (opcionalmente filtradas)
   */
  listSagas: protectedProcedure
    .input(z.object({
      tenantId: z.string().optional(),
      state: z.enum(['pending', 'in_progress', 'compensating', 'completed', 'failed']).optional(),
      limit: z.number().optional(),
    }).optional())
    .query(({ input }) => {
      let sagas = input?.tenantId
        ? sagaStore.list(input.tenantId)
        : sagaStore.list();

      if (input?.state) {
        sagas = sagaStore.listByState(input.state as any, input.tenantId);
      }

      if (input?.limit) {
        sagas = sagas.slice(0, input.limit);
      }

      return sagas;
    }),

  /**
   * Detalhes de saga específica
   */
  getSaga: protectedProcedure
    .input(z.object({ sagaId: z.string() }))
    .query(({ input }) => {
      const saga = sagaStore.get(input.sagaId);
      if (!saga) {
        return { error: 'Saga not found' };
      }

      const logs = sagaStore.getLogs(input.sagaId);

      return {
        saga,
        logs,
      };
    }),

  /**
   * Estatísticas de sagas
   */
  getSagaStats: publicProcedure.query(() => {
    return sagaStore.getStats();
  }),

  // ==========================================
  // JOB QUEUE
  // ==========================================

  /**
   * Lista jobs em queue
   */
  listJobs: protectedProcedure
    .input(z.object({
      status: z.enum(['queued', 'running', 'completed', 'failed']).optional(),
      limit: z.number().optional(),
    }).optional())
    .query(({ input }) => {
      let jobs = input?.status
        ? jobQueueStore.list(input.status as ExecutionStatus)
        : jobQueueStore.list();

      if (input?.limit) {
        jobs = jobs.slice(0, input.limit);
      }

      return jobs;
    }),

  /**
   * Estatísticas de jobs
   */
  getJobStats: publicProcedure.query(() => {
    return jobQueueStore.getStats();
  }),

  // ==========================================
  // SKILL CATALOG MANAGEMENT
  // ==========================================

  /**
   * Retorna lista de categorias de skills
   */
  listCategories: publicProcedure.query(() => {
    const categories = new Set(SKILL_CATALOG.map(s => s.category));
    return Array.from(categories).sort().map(cat => ({
      name: cat,
      count: SKILL_CATALOG.filter(s => s.category === cat).length,
      operational: SKILL_CATALOG.filter(s => s.category === cat && s.status === 'operational').length,
    }));
  }),

  /**
   * Retorna roadmap de skills
   */
  getSkillRoadmap: publicProcedure.query(() => {
    const byCategory: Record<string, {
      name: string;
      operational: number;
      total: number;
      skills: Array<{ slug: string; title: string; status: string }>;
    }> = {};

    SKILL_CATALOG.forEach(skill => {
      if (!byCategory[skill.category]) {
        byCategory[skill.category] = {
          name: skill.category,
          operational: 0,
          total: 0,
          skills: [],
        };
      }
      byCategory[skill.category].total++;
      if (skill.status === 'operational') {
        byCategory[skill.category].operational++;
      }
      byCategory[skill.category].skills.push({
        slug: skill.slug,
        title: skill.title,
        status: skill.status,
      });
    });

    return Object.values(byCategory).sort((a, b) => a.name.localeCompare(b.name));
  }),
});

// ============================================
// EXPORTS
// ============================================

export type NexusOperationsRouter = typeof nexusOperationsRouter;