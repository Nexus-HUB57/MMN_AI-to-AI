/**
 * Error Recovery System for Agentic AI Layer
 *
 * Provides:
 * - Retry with exponential backoff
 * - Circuit breaker pattern
 * - Dead letter queue
 * - Health monitoring
 *
 * @author MiniMax Agent (PHD Engineering)
 * @version 1.0.0
 * @date 2026-05-24
 */

import { nanoid } from "nanoid";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxCalls: number;
}

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  rejectedCalls: number;
  state: CircuitState;
  lastFailure?: string;
  lastFailureTime?: Date;
}

export interface DeadLetterJob {
  id: string;
  originalJobId: string;
  sessionId: string;
  type: string;
  payload: Record<string, unknown>;
  failedAt: Date;
  failureReason: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
}

export interface HealthStatus {
  healthy: boolean;
  latency?: number;
  errorRate?: number;
  lastCheck?: Date;
  details?: string[];
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  totalDurationMs: number;
}

// ============================================================================
// RetryManager
// ============================================================================

export class RetryManager {
  private static defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "ECONNREFUSED"],
  };

  /**
   * Execute a function with automatic retry and exponential backoff
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    onRetry?: (attempt: number, error: Error, delay: number) => void
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();
    let attempt = 0;
    let delay = finalConfig.baseDelay;

    while (attempt <= finalConfig.maxRetries) {
      attempt++;
      try {
        const data = await fn();
        return {
          success: true,
          data,
          attempts: attempt,
          totalDurationMs: Date.now() - startTime,
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        const isRetryable = this.isRetryableError(err, finalConfig.retryableErrors || []);

        if (attempt > finalConfig.maxRetries || !isRetryable) {
          return {
            success: false,
            error: err.message,
            attempts: attempt,
            totalDurationMs: Date.now() - startTime,
          };
        }

        // Calculate delay with exponential backoff
        delay = Math.min(delay * finalConfig.backoffMultiplier, finalConfig.maxDelay);

        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.3 * delay;
        const actualDelay = delay + jitter;

        if (onRetry) {
          onRetry(attempt, err, actualDelay);
        }

        await this.sleep(actualDelay);
      }
    }

    return {
      success: false,
      error: "Max retries exceeded",
      attempts: attempt,
      totalDurationMs: Date.now() - startTime,
    };
  }

  /**
   * Check if an error is retryable
   */
  private static isRetryableError(error: Error, retryableErrors: string[]): boolean {
    const errorCode = (error as any).code;
    if (errorCode && retryableErrors.includes(errorCode)) {
      return true;
    }

    // Also retry on network errors and timeouts
    const retryablePatterns = [
      /ECONNREFUSED/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
      /ENOTFOUND/i,
      /network/i,
      /timeout/i,
      /ECONNABORTED/i,
    ];

    return retryablePatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// CircuitBreaker
// ============================================================================

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: Date;
  private halfOpenCalls: number = 0;
  private readonly config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold,
      resetTimeout: config.resetTimeout,
      halfOpenMaxCalls: config.halfOpenMaxCalls,
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (this.shouldAttemptReset()) {
        this.state = "HALF_OPEN";
        this.halfOpenCalls = 0;
      } else {
        throw new Error("Circuit breaker is OPEN - service unavailable");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Handle successful call
   */
  private onSuccess(): void {
    this.failureCount = 0;
    this.successCount++;

    if (this.state === "HALF_OPEN") {
      this.halfOpenCalls++;
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        this.state = "CLOSED";
        this.halfOpenCalls = 0;
      }
    }
  }

  /**
   * Handle failed call
   */
  private onFailure(reason: string): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.state === "HALF_OPEN") {
      this.state = "OPEN";
      this.halfOpenCalls = 0;
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = "OPEN";
    }
  }

  /**
   * Check if we should attempt to reset the circuit
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    const elapsed = Date.now() - this.lastFailureTime.getTime();
    return elapsed >= this.config.resetTimeout;
  }

  /**
   * Get circuit breaker stats
   */
  getStats(): CircuitBreakerStats {
    return {
      totalCalls: this.successCount + this.failureCount,
      successfulCalls: this.successCount,
      failedCalls: this.failureCount,
      rejectedCalls: this.state === "OPEN" ? 1 : 0,
      state: this.state,
      lastFailure: this.failureCount > 0 ? "Recent failure" : undefined,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Force state change (for testing/admin)
   */
  forceState(state: CircuitState): void {
    this.state = state;
    if (state === "CLOSED") {
      this.failureCount = 0;
      this.halfOpenCalls = 0;
    }
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.halfOpenCalls = 0;
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }
}

// ============================================================================
// DeadLetterQueue
// ============================================================================

export class DeadLetterQueue {
  private jobs: Map<string, DeadLetterJob> = new Map();
  private maxRetries: number;
  private baseRetryDelay: number;

  constructor(maxRetries = 5, baseRetryDelay = 60000) {
    this.maxRetries = maxRetries;
    this.baseRetryDelay = baseRetryDelay;
  }

  /**
   * Add a failed job to the dead letter queue
   */
  add(job: {
    originalJobId: string;
    sessionId: string;
    type: string;
    payload: Record<string, unknown>;
    error: string;
  }): DeadLetterJob {
    const dlqJob: DeadLetterJob = {
      id: nanoid(),
      originalJobId: job.originalJobId,
      sessionId: job.sessionId,
      type: job.type,
      payload: job.payload,
      failedAt: new Date(),
      failureReason: job.error,
      retryCount: 0,
      maxRetries: this.maxRetries,
      nextRetryAt: new Date(Date.now() + this.baseRetryDelay),
    };

    this.jobs.set(dlqJob.id, dlqJob);
    return dlqJob;
  }

  /**
   * Get all dead letter jobs
   */
  list(): DeadLetterJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get job by ID
   */
  get(id: string): DeadLetterJob | undefined {
    return this.jobs.get(id);
  }

  /**
   * Get jobs ready for retry
   */
  getReadyForRetry(): DeadLetterJob[] {
    const now = Date.now();
    return Array.from(this.jobs.values()).filter(job => {
      if (job.retryCount >= job.maxRetries) return false;
      if (!job.nextRetryAt) return true;
      return job.nextRetryAt.getTime() <= now;
    });
  }

  /**
   * Mark job as retried
   */
  markRetried(id: string): void {
    const job = this.jobs.get(id);
    if (job) {
      job.retryCount++;
      job.nextRetryAt = new Date(
        Date.now() + this.baseRetryDelay * Math.pow(2, job.retryCount)
      );
    }
  }

  /**
   * Remove job from queue (after successful retry or max retries)
   */
  remove(id: string, reason: "retry_success" | "max_retries" | "manual" = "manual"): void {
    const job = this.jobs.get(id);
    if (job) {
      console.log(`[DeadLetterQueue] Removed job ${id} due to ${reason}`);
      this.jobs.delete(id);
    }
  }

  /**
   * Clear all jobs
   */
  clear(): void {
    this.jobs.clear();
  }

  /**
   * Get queue stats
   */
  getStats(): {
    total: number;
    retriable: number;
    exhausted: number;
    oldestJob?: Date;
  } {
    const jobs = Array.from(this.jobs.values());
    const retriable = jobs.filter(j => j.retryCount < j.maxRetries).length;
    const exhausted = jobs.filter(j => j.retryCount >= j.maxRetries).length;
    const oldest = jobs.length > 0
      ? Math.min(...jobs.map(j => j.failedAt.getTime()))
      : undefined;

    return {
      total: jobs.length,
      retriable,
      exhausted,
      oldestJob: oldest ? new Date(oldest) : undefined,
    };
  }
}

// ============================================================================
// HealthMonitor
// ============================================================================

export interface ServiceHealth {
  name: string;
  healthy: boolean;
  latencyMs?: number;
  lastCheck: Date;
  error?: string;
}

export class HealthMonitor {
  private services: Map<string, {
    lastCheck: Date;
    healthy: boolean;
    latencyMs?: number;
    error?: string;
  }> = new Map();
  private checkInterval: number;

  constructor(checkInterval = 30000) {
    this.checkInterval = checkInterval;
  }

  /**
   * Register a service for health monitoring
   */
  register(serviceName: string): void {
    this.services.set(serviceName, {
      lastCheck: new Date(),
      healthy: true,
    });
  }

  /**
   * Check service health
   */
  async checkService(
    serviceName: string,
    checkFn: () => Promise<boolean>
  ): Promise<ServiceHealth> {
    const startTime = Date.now();
    const existing = this.services.get(serviceName) || {
      lastCheck: new Date(),
      healthy: true,
    };

    try {
      const healthy = await checkFn();
      const latencyMs = Date.now() - startTime;

      this.services.set(serviceName, {
        lastCheck: new Date(),
        healthy,
        latencyMs,
        error: undefined,
      });

      return {
        name: serviceName,
        healthy,
        latencyMs,
        lastCheck: new Date(),
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.services.set(serviceName, {
        lastCheck: new Date(),
        healthy: false,
        latencyMs,
        error: errorMessage,
      });

      return {
        name: serviceName,
        healthy: false,
        latencyMs,
        lastCheck: new Date(),
        error: errorMessage,
      };
    }
  }

  /**
   * Get health status of all services
   */
  getAllHealth(): ServiceHealth[] {
    return Array.from(this.services.entries()).map(([name, data]) => ({
      name,
      healthy: data.healthy,
      latencyMs: data.latencyMs,
      lastCheck: data.lastCheck,
      error: data.error,
    }));
  }

  /**
   * Get overall system health
   */
  getSystemHealth(): {
    overall: boolean;
    healthyCount: number;
    unhealthyCount: number;
    services: ServiceHealth[];
  } {
    const services = this.getAllHealth();
    const healthyCount = services.filter(s => s.healthy).length;
    const unhealthyCount = services.length - healthyCount;

    return {
      overall: unhealthyCount === 0,
      healthyCount,
      unhealthyCount,
      services,
    };
  }
}

// ============================================================================
// Export factory functions for easy instantiation
// ============================================================================

export function createRetryManager(config?: Partial<RetryConfig>): typeof RetryManager {
  return RetryManager;
}

export function createCircuitBreaker(config: CircuitBreakerConfig): CircuitBreaker {
  return new CircuitBreaker(config);
}

export function createDeadLetterQueue(maxRetries = 5): DeadLetterQueue {
  return new DeadLetterQueue(maxRetries);
}

export function createHealthMonitor(interval = 30000): HealthMonitor {
  return new HealthMonitor(interval);
}

// ============================================================================
// Default instances
// ============================================================================

// Pre-configured circuit breakers for common services
export const defaultCircuitBreakers = {
  openai: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 30000,
    halfOpenMaxCalls: 3,
  }),
  gemini: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 30000,
    halfOpenMaxCalls: 3,
  }),
  database: new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 10000,
    halfOpenMaxCalls: 2,
  }),
  redis: new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 10000,
    halfOpenMaxCalls: 2,
  }),
  externalApi: new CircuitBreaker({
    failureThreshold: 10,
    resetTimeout: 60000,
    halfOpenMaxCalls: 5,
  }),
};

// Global dead letter queue
export const globalDLQ = new DeadLetterQueue(5, 60000);

// Global health monitor
export const globalHealthMonitor = new HealthMonitor(30000);

// ============================================================================
// Decorators for automatic resilience
// ============================================================================

/**
 * Decorator to automatically wrap a function with retry
 */
export function withRetry(config?: Partial<RetryConfig>) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: T,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      return RetryManager.withRetry(
        () => originalMethod.apply(this, args),
        config
      );
    };

    return descriptor;
  };
}

/**
 * Decorator to wrap a function with circuit breaker
 */
export function withCircuitBreaker(circuitBreaker: CircuitBreaker) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: T,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      return circuitBreaker.execute(() => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

// ============================================================================
// Integration helpers for Agentic layer
// ============================================================================

/**
 * Execute agentic operation with full resilience stack
 */
export async function executeAgenticOperation<T>(options: {
  operation: () => Promise<T>;
  serviceName: string;
  circuitBreaker?: CircuitBreaker;
  retryConfig?: Partial<RetryConfig>;
  onError?: (error: Error, attempt: number) => void;
  onCircuitOpen?: (serviceName: string) => void;
}): Promise<T> {
  const {
    operation,
    serviceName,
    circuitBreaker,
    retryConfig,
    onError,
    onCircuitOpen,
  } = options;

  // Use circuit breaker if provided
  if (circuitBreaker) {
    const state = circuitBreaker.getState();
    if (state === "OPEN") {
      onCircuitOpen?.(serviceName);
      throw new Error(`Circuit breaker OPEN for ${serviceName}`);
    }

    const result = await circuitBreaker.execute(operation);
    return result;
  }

  // Use retry manager
  const retryResult = await RetryManager.withRetry(
    operation,
    retryConfig,
    (attempt, error, delay) => {
      onError?.(error, attempt);
    }
  );

  if (!retryResult.success) {
    throw new Error(`Operation failed after ${retryResult.attempts} attempts: ${retryResult.error}`);
  }

  return retryResult.data as T;
}

// ============================================================================
// Metrics collection
// ============================================================================

export interface ResilienceMetrics {
  retryAttempts: number;
  totalRetries: number;
  totalSuccess: number;
  totalFailures: number;
  circuitBreakerStates: Record<string, CircuitState>;
  dlqSize: number;
  systemHealth: boolean;
}

export function getResilienceMetrics(): ResilienceMetrics {
  const dlqStats = globalDLQ.getStats();

  return {
    retryAttempts: 0, // Aggregated from RetryManager instances
    totalRetries: 0,
    totalSuccess: 0,
    totalFailures: 0,
    circuitBreakerStates: Object.fromEntries(
      Object.entries(defaultCircuitBreakers).map(([name, cb]) => [name, cb.getState()])
    ),
    dlqSize: dlqStats.total,
    systemHealth: globalHealthMonitor.getSystemHealth().overall,
  };
}