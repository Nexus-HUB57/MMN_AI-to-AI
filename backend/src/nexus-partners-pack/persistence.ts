/**
 * Persistence Layer - Nexus Partners Pack
 * Camada de persistência para sagas, logs e state management
 *
 * Implementa storage em memória (preparado para extensão com DB/Redis)
 * quando infraestrutura estiver disponível
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  SagaLog,
  SagaState,
  NexusQueueJob,
  ExecutionStatus,
  TenantHealthStatus,
  CircuitState,
} from '../nexus-partners-pack/types';

// ============================================
// SAGA PERSISTENCE
// ============================================

export interface PersistedSaga {
  id: string;
  name: string;
  executionId: string;
  tenantId: string;
  state: SagaState;
  currentStep: number;
  totalSteps: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  result?: Record<string, unknown>;
  error?: string;
  steps: PersistedSagaStep[];
  metadata?: Record<string, unknown>;
}

export interface PersistedSagaStep {
  name: string;
  order: number;
  state: SagaState;
  startedAt?: string;
  completedAt?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  compensationInput?: Record<string, unknown>;
  error?: string;
  retryCount: number;
}

class SagaStore {
  private sagas: Map<string, PersistedSaga> = new Map();
  private logs: Map<string, SagaLog[]> = new Map();

  create(saga: Omit<PersistedSaga, 'id'>): PersistedSaga {
    const id = uuidv4();
    const persisted: PersistedSaga = { ...saga, id };
    this.sagas.set(id, persisted);
    this.logs.set(id, []);
    return persisted;
  }

  get(id: string): PersistedSaga | undefined {
    return this.sagas.get(id);
  }

  update(id: string, updates: Partial<PersistedSaga>): PersistedSaga | undefined {
    const saga = this.sagas.get(id);
    if (!saga) return undefined;

    const updated = { ...saga, ...updates, updatedAt: new Date().toISOString() };
    this.sagas.set(id, updated);
    return updated;
  }

  list(tenantId?: string): PersistedSaga[] {
    const all = Array.from(this.sagas.values());
    if (!tenantId) return all;
    return all.filter(s => s.tenantId === tenantId);
  }

  listByState(state: SagaState, tenantId?: string): PersistedSaga[] {
    return this.list(tenantId).filter(s => s.state === state);
  }

  complete(id: string, result?: Record<string, unknown>): PersistedSaga | undefined {
    return this.update(id, {
      state: 'completed',
      completedAt: new Date().toISOString(),
      result,
    });
  }

  fail(id: string, error: string): PersistedSaga | undefined {
    return this.update(id, {
      state: 'failed',
      error,
      completedAt: new Date().toISOString(),
    });
  }

  // Logs
  addLog(sagaId: string, log: SagaLog): void {
    if (!this.logs.has(sagaId)) {
      this.logs.set(sagaId, []);
    }
    this.logs.get(sagaId)!.push(log);
  }

  getLogs(sagaId: string): SagaLog[] {
    return this.logs.get(sagaId) || [];
  }

  // Limpeza
  prune(olderThanDays: number = 30): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    const cutoffStr = cutoff.toISOString();

    let count = 0;
    for (const [id, saga] of this.sagas.entries()) {
      if (saga.updatedAt < cutoffStr && (saga.state === 'completed' || saga.state === 'failed')) {
        this.sagas.delete(id);
        this.logs.delete(id);
        count++;
      }
    }
    return count;
  }

  getStats(): {
    total: number;
    byState: Record<SagaState, number>;
    averageDurationMs: number;
  } {
    const all = Array.from(this.sagas.values());
    const byState = all.reduce((acc, s) => {
      acc[s.state] = (acc[s.state] || 0) + 1;
      return acc;
    }, {} as Record<SagaState, number>);

    const completedWithTime = all
      .filter(s => s.completedAt && s.createdAt)
      .map(s => new Date(s.completedAt!).getTime() - new Date(s.createdAt).getTime());

    const avgDuration = completedWithTime.length > 0
      ? completedWithTime.reduce((a, b) => a + b, 0) / completedWithTime.length
      : 0;

    return {
      total: all.length,
      byState,
      averageDurationMs: Math.round(avgDuration),
    };
  }
}

// Instância singleton
export const sagaStore = new SagaStore();

// ============================================
// JOB QUEUE PERSISTENCE
// ============================================

class JobQueueStore {
  private queue: Map<string, NexusQueueJob> = new Map();
  private processing: Map<string, NexusQueueJob> = new Map();
  private completed: Map<string, NexusQueueJob> = new Map();

  enqueue(job: Omit<NexusQueueJob, 'id' | 'createdAt' | 'updatedAt' | 'retryCount'>): NexusQueueJob {
    const id = uuidv4();
    const now = new Date().toISOString();
    const persisted: NexusQueueJob = {
      ...job,
      id,
      createdAt: now,
      updatedAt: now,
      retryCount: 0,
    };
    this.queue.set(id, persisted);
    return persisted;
  }

  dequeue(category?: string): NexusQueueJob | undefined {
    const candidates = Array.from(this.queue.values())
      .filter(j => !category || j.category === category)
      .sort((a, b) => b.priority - a.priority);

    if (candidates.length === 0) return undefined;

    const job = candidates[0];
    this.queue.delete(job.id);
    job.status = 'running' as ExecutionStatus;
    job.startedAt = new Date().toISOString();
    this.processing.set(job.id, job);
    return job;
  }

  complete(id: string, result?: Record<string, unknown>): NexusQueueJob | undefined {
    const job = this.processing.get(id);
    if (!job) return undefined;

    this.processing.delete(id);
    job.status = 'completed' as ExecutionStatus;
    job.completedAt = new Date().toISOString();
    job.result = result;
    this.completed.set(id, job);
    return job;
  }

  fail(id: string, error: string): NexusQueueJob | undefined {
    const job = this.processing.get(id);
    if (!job) return undefined;

    this.processing.delete(id);
    job.retryCount++;
    job.error = error;

    if (job.retryCount >= 3) {
      job.status = 'failed' as ExecutionStatus;
      this.completed.set(id, job);
    } else {
      job.status = 'pending_retry' as ExecutionStatus;
      this.queue.set(id, job);
    }
    return job;
  }

  get(id: string): NexusQueueJob | undefined {
    return this.queue.get(id) || this.processing.get(id) || this.completed.get(id);
  }

  list(status?: ExecutionStatus): NexusQueueJob[] {
    if (status === 'queued') return Array.from(this.queue.values());
    if (status === 'running') return Array.from(this.processing.values());
    if (status === 'completed' || status === 'failed') {
      return Array.from(this.completed.values()).filter(j => j.status === status);
    }
    return [
      ...Array.from(this.queue.values()),
      ...Array.from(this.processing.values()),
      ...Array.from(this.completed.values()),
    ];
  }

  getStats(): {
    queued: number;
    running: number;
    completed: number;
    failed: number;
    averageExecutionTimeMs: number;
  } {
    const completedJobs = Array.from(this.completed.values()).filter(j => j.completedAt && j.startedAt);
    const avgTime = completedJobs.length > 0
      ? completedJobs.reduce((acc, j) => {
          const duration = new Date(j.completedAt!).getTime() - new Date(j.startedAt!).getTime();
          return acc + duration;
        }, 0) / completedJobs.length
      : 0;

    return {
      queued: this.queue.size,
      running: this.processing.size,
      completed: Array.from(this.completed.values()).filter(j => j.status === 'completed').length,
      failed: Array.from(this.completed.values()).filter(j => j.status === 'failed').length,
      averageExecutionTimeMs: Math.round(avgTime),
    };
  }
}

// Instância singleton
export const jobQueueStore = new JobQueueStore();

// ============================================
// TENANT STATE PERSISTENCE
// ============================================

export interface TenantState {
  tenantId: string;
  active: boolean;
  createdAt: string;
  lastActivity: string;
  executionsCount: number;
  currentExecutions: number;
  healthStatus: TenantHealthStatus;
  circuitBreakerState: CircuitState;
  circuitBreakerFailures: number;
}

class TenantStateStore {
  private tenants: Map<string, TenantState> = new Map();

  register(tenantId: string): TenantState {
    if (this.tenants.has(tenantId)) {
      return this.tenants.get(tenantId)!;
    }

    const state: TenantState = {
      tenantId,
      active: true,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      executionsCount: 0,
      currentExecutions: 0,
      healthStatus: {
        tenantId,
        isHealthy: true,
        circuitState: 'closed',
        activeExecutions: 0,
        queuedJobs: 0,
        failureRate: 0,
        lastHealthCheck: new Date().toISOString(),
        issues: [],
      },
      circuitBreakerState: 'closed',
      circuitBreakerFailures: 0,
    };

    this.tenants.set(tenantId, state);
    return state;
  }

  get(tenantId: string): TenantState | undefined {
    return this.tenants.get(tenantId);
  }

  update(tenantId: string, updates: Partial<TenantState>): TenantState | undefined {
    const state = this.tenants.get(tenantId);
    if (!state) return undefined;

    const updated = {
      ...state,
      ...updates,
      lastActivity: new Date().toISOString(),
    };
    this.tenants.set(tenantId, updated);
    return updated;
  }

  incrementExecution(tenantId: string): void {
    const state = this.get(tenantId);
    if (state) {
      state.executionsCount++;
      state.currentExecutions++;
    }
  }

  decrementExecution(tenantId: string): void {
    const state = this.get(tenantId);
    if (state && state.currentExecutions > 0) {
      state.currentExecutions--;
    }
  }

  recordFailure(tenantId: string): void {
    const state = this.get(tenantId);
    if (state) {
      state.circuitBreakerFailures++;
      if (state.circuitBreakerFailures >= 5) {
        state.circuitBreakerState = 'open';
      }
    }
  }

  resetCircuitBreaker(tenantId: string): void {
    const state = this.get(tenantId);
    if (state) {
      state.circuitBreakerState = 'closed';
      state.circuitBreakerFailures = 0;
    }
  }

  list(): TenantState[] {
    return Array.from(this.tenants.values());
  }

  listActive(): TenantState[] {
    return this.list().filter(t => t.active);
  }

  getStats(): {
    total: number;
    active: number;
    totalExecutions: number;
    averageHealthScore: number;
    tenantsWithIssues: number;
  } {
    const all = this.list();
    const avgHealth = all.length > 0
      ? (100 - all.reduce((acc, t) => acc + t.healthStatus.failureRate, 0) / all.length)
      : 0;

    return {
      total: all.length,
      active: all.filter(t => t.active).length,
      totalExecutions: all.reduce((acc, t) => acc + t.executionsCount, 0),
      averageHealthScore: Math.round(avgHealth),
      tenantsWithIssues: all.filter(t => !t.healthStatus.isHealthy).length,
    };
  }
}

// Instância singleton
export const tenantStateStore = new TenantStateStore();

