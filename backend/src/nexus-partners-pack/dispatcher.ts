/**
 * Nexus Skill Dispatcher
 * Gerenciamento de filas BullMQ com validação RBAC, rate limiting e circuit breaker
 */

import {
  Queue,
  Worker,
  Job,
  QueueEvents,
  ConnectionOptions,
  JobsOptions
} from "bullmq";
import { v4 as uuidv4 } from "uuid";
import {
  SkillExecutionContext,
  NexusQueueJob,
  ExecutionStatus,
  SkillCategory,
  RBACScope,
  UserContext,
  CircuitBreakerConfig,
  CircuitState,
  RateLimitConfig,
  RateLimitResult,
  WorkerConfig,
  ExecutionResult,
  DispatcherStats,
  HealthCheckResult,
  SystemHealth,
  AutonomousDecision
} from "./types";

// ============================================
// INTERFACES
// ============================================

interface QueuedJob extends JobsOptions {
  id?: string;
  name: string;
  data: Record<string, unknown>;
  opts?: JobsOptions;
}

interface JobWithContext {
  job: Job<Record<string, unknown>,
  context: SkillExecutionContext;
}

// ============================================
// CIRCUIT BREAKER
// ============================================

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.CLOSED) {
      try {
        const result = await fn();
        this.onSuccess();
        return result;
      } catch (error) {
        this.onFailure();
        throw error;
      }
    }

    if (this.state === CircuitState.HALF_OPEN) {
      try {
        const result = await fn();
        this.onSuccess();
        return result;
      } catch (error) {
        this.onFailure();
        throw error;
      }
    }

    if (this.state === CircuitState.OPEN) {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure >= this.config.timeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        const result = await fn();
        this.onSuccess();
        return result;
      }
      throw new Error("Circuit breaker is OPEN");
    }

    throw new Error("Unknown circuit breaker state");
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.successCount++;
    if (this.state === CircuitState.HALF_OPEN &&
        this.successCount >= this.config.successThreshold) {
      this.state = CircuitState.CLOSED;
      this.successCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.successCount = 0;
    if (this.state === CircuitState.HALF_OPEN ||
        this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
  }
}

// ============================================
// RATE LIMITER
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private hitCounts: Map<string, RateLimitEntry> = new Map();

  constructor(private config: RateLimitConfig) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    let entry = this.hitCounts.get(key);

    if (!entry || now >= entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + this.config.windowMs
      };
      this.hitCounts.set(key, entry);
    }

    entry.count++;
    const allowed = entry.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - entry.count);

    return {
      allowed,
      remaining,
      resetAt: new Date(entry.resetAt).toISOString(),
      retryAfterMs: allowed ? undefined : entry.resetAt - now
    };
  }

  reset(key: string): void {
    this.hitCounts.delete(key);
  }

  resetAll(): void {
    this.hitCounts.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.hitCounts) {
      if (now >= entry.resetAt) {
        this.hitCounts.delete(key);
      }
    }
  }
}

// ============================================
// AUTONOMOUS DECISION ENGINE
// ============================================

export class AutonomousDecisionEngine {
  private decisions: Map<string, AutonomousDecision> = new Map();

  async makeDecision(
    context: SkillExecutionContext,
    scenario: "route" | "retry" | "fallback" | "escalate" | "cancel",
    reason: string
  ): Promise<AutonomousDecision> {
    const confidence = this.calculateConfidence(context, scenario);
    const recommendedAction = this.getRecommendedAction(scenario, context);

    const decision: AutonomousDecision = {
      executionId: context.executionId,
      decisionType: scenario,
      confidence,
      reasoning: reason,
      recommendedAction,
      timestamp: new Date().toISOString()
    };

    this.decisions.set(context.executionId, decision);
    return decision;
  }

  private calculateConfidence(
    context: SkillExecutionContext,
    scenario: string
  ): number {
    let baseConfidence = 0.7;

    if (context.user.roles.includes(RBACScope.GLOBAL_ADMIN)) {
      baseConfidence += 0.2;
    }

    if (scenario === "fallback" || scenario === "cancel") {
      baseConfidence += 0.1;
    }

    return Math.min(1, baseConfidence);
  }

  private getRecommendedAction(
    scenario: string,
    context: SkillExecutionContext
  ): string {
    switch (scenario) {
      case "route":
        return `Route to alternative ${context.skillName} handler`;
      case "retry":
        return `Retry with exponential backoff`;
      case "fallback":
        return `Execute fallback handler`;
      case "escalate":
        return `Escalate to human review`;
      case "cancel":
        return `Cancel execution and compensate`;
      default:
        return "No action taken";
    }
  }

  getDecision(executionId: string): AutonomousDecision | undefined {
    return this.decisions.get(executionId);
  }
}

// ============================================
// MAIN DISPATCHER
// ============================================

export class NexusSkillDispatcher {
  private queue!: Queue;
  private worker!: Worker;
  private queueEvents!: QueueEvents;
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;
  private decisionEngine: AutonomousDecisionEngine;
  private jobContexts: Map<string, SkillExecutionContext> = new Map();
  private stats: DispatcherStats = {
    totalJobs: 0,
    queuedJobs: 0,
    runningJobs: 0 completedJobs: 0,
    failedJobs: 0,
    averageExecutionTimeMs: 0
  };

  constructor(
    private connection: ConnectionOptions,
    private workerConfig: WorkerConfig,
    private circuitConfig: CircuitBreakerConfig,
    private rateLimitConfig: RateLimitConfig,
    private skillHandlers: Map<string, (ctx: SkillExecutionContext) => Promise<unknown>>
  ) {
    this.circuitBreaker = new CircuitBreaker(circuitConfig);
    this.rateLimiter = new RateLimiter(rateLimitConfig);
    this.decisionEngine = new AutonomousDecisionEngine();
  }

  async initialize(): Promise<void> {
    this.queue = new Queue("nexus-skills", {
      connection: this.connection,
      defaultJobOptions: {
        attempts: this.workerConfig.maxRetries,
        backoff: {
          type: "exponential",
          delay: 1000
        }
      }
    });

    this.worker = new Worker(
      "nexus-skills",
      async (job: Job<Record<string, unknown>>) => {
        return this.processJob(job);
      },
      {
        connection: this.connection,
        concurrency: this.workerConfig.concurrency
      }
    );

    this.queueEvents = new QueueEvents("nexus-skills", {
      connection: this.connection
    });

    this.setupEventListeners();

    this.startCleanupInterval();
  }

  private setupEventListeners(): void {
    this.queueEvents.on("completed", ({ jobId }) => {
      this.stats.completedJobs++;
      this.jobContexts.delete(jobId!);
    });

    this.queueEvents.on("failed", ({ jobId, failedReason }) => {
      this.stats.failedJobs++;
      console.error(`Job ${jobId} failed:`, failedReason);
      this.jobContexts.delete(jobId!);
    });

    this.queueEvents.on("active", ({ jobId }) => {
      this.stats.runningJobs++;
    });
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.rateLimiter.cleanup();
    }, 60000);
  }

  private async processJob(job: Job<Record<string, unknown>>: Promise<Record<string, unknown>> {
    const context = this.jobContexts.get(job.id!);
    if (!context) {
      throw new Error("No execution context found for job");
    }

    const handler = this.skillHandlers.get(context.skillName);
    if (!handler) {
      throw new Error(`No handler found for skill: ${context.skillName}`);
    }

    const startTime = Date.now();

    const result = await this.circuitBreaker.execute(async () => {
      return handler(context);
    });

    this.stats.averageExecutionTimeMs =
      (this.stats.averageExecutionTimeMs * (this.stats.totalJobs - 1) +
       (Date.now() - startTime)) / this.stats.totalJobs;

    return { result, completedAt: new Date().toISOString() };
  }

  // ============================================
  // RBAC VALIDATION
  // ============================================

  validateRBAC(user: UserContext, skillCategory: SkillCategory, action: string): boolean {
    const requiredScopes: RBACScope[] = [];

    switch (action) {
      case "execute":
        requiredScopes.push(RBACScope.TENANT_USER, RBACScope.TENANT_ADMIN, RBACScope.GLOBAL_ADMIN);
        break;
      case "configure":
        requiredScopes.push(RBACScope.TENANT_ADMIN, RBACScope.GLOBAL_ADMIN);
        break;
      case "admin":
        requiredScopes.push(RBACScope.GLOBAL_ADMIN);
        break;
    }

    return user.roles.some(role => requiredScopes.includes(role));
  }

  // ============================================
  // AUTONOMOUS ROUTING
  // ============================================

  async routeExecution(context: SkillExecutionContext): Promise<string> {
    const decision = await this.decisionEngine.makeDecision(
      context,
      "route",
      `Routing execution for ${context.skillName} in ${context.category}`
    );

    const targetHandler = this.findBestHandler(context);

    await this.decisionEngine.makeDecision(
      context,
      "route",
      `Routed to handler: ${targetHandler}`
    );

    return targetHandler;
  }

  private findBestHandler(context: SkillExecutionContext): string {
    const availableHandlers = Array.from(this.skillHandlers.keys());

    if (availableHandlers.includes(context.skillName)) {
      return context.skillName;
    }

    const categoryHandlers = availableHandlers.filter(h =>
      h.startsWith(context.category)
    );

    return categoryHandlers[0] || availableHandlers[0];
  }

  // ============================================
  // PUBLIC API
  // ============================================

  async enqueue(
    skillName: string,
    category: SkillCategory,
    tenantId: string,
    payload: Record<string, unknown>,
    userContext: UserContext,
    options?: { priority?: number; jobId?: string }
  ): Promise<NexusQueueJob> {
    if (!this.validateRBAC(userContext, category, "execute")) {
      throw new Error("Insufficient permissions");
    }

    const normalizedPayload = {
      ...payload,
      tenantId,
      skillName,
      category,
      timestamp: new Date().toISOString()
    };

    const executionId = options?.jobId || uuidv4();
    const context: SkillExecutionContext = {
      executionId,
      skillName,
      category,
      user: userContext,
      input: normalizedPayload,
      options: {
        priority: options?.priority
      },
      startedAt: new Date().toISOString()
    };

    const rateLimitKey = `${tenantId}:${skillName}`;
    const rateLimitResult = this.rateLimiter.check(rateLimitKey);

    if (!rateLimitResult.allowed) {
      const decision = await this.decisionEngine.makeDecision(
        context,
        "fallback",
        `Rate limit exceeded for ${tenantId}:${skillName}`
      );
      throw new Error(`Rate limit exceeded. Retry after ${rateLimitResult.retryAfterMs}ms`);
    }

    const job = await this.queue.add(skillName, normalizedPayload, {
      jobId: executionId,
      priority: options?.priority || 0
    });

    this.stats.totalJobs++;
    this.stats.queuedJobs++;
    this.jobContexts.set(job.id!, context);

    return {
      id: job.id!,
      executionId,
      skillName,
      category,
      tenantId,
      payload: normalizedPayload,
      priority: options?.priority || 0,
      status: ExecutionStatus.QUEUED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0
    };
  }

  async getJob(jobId: string): Promise<NexusQueueJob | null> {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const context = this.jobContexts.get(jobId);

    return {
      id: job.id!,
      executionId: job.data.executionId as string || job.id!,
      skillName: job.name,
      category: job.data.category as SkillCategory,
      tenantId: job.data.tenantId as string,
      payload: job.data,
      priority: job.priority || 0,
      status: this.mapJobState(state),
      createdAt: new Date(job.timestamp).toISOString(),
      updatedAt: new Date(job.timestamp).toISOString(),
      startedAt: job.processedOn ? new Date(job.processedOn).toISOString() : undefined,
      completedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : undefined,
      result: job.returnvalue ? JSON.parse(job.returnvalue as string) : undefined,
      error: job.failedReason,
      retryCount: job.attemptsMade || 0
    };
  }

  private mapJobState(state: string): ExecutionStatus {
    switch (state) {
      case "waiting":
      case "delayed":
        return ExecutionStatus.QUEUED;
      case "active":
        return ExecutionStatus.RUNNING;
      case "completed":
        return ExecutionStatus.COMPLETED;
      case "failed":
        return ExecutionStatus.FAILED;
      case "paused":
        return ExecutionStatus.CANCELLED;
      default:
        return ExecutionStatus.QUEUED;
    }
  }

  async cancelJob(jobId: string, userContext: UserContext): Promise<boolean> {
    if (!this.validateRBAC(userContext, SkillCategory.CUSTOM, "execute")) {
      throw new Error("Insufficient permissions");
    }

    const job = await this.queue.getJob(jobId);
    if (!job) return false;

    await job.remove();
    this.jobContexts.delete(jobId);
    return true;
  }

  async retryJob(jobId: string): Promise<boolean> {
    const job = await this.queue.getJob(jobId);
    if (!job) return false;

    await job.retry();
    return true;
  }

  // ============================================
  // HEALTH CHECKS
  // ============================================

  async healthCheck(): Promise<SystemHealth> {
    const components: HealthCheckResult[] = [];
    let overallLatencyMs = 0;

    const queueHealth = await this.checkQueueHealth();
    components.push(queueHealth);
    overallLatencyMs += queueHealth.latencyMs;

    const workerHealth = this.checkWorkerHealth();
    components.push(workerHealth);
    overallLatencyMs += workerHealth.latencyMs;

    const circuitHealth: HealthCheckResult = {
      component: "circuit_breaker",
      status: this.circuitBreaker.getState() === CircuitState.OPEN ? "degraded" : "healthy",
      latencyMs: 1,
      message: `State: ${this.circuitBreaker.getState()}`
    };
    components.push(circuitHealth);

    const isHealthy = components.every(c => c.status === "healthy");

    return {
      isHealthy,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      components,
      overallLatencyMs
    };
  }

  private async checkQueueHealth(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const counts = await this.queue.getJobCounts();
      return {
        component: "queue",
        status: "healthy",
        latencyMs: Date.now() - start,
        details: counts
      };
    } catch (error) {
      return {
        component: "queue",
        status: "unhealthy",
        latencyMs: Date.now() - start,
        message: String(error)
      };
    }
  }

  private checkWorkerHealth(): HealthCheckResult {
    const start = Date.now();
    const workerCount = this.worker.stats?.completed || 0;

    return {
      component: "worker",
      status: "healthy",
      latencyMs: Date.now() - start,
      details: { jobsCompleted: workerCount }
    };
  }

  getStats(): DispatcherStats {
    return { ...this.stats };
  }

  getCircuitState(): CircuitState {
    return this.circuitBreaker.getState();
  }

  // ============================================
  // GRACEFUL SHUTDOWN
  // ============================================

  async shutdown(timeoutMs: number = 30000): Promise<void> {
    console.log("Starting graceful shutdown...");
    const startTime = Date.now();

    await this.worker.close();
    console.log("Worker closed");

    const pendingJobs = await this.queue.getWaitingCount();
    if (pendingJobs > 0) {
      console.log(`Waiting for ${pendingJobs} jobs to complete...`);
      await this.queueEvents.waitUntilFinished();
    }

    await this.queue.close();
    console.log("Queue closed");

    const elapsed = Date.now() - startTime;
    if (elapsed > timeoutMs) {
      console.warn(`Shutdown exceeded timeout: ${elapsed}ms > ${timeoutMs}ms`);
    }

    console.log("Graceful shutdown completed");
  }
}

// ============================================
// FACTORY
// ============================================

export async function createDispatcher(
  connection: ConnectionOptions,
  skillHandlers: Map<string, (ctx: SkillExecutionContext) => Promise<unknown>>,
  config?: Partial<{
    worker: WorkerConfig;
    circuit: CircuitBreakerConfig;
    rateLimit: RateLimitConfig;
  }>
): Promise<NexusSkillDispatcher> {
  const workerConfig: WorkerConfig = {
    concurrency: config?.worker?.concurrency || 5,
    skills: config?.worker?.skills || [],
    categories: config?.worker?.categories || [],
    timeoutMs: config?.worker?.timeoutMs || 30000,
    maxRetries: config?.worker?.maxRetries || 3
  };

  const circuitConfig: CircuitBreakerConfig = {
    failureThreshold: config?.circuit?.failureThreshold || 5,
    successThreshold: config?.circuit?.successThreshold || 2,
    timeoutMs: config?.circuit?.timeoutMs || 60000,
    halfOpenMaxAttempts: config?.circuit?.halfOpenMaxAttempts || 3
  };

  const rateLimitConfig: RateLimitConfig = {
    windowMs: config?.rateLimit?.windowMs || 60000,
    maxRequests: config?.rateLimit?.maxRequests || 100
  };

  const dispatcher = new NexusSkillDispatcher(
    connection,
    workerConfig,
    circuitConfig,
    rateLimitConfig,
    skillHandlers
  );

  await dispatcher.initialize();
  return dispatcher;
}
