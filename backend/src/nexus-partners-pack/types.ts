/**
 * Nexus Partners Pack - Core Types
 * Tipos e contratos core para gerenciamento de skills autônomas
 */

// ============================================
// ENUMS
// ============================================

export enum SkillCategory {
  MARKETING = "marketing",
  SALES = "sales",
  SUPPORT = "support",
  OPERATIONS = "operations",
  ANALYTICS = "analytics",
  CUSTOM = "custom"
}

export enum RBACScope {
  TENANT_ADMIN = "tenant_admin",
  TENANT_USER = "tenant_user",
  GLOBAL_ADMIN = "global_admin",
  API_ACCESS = "api_access"
}

export enum ExecutionStatus {
  QUEUED = "queued",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  PENDING_RETRY = "pending_retry"
}

export enum CircuitState {
  CLOSED = "closed",
  OPEN = "open",
  HALF_OPEN = "half_open"
}

export enum SagaState {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPENSATING = "compensating",
  COMPLETED = "completed",
  FAILED = "failed"
}

// ============================================
// CONTEXT & EXECUTION
// ============================================

export interface UserContext {
  userId: string;
  tenantId: string;
  roles: RBACScope[];
  permissions: string[];
  metadata?: Record<string, unknown>;
}

export interface SkillExecutionContext {
  executionId: string;
  skillName: string;
  category: SkillCategory;
  user: UserContext;
  input: Record<string, unknown>;
  options?: ExecutionOptions;
  startedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ExecutionOptions {
  priority?: number;
  timeoutMs?: number;
  retryAttempts?: number;
  circuitBreakerEnabled?: boolean;
  rateLimitKey?: string;
}

// ============================================
// QUEUE & WORKER
// ============================================

export interface NexusQueueJob {
  id: string;
  executionId: string;
  skillName: string;
  category: SkillCategory;
  tenantId: string;
  payload: Record<string, unknown>;
  priority: number;
  status: ExecutionStatus;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: Record<string, unknown>;
  error?: string;
  retryCount: number;
}

export interface WorkerConfig {
  concurrency: number;
  skills: string[];
  categories: SkillCategory[];
  timeoutMs: number;
  maxRetries: number;
}

// ============================================
// TENANT MANAGEMENT
// ============================================

export interface TenantSlaConfig {
  tenantId: string;
  maxConcurrentExecutions: number;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  circuitBreakerThreshold: number;
  recoveryTimeoutMs: number;
  priorityLevels: number[];
}

export interface TenantResources {
  tenantId: string;
  cpuLimit: number;
  memoryLimitMB: number;
  queueLimit: number;
  activeExecutions: number;
}

export interface GracefulShutdownConfig {
  timeoutMs: number;
  forceAfterMs: number;
  drainQueue: boolean;
  persistState: boolean;
  notifyCallbacks: string[];
}

export interface TenantHealthStatus {
  tenantId: string;
  isHealthy: boolean;
  circuitState: CircuitState;
  activeExecutions: number;
  queuedJobs: number;
  failureRate: number;
  lastHealthCheck: string;
  issues: string[];
}

// ============================================
// SAGA & SELF-HEALING
// ============================================

export interface SagaLog {
  id: string;
  sagaId: string;
  executionId: string;
  tenantId: string;
  stepName: string;
  stepOrder: number;
  state: SagaState;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  compensationInput?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface SagaDefinition {
  id: string;
  name: string;
  steps: SagaStepDefinition[];
  timeoutMs: number;
  retryPolicy: RetryPolicy;
}

export interface SagaStepDefinition {
  name: string;
  action: string;
  compensationAction: string;
  timeoutMs: number;
  required: boolean;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
}

export interface ReconciliationResult {
  executionId: string;
  sagaId: string;
  status: "reconciled" | "failed" | "requires_manual_intervention";
  actionsTaken: string[];
  compensated: boolean;
  recovered: boolean;
}

// ============================================
// CIRCUIT BREAKER & RATE LIMITING
// ============================================

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
  halfOpenMaxAttempts: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (context: SkillExecutionContext) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: numbers;
  resetAt: string;
  retryAfterMs?: number;
}

// ============================================
// HEALTH CHECKS
// ============================================

export interface HealthCheckResult {
  component: string;
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface SystemHealth {
  isHealthy: boolean;
  timestamp: string;
  uptime: number;
  components: HealthCheckResult[];
  overallLatencyMs: number;
}

// ============================================
// AUTONOMOUS DECISION
// ============================================

export interface AutonomousDecision {
  executionId: string;
  decisionType: "route" | "retry" | "fallback" | "escalate" | "cancel";
  confidence: number;
  reasoning: string;
  recommendedAction: string;
  executedAction?: string;
  timestamp: string;
}

// ============================================
// RESULT TYPES
// ============================================

export interface ExecutionResult<T = unknown> {
  success: boolean;
  executionId: string;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
  executionTimeMs: number;
}

export interface DispatcherStats {
  totalJobs: number;
  queuedJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageExecutionTimeMs: number;
}
