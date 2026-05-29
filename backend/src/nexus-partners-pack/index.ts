/**
 * Nexus Partners Pack - Barrel Exports
 * Exportações centrais do módulo enterprise de skills autônomas
 *
 * Módulos coexistentes com backend/src/agentic/skills/
 */

// ============================================
// TYPES (exportar enums e interfaces)
// ============================================

export {
  // Enums
  SkillCategory,
  RBACScope,
  ExecutionStatus,
  CircuitState,
  SagaState,

  // Context & Execution
  type UserContext,
  type SkillExecutionContext,
  type ExecutionOptions,
  type ExecutionResult,

  // Queue & Worker
  type NexusQueueJob,
  type WorkerConfig,
  type DispatcherStats,

  // Tenant Management
  type TenantSlaConfig,
  type TenantResources,
  type GracefulShutdownConfig,
  type TenantHealthStatus,

  // Saga & Self-Healing
  type SagaLog,
  type SagaDefinition,
  type SagaStepDefinition,
  type RetryPolicy,
  type ReconciliationResult,

  // Circuit Breaker & Rate Limiting
  type CircuitBreakerConfig,
  type RateLimitConfig,
  type RateLimitResult,

  // Health Checks
  type HealthCheckResult,
  type SystemHealth,

  // Autonomous Decision
  type AutonomousDecision
} from "./types";

// ============================================
// DISPATCHER
// ============================================

export {
  /**
   * Nexus Skill Dispatcher
   * Gerenciamento de filas BullMQ com validação RBAC, rate limiting e circuit breaker
   */
  NexusSkillDispatcher,
  CircuitBreaker,
  RateLimiter,
  AutonomousDecisionEngine,
  createDispatcher
} from "./dispatcher";

// ============================================
// ENTERPRISE TENANT MANAGER
// ============================================

export {
  /**
   * Nexus Enterprise Tenant Manager
   * Gerenciamento de tenants com graceful shutdown e isolamento multi-tenant
   */
  NexusEnterpriseTenantManager,
  type Tenant,
  type TenantStats,
  type ShutdownState,
  createTenantManager
} from "./EnterpriseTenantManager";

// ============================================
// SELF-HEALING ENGINE
// ============================================

export {
  /**
   * Nexus Self-Healing Engine
   * Reconciliação de sagas e auto-recuperação de falhas
   */
  NexusSelfHealingEngine,
  type SagaInstance,
  type SagaStepResult,
  type SagaExecutionContext,
  type HealingPolicy,
  type HealthStatus,
  createSelfHealingEngine,
  defaultSagaDefinitions
} from "./SelfHealingEngine";

// ============================================
// CONVENIENCE TYPES
// ============================================

export type {
  QueuedJob,
  JobWithContext,
  RateLimitEntry,
  PendingReconciliation
} from "./dispatcher";

export type {
  Tenant,
  TenantStats,
  ShutdownState
} from "./EnterpriseTenantManager";

export type {
  SagaInstance,
  SagaStepResult,
  SagaExecutionContext,
  HealingPolicy,
  HealthStatus
} from "./SelfHealingEngine";

// ============================================
// VERSION INFO
// ============================================

export const NEXUS_PARTNERS_PACK_VERSION = "1.0.0";
export const NEXUS_PARTNERS_PACK_NAME = "Nexus Partners Pack";
export const NEXUS_PARTNERS_PACK_DESCRIPTION = "Sistema enterprise para gerenciar skills autônomas com suporte multi-tenancy, BullMQ, graceful shutdown e self-healing";

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================

export const DEFAULT_GRACEFUL_SHUTDOWN_CONFIG: GracefulShutdownConfig = {
  timeoutMs: 30000,
  forceAfterMs: 10000,
  drainQueue: true,
  persistState: false,
  notifyCallbacks: []
};

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 60000,
  halfOpenMaxAttempts: 3
};

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 60000,
  maxRequests: 100
};

export const DEFAULT_WORKER_CONFIG: WorkerConfig = {
  concurrency: 5,
  skills: [],
  categories: [],
  timeoutMs: 30000,
  maxRetries: 3
};

export const DEFAULT_HEALING_POLICY: HealingPolicy = {
  maxCompensationAttempts: 3,
  autoRetryEnabled: true,
  autoCompensateEnabled: true,
  escalationThreshold: 10,
  healthCheckIntervalMs: 60000
};
