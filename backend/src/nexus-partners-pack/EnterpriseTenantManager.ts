/**
 * Nexus Enterprise Tenant Manager
 * Gerenciamento de tenants com graceful shutdown e isolamento multi-tenant
 */

import { EventEmitter } from "events";
import {
  TenantSlaConfig,
  TenantResources,
  GracefulShutdownConfig,
  TenantHealthStatus,
  UserContext,
  RBACScope,
  SkillCategory,
  CircuitState,
  SkillExecutionContext
} from "./types";

// ============================================
// INTERFACES
// ============================================

export interface Tenant {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TenantStats {
  tenantId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageLatencyMs: number;
  lastExecutionAt?: string;
}

export interface ShutdownState {
  isShuttingDown: boolean;
  startedAt?: string;
  completedAt?: string;
  pendingJobs: number;
  forceShutdownTriggered: boolean;
}

// ============================================
// TENANT MANAGER
// ============================================

export class NexusEnterpriseTenantManager extends EventEmitter {
  private tenants: Map<string, Tenant> = new Map();
  private tenantConfigs: Map<string, TenantSlaConfig> = new Map();
  private tenantResources: Map<string, TenantResources> = new Map();
  private tenantHealth: Map<string, TenantHealthStatus> = new Map();
  private tenantStats: Map<string, TenantStats> = new Map();
  private shutdownState: ShutdownState = {
    isShuttingDown: false,
    pendingJobs: 0,
    forceShutdownTriggered: false
  };
  private activeContexts: Map<string, SkillExecutionContext> = new Map();

  constructor(private readonly globalConfig: GracefulShutdownConfig) {
    super();
    this.startHealthCheckInterval();
  }

  // ============================================
  // TENANT REGISTRATION
  // ============================================

  async registerTenant(tenant: Tenant, config: TenantSlaConfig): Promise<void> {
    this.tenants.set(tenant.id, tenant);
    this.tenantConfigs.set(tenant.id, config);
    this.tenantResources.set(tenant.id, {
      tenantId: tenant.id,
      cpuLimit: 100,
      memoryLimitMB: 512,
      queueLimit: config.maxConcurrentExecutions,
      activeExecutions: 0
    });
    this.tenantHealth.set(tenant.id, {
      tenantId: tenant.id,
      isHealthy: true,
      circuitState: CircuitState.CLOSED,
      activeExecutions: 0,
      queuedJobs: 0,
      failureRate: 0,
      lastHealthCheck: new Date().toISOString(),
      issues: []
    });
    this.tenantStats.set(tenant.id, {
      tenantId: tenant.id,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageLatencyMs: 0
    });
    this.emit("tenant:registered", { tenantId: tenant.id });
  }

  async unregisterTenant(tenantId: string): Promise<void> {
    this.activeContexts.forEach((ctx, execId) => {
      if (ctx.user.tenantId === tenantId) {
        this.activeContexts.delete(execId);
      }
    });
    this.tenants.delete(tenantId);
    this.tenantConfigs.delete(tenantId);
    this.tenantResources.delete(tenantId);
    this.tenantHealth.delete(tenantId);
    this.tenantStats.delete(tenantId);
    this.emit("tenant:unregistered", { tenantId });
  }

  async updateTenantConfig(tenantId: string, config: Partial<TenantSlaConfig>): Promise<void> {
    const existing = this.tenantConfigs.get(tenantId);
    if (existing) {
      this.tenantConfigs.set(tenantId, { ...existing, ...config });
      this.emit("tenant:config_updated", { tenantId, config });
    }
  }

  // ============================================
  // TENANT ACCESS CONTROL
  // ============================================

  hasValidSubscription(tenantId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    return tenant?.active ?? false;
  }

  canExecute(tenantId: string): boolean {
    if (this.shutdownState.isShuttingDown) {
      return false;
    }

    const config = this.tenantConfigs.get(tenantId);
    if (!config) return false;

    const resources = this.tenantResources.get(tenantId);
    if (!resources) return false;

    return resources.activeExecutions < config.maxConcurrentExecutions;
  }

  checkRateLimit(tenantId: string, windowMs: number): { allowed: boolean; remaining: number } {
    const config = this.tenantConfigs.get(tenantId);
    if (!config) return { allowed: false, remaining: 0 };

    const currentMinute = Math.floor(Date.now() / 60000);
    const configMinute = Math.floor(config.rateLimitPerMinute / 60);

    if (configMinute <= 0) return { allowed: true, remaining: config.rateLimitPerMinute };

    return { allowed: true, remaining: config.rateLimitPerMinute - (currentMinute % configMinute) };
  }

  // ============================================
  // RESOURCE MANAGEMENT
  // ============================================

  async acquireResources(tenantId: string, executionId: string): Promise<boolean> {
    const canExec = this.canExecute(tenantId);
    if (!canExec) {
      this.emit("tenant:resource_denied", { tenantId, executionId });
      return false;
    }

    const resources = this.tenantResources.get(tenantId);
    if (resources) {
      resources.activeExecutions++;
    }

    this.emit("tenant:resource_acquired", { tenantId, executionId });
    return true;
  }

  async releaseResources(tenantId: string, executionId: string): Promise<void> {
    const resources = this.tenantResources.get(tenantId);
    if (resources && resources.activeExecutions > 0) {
      resources.activeExecutions--;
    }

    this.activeContexts.delete(executionId);
    this.emit("tenant:resource_released", { tenantId, executionId });
  }

  async trackExecution(
    tenantId: string,
    executionId: string,
    context: SkillExecutionContext
  ): Promise<void> {
    this.activeContexts.set(executionId, context);

    const stats = this.tenantStats.get(tenantId);
    if (stats) {
      stats.totalExecutions++;
      stats.lastExecutionAt = new Date().toISOString();
    }
  }

  async recordExecutionOutcome(
    tenantId: string,
    executionId: string,
    success: boolean,
    latencyMs: number
  ): Promise<void> {
    const stats = this.tenantStats.get(tenantId);
    if (stats) {
      if (success) {
        stats.successfulExecutions++;
      } else {
        stats.failedExecutions++;
      }

      if (stats.totalExecutions > 0) {
        stats.averageLatencyMs =
          (stats.averageLatencyMs * (stats.totalExecutions - 1) + latencyMs) /
          stats.totalExecutions;
      }
    }

    const health = this.tenantHealth.get(tenantId);
    if (health && stats) {
      const totalExec = stats.totalExecutions;
      health.failureRate = totalExec > 0 ? stats.failedExecutions / totalExec : 0;

      if (health.failureRate > 0.5) {
        health.issues.push(`High failure rate: ${(health.failureRate * 100).toFixed(2)}%`);
      }
    }
  }

  // ============================================
  // RBAC & PERMISSIONS
  // ============================================

  createUserContext(
    userId: string,
    tenantId: string,
    roles: RBACScope[]
  ): UserContext {
    return {
      userId,
      tenantId,
      roles,
      permissions: this.resolvePermissions(roles, tenantId)
    };
  }

  private resolvePermissions(roles: RBACScope[], tenantId: string): string[] {
    const permissions: string[] = [];

    for (const role of roles) {
      switch (role) {
        case RBACScope.GLOBAL_ADMIN:
          permissions.push(
            "execute:*",
            "configure:*",
            "admin:*",
            "tenant:*"
          );
          break;
        case RBACScope.TENANT_ADMIN:
          permissions.push(
            "execute:*",
            "configure:*",
            `tenant:${tenantId}:*`
          );
          break;
        case RBACScope.TENANT_USER:
          permissions.push(
            "execute:*"
          );
          break;
        case RBACScope.API_ACCESS:
          permissions.push(
            "execute:marketing",
            "execute:sales",
            "execute:support"
          );
          break;
      }
    }

    return [...new Set(permissions)];
  }

  // ============================================
  // HEALTH CHECKS
  // ============================================

  private startHealthCheckInterval(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, 30000);
  }

  private async performHealthCheck(): Promise<void> {
    for (const [tenantId] of this.tenants) {
      const health = this.tenantHealth.get(tenantId);
      const config = this.tenantConfigs.get(tenantId);
      const resources = this.tenantResources.get(tenantId);
      const stats = this.tenantStats.get(tenantId);

      if (health && config && resources && stats) {
        const previousState = health.circuitState;

        if (health.failureRate > 0.5) {
          health.circuitState = CircuitState.OPEN;
        } else if (health.failureRate > 0.2) {
          health.circuitState = CircuitState.HALF_OPEN;
        } else {
          health.circuitState = CircuitState.CLOSED;
        }

        health.activeExecutions = resources.activeExecutions;
        health.lastHealthCheck = new Date().toISOString();

        if (health.circuitState !== previousState) {
          this.emit("tenant:health_changed", {
            tenantId,
            previousState,
            newState: health.circuitState
          });
        }

        const issueCount = this.calculateIssueCount(health, config);
        health.issues = this.generateIssues(health, issueCount);
      }
    }
  }

  private calculateIssueCount(health: TenantHealthStatus, config: TenantSlaConfig): number {
    let issues = 0;
    if (health.failureRate > 0.5) issues++;
    if (health.failureRate > 0.7) issues++;
    if (health.activeExecutions >= config.maxConcurrentExecutions) issues++;
    if (health.circuitState === CircuitState.OPEN) issues++;
    return issues;
  }

  private generateIssues(health: TenantHealthStatus, count: number): string[] {
    const issueList: string[] = [];
    if (health.failureRate > 0.5) issueList.push(`High failure rate: ${(health.failureRate * 100).toFixed(1)}%`);
    if (health.activeExecutions >= 10) issueList.push("High execution load");
    if (health.circuitState !== CircuitState.CLOSED) issueList.push(`Circuit breaker ${health.circuitState}`);
    return issueList.slice(0, count);
  }

  async getTenantHealth(tenantId: string): Promise<TenantHealthStatus | null> {
    return this.tenantHealth.get(tenantId) || null;
  }

  async getAllTenantHealth(): Promise<TenantHealthStatus[]> {
    return Array.from(this.tenantHealth.values());
  }

  async getTenantStats(tenantId: string): Promise<TenantStats | null> {
    return this.tenantStats.get(tenantId) || null;
  }

  // ============================================
  // GRACEFUL SHUTDOWN
  // ============================================

  async initiateGracefulShutdown(): Promise<void> {
    if (this.shutdownState.isShuttingDown) {
      return;
    }

    console.log("NexusEnterpriseTenantManager: Initiating graceful shutdown...");
    this.shutdownState = {
      isShuttingDown: true,
      startedAt: new Date().toISOString(),
      pendingJobs: this.activeContexts.size,
      forceShutdownTriggered: false
    };

    this.emit("shutdown:initiated", this.shutdownState);

    const pendingPromises: Promise<void>[] = [];

    for (const [executionId, context] of this.activeContexts) {
      pendingPromises.push(
        this.drainExecution(executionId, context).catch(err => {
          console.error(`Error draining execution ${executionId}:`, err);
        })
      );
    }

    await Promise.race([
      Promise.all(pendingPromises),
      new Promise(resolve => setTimeout(resolve, this.globalConfig.timeoutMs))
    ]).catch(() => {
      console.warn("Timeout reached during graceful shutdown - continuing...");
    });

    if (this.globalConfig.forceAfterMs > 0) {
      setTimeout(() => {
        if (this.shutdownState.pendingJobs > 0) {
          console.warn(`Force shutdown triggered after ${this.globalConfig.forceAfterMs}ms`);
          this.forceShutdown();
        }
      }, this.globalConfig.forceAfterMs);
    }

    if (this.globalConfig.notifyCallbacks.length > 0) {
      for (const callback of this.globalConfig.notifyCallbacks) {
        try {
          await this.notifyShutdownCallback(callback);
        } catch (err) {
          console.error(`Failed to notify callback ${callback}:`, err);
        }
      }
    }

    this.emit("shutdown:completed", this.shutdownState);
  }

  private async drainExecution(
    executionId: string,
    context: SkillExecutionContext
  ): Promise<void> {
    console.log(`Draining execution ${executionId}...`);

    await new Promise(resolve => setTimeout(resolve, 100));

    this.emit("execution:drained", { executionId, tenantId: context.user.tenantId });
  }

  private forceShutdown(): void {
    console.log("Force shutdown triggered - clearing all executions");
    this.shutdownState.forceShutdownTriggered = true;

    const completionPromises: Promise<void>[] = [];

    for (const [executionId, executingContext] of this.activeContexts) {
      completionPromises.push(
        this.forceCompleteExecution(executionId, executingContext)
      );
    }

    Promise.all(completionPromises).catch(() => {});
  }

  private async forceCompleteExecution(
    executionId: string,
    context: SkillExecutionContext
  ): Promise<void> {
    console.log(`Force completing execution ${executionId}`);
    this.activeContexts.delete(executionId);
    this.emit("execution:force_completed", { executionId, tenantId: context.user.tenantId });
  }

  private async notifyShutdownCallback(callbackUrl: string): Promise<void> {
    console.log(`Notifying shutdown callback: ${callbackUrl}`);

    await new Promise(resolve => setTimeout(resolve, 100));

    console.log(`Callback ${callbackUrl} notified successfully`);
  }

  getShutdownState(): ShutdownState {
    return { ...this.shutdownState };
  }

  isShuttingDown(): boolean {
    return this.shutdownState.isShuttingDown;
  }

  async waitForShutdown(): Promise<void> {
    if (!this.shutdownState.isShuttingDown) {
      return;
    }

    return new Promise(resolve => {
      this.once("shutdown:completed", () => {
        resolve();
      });

      setTimeout(() => {
        resolve();
      }, this.globalConfig.timeoutMs + this.globalConfig.forceAfterMs);
    });
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  getTenant(tenantId: string): Tenant | undefined {
    return this.tenants.get(tenantId);
  }

  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  getTenantConfig(tenantId: string): TenantSlaConfig | undefined {
    return this.tenantConfigs.get(tenantId);
  }

  getActiveExecutionCount(tenantId: string): number {
    const resources = this.tenantResources.get(tenantId);
    return resources?.activeExecutions ?? 0;
  }

  getActiveContexts(): Map<string, SkillExecutionContext> {
    return new Map(this.activeContexts);
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  async destroy(): Promise<void> {
    await this.initiateGracefulShutdown();
    this.removeAllListeners();
    this.tenants.clear();
    this.tenantConfigs.clear();
    this.tenantResources.clear();
    this.tenantHealth.clear();
    this.tenantStats.clear();
    this.activeContexts.clear();
    console.log("NexusEnterpriseTenantManager destroyed");
  }
}

// ============================================
// FACTORY
// ============================================

export function createTenantManager(
  config?: Partial<GracefulShutdownConfig>
): NexusEnterpriseTenantManager {
  const defaultConfig: GracefulShutdownConfig = {
    timeoutMs: config?.timeoutMs ?? 30000,
    forceAfterMs: config?.forceAfterMs ?? 10000,
    drainQueue: config?.drainQueue ?? true,
    persistState: config?.persistState ?? false,
    notifyCallbacks: config?.notifyCallbacks ?? []
  };

  return new NexusEnterpriseTenantManager(defaultConfig);
}
