/**
 * Nexus Self-Healing Engine
 * Reconciliação de sagas e auto-recuperação de falhas
 */

import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";
import {
  SagaLog,
  SagaDefinition,
  SagaStepDefinition,
  SagaState,
  RetryPolicy,
  ReconciliationResult,
  ExecutionResult
} from "./types";

// ============================================
// INTERFACES
// ============================================

export interface SagaInstance {
  id: string;
  definitionId: string;
  executionId: string;
  tenantId: string;
  state: SagaState;
  currentStep: number;
  steps: SagaLog[];
  compensationHistory: SagaLog[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface SagaStepResult {
  stepName: string;
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  compensated: boolean;
  executionTimeMs: number;
}

export interface SagaExecutionContext {
  executionId: string;
  tenantId: string;
  input: Record<string, unknown>;
  onStepComplete: (step: SagaStepResult) => Promise<void>;
  onStepFailed: (step: SagaStepResult) => Promise<void>;
  onCompensation: (compensation: SagaStepResult) => Promise<void>;
}

export interface HealingPolicy {
  maxCompensationAttempts: number;
  autoRetryEnabled: boolean;
  autoCompensateEnabled: boolean;
  escalationThreshold: number;
  healthCheckIntervalMs: number;
}

export interface HealthStatus {
  engineId: string;
  isHealthy: boolean;
  activeSagas: number;
  pendingReconciliations: number;
  lastHealthCheck: string;
  issues: string[];
}

// ============================================
// STEP EXECUTOR
// ============================================

class SagaStepExecutor {
  constructor(
    private actionHandlers: Map<string, (input: Record<string, unknown>) => Promise<Record<string, unknown>>>,
    private compensationHandlers: Map<string, (input: Record<string, unknown>) => Promise<void>>
  ) {}

  async executeStep(
    step: SagaStepDefinition,
    context: SagaExecutionContext,
    input: Record<string, unknown>
  ): Promise<SagaStepResult> {
    const startTime = Date.now();
    const handler = this.actionHandlers.get(step.action);

    if (!handler) {
      return {
        stepName: step.name,
        success: false,
        error: `No handler found for action: ${step.action}`,
        compensated: false,
        executionTimeMs: Date.now() - startTime
      };
    }

    try {
      const output = await this.executeWithTimeout(handler, input, step.timeoutMs);

      return {
        stepName: step.name,
        success: true,
        output,
        compensated: false,
        executionTimeMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        stepName: step.name,
        success: false,
        error: String(error),
        compensated: false,
        executionTimeMs: Date.now() - startTime
      };
    }
  }

  async executeCompensation(
    step: SagaStepDefinition,
    compensationData: Record<string, unknown>
  ): Promise<SagaStepResult> {
    const startTime = Date.now();
    const handler = this.compensationHandlers.get(step.compensationAction);

    if (!handler) {
      return {
        stepName: step.name,
        success: false,
        error: `No compensation handler found: ${step.compensationAction}`,
        compensated: false,
        executionTimeMs: Date.now() - startTime
      };
    }

    try {
      await this.executeWithTimeout(handler, compensationData, step.timeoutMs);

      return {
        stepName: step.name,
        success: true,
        compensated: true,
        executionTimeMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        stepName: step.name,
        success: false,
        error: String(error),
        compensated: false,
        executionTimeMs: Date.now() - startTime
      };
    }
  }

  private executeWithTimeout<T>(
    fn: (input: Record<string, unknown>) => Promise<T>,
    input: Record<string, unknown>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      fn(input),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Step timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }
}

// ============================================
// RECONCILIATION ENGINE
// ============================================

class ReconciliationEngine {
  private pendingReconciliations: Map<string, ReconciliationResult> = new Map();

  constructor(private healingPolicy: HealingPolicy) {}

  async reconcile(
    saga: SagaInstance,
    executor: SagaStepExecutor,
    stepDefinitions: SagaStepDefinition[]
  ): Promise<ReconciliationResult> {
    console.log(`Starting reconciliation for saga ${saga.id}`);

    const actionsTaken: string[] = [];
    let compensated = false;
    let recovered = false;

    if (saga.state === SagaState.FAILED || saga.state === SagaState.COMPENSATING) {
      const compensationResult = await this.performCompensation(
        saga,
        executor,
        stepDefinitions,
        actionsTaken
      );
      compensated = compensationResult.compensated;
    }

    if (saga.state === SagaState.IN_PROGRESS) {
      const recoveryResult = await this.attemptRecovery(
        saga,
        executor,
        stepDefinitions,
        actionsTaken
      );
      recovered = recoveryResult.recovered;
    }

    const result: ReconciliationResult = {
      executionId: saga.executionId,
      sagaId: saga.id,
      status: compensated || recovered ? "reconciled" : "failed",
      actionsTaken,
      compensated,
      recovered
    };

    this.pendingReconciliations.set(saga.id, result);
    return result;
  }

  private async performCompensation(
    saga: SagaInstance,
    executor: SagaStepExecutor,
    stepDefinitions: SagaStepDefinition[],
    actionsTaken: string[]
  ): Promise<{ compensated: boolean }> {
    console.log(`Performing compensation for saga ${saga.id}`);

    let successfullyCompensated = true;

    for (let i = saga.currentStep - 1; i >= 0; i--) {
      const stepDef = stepDefinitions[i];
      const existingLog = saga.steps[i];

      if (existingLog && existingLog.output) {
        const compensationResult = await executor.executeCompensation(
          stepDef,
          existingLog.output
        );

        actionsTaken.push(
          `Compensated step ${stepDef.name}: ${compensationResult.success ? "success" : "failed"}`
        );

        if (!compensationResult.success) {
          successfullyCompensated = false;
        }
      }
    }

    return { compensated: successfullyCompensated };
  }

  private async attemptRecovery(
    saga: SagaInstance,
    executor: SagaStepExecutor,
    stepDefinitions: SagaStepDefinition[],
    actionsTaken: string[]
  ): Promise<{ recovered: boolean }> {
    console.log(`Attempting recovery for saga ${saga.id}`);

    for (let i = saga.currentStep; i < stepDefinitions.length; i++) {
      const stepDef = stepDefinitions[i];
      const existingLog = saga.steps[i];

      if (!existingLog || existingLog.state !== SagaState.COMPLETED) {
        actionsTaken.push(`Recovery needed for step ${stepDef.name}`);
      }
    }

    return { recovered: saga.state === SagaState.COMPLETED };
  }

  getPendingReconciliations(): ReconciliationResult[] {
    return Array.from(this.pendingReconciliations.values());
  }

  clearReconciliation(sagaId: string): void {
    this.pendingReconciliations.delete(sagaId);
  }
}

// ============================================
// SELF-HEALING ENGINE
// ============================================

export class NexusSelfHealingEngine extends EventEmitter {
  private sagas: Map<string, SagaInstance> = new Map();
  private sagaDefinitions: Map<string, SagaDefinition> = new Map();
  private stepExecutor: SagaStepExecutor;
  private reconciliationEngine: ReconciliationEngine;
  private healthStatus: HealthStatus;

  constructor(
    private healingPolicy: HealingPolicy,
    actionHandlers: Map<string, (input: Record<string, unknown>) => Promise<Record<string, unknown>>> = new Map(),
    compensationHandlers: Map<string, (input: Record<string, unknown>) => Promise<void>> = new Map()
  ) {
    super();

    this.stepExecutor = new SagaStepExecutor(actionHandlers, compensationHandlers);
    this.reconciliationEngine = new ReconciliationEngine(healingPolicy);
    this.healthStatus = {
      engineId: uuidv4(),
      isHealthy: true,
      activeSagas: 0,
      pendingReconciliations: 0,
      lastHealthCheck: new Date().toISOString(),
      issues: []
    };

    this.startHealthMonitoring();
  }

  // ============================================
  // SAGA DEFINITIONS
  // ============================================

  registerSagaDefinition(definition: SagaDefinition): void {
    this.sagaDefinitions.set(definition.id, definition);
    this.emit("saga:definition_registered", { definitionId: definition.id });
  }

  getSagaDefinition(definitionId: string): SagaDefinition | undefined {
    return this.sagaDefinitions.get(definitionId);
  }

  // ============================================
  // SAGA LIFECYCLE
  // ============================================

  async startSaga(
    definitionId: string,
    executionId: string,
    tenantId: string,
    input: Record<string, unknown>
  ): Promise<SagaInstance> {
    const definition = this.sagaDefinitions.get(definitionId);
    if (!definition) {
      throw new Error(`Saga definition not found: ${definitionId}`);
    }

    const saga: SagaInstance = {
      id: uuidv4(),
      definitionId,
      executionId,
      tenantId,
      state: SagaState.PENDING,
      currentStep: 0,
      steps: [],
      compensationHistory: [],
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.sagas.set(saga.id, saga);
    this.updateHealthStatus();

    console.log(`Started saga ${saga.id} with definition ${definitionId}`);
    this.emit("saga:started", { sagaId: saga.id, executionId });

    return saga;
  }

  async executeSaga(
    definitionId: string,
    executionId: string,
    tenantId: string,
    input: Record<string, unknown>
  ): Promise<ExecutionResult<SagaInstance>> {
    const startTime = Date.now();
    const saga = await this.startSaga(definitionId, executionId, tenantId, input);

    try {
      saga.state = SagaState.IN_PROGRESS;
      saga.updatedAt = new Date().toISOString();

      const definition = this.sagaDefinitions.get(definitionId)!;
      const context: SagaExecutionContext = {
        executionId: saga.executionId,
        tenantId: saga.tenantId,
        input,
        onStepComplete: async (step) => this.handleStepComplete(saga, step),
        onStepFailed: async (step) => this.handleStepFailed(saga, step),
        onCompensation: async (compensation) => this.handleCompensation(saga, compensation)
      };

      for (let i = 0; i < definition.steps.length; i++) {
        const stepDef = definition.steps[i];

        saga.currentStep = i;
        saga.updatedAt = new Date().toISOString();

        const stepResult = await this.executeSagaStep(saga, stepDef, input);

        if (!stepResult.success) {
          if (this.healingPolicy.autoCompensateEnabled) {
            await this.initiateCompensation(saga, definition.steps, i);
          }
          throw new Error(`Step ${stepDef.name} failed: ${stepResult.error}`);
        }

        await context.onStepComplete(stepResult);
      }

      saga.state = SagaState.COMPLETED;
      saga.completedAt = new Date().toISOString();
      saga.updatedAt = new Date().toISOString();

      this.updateHealthStatus();
      this.emit("saga:completed", { sagaId: saga.id });

      return {
        success: true,
        executionId: saga.executionId,
        data: saga,
        executionTimeMs: Date.now() - startTime
      };
    } catch (error) {
      saga.state = SagaState.FAILED;
      saga.error = String(error);
      saga.updatedAt = new Date().toISOString();

      this.updateHealthStatus();
      this.emit("saga:failed", {
        sagaId: saga.id,
        error: saga.error
      });

      return {
        success: false,
        executionId: saga.executionId,
        error: String(error),
        executionTimeMs: Date.now() - startTime
      };
    }
  }

  private async executeSagaStep(
    saga: SagaInstance,
    stepDef: SagaStepDefinition,
    input: Record<string, unknown>
  ): Promise<SagaStepResult> {
    console.log(`Executing step ${stepDef.name} for saga ${saga.id}`);

    const stepStartTime = Date.now();
    let attemptCount = 0;
    let lastError: string | undefined;

    while (attemptCount < this.healingPolicy.maxCompensationAttempts) {
      try {
        const output = await this.stepExecutor.executeStep(stepDef, {
          executionId: saga.executionId,
          tenantId: saga.tenantId,
          input,
          onStepComplete: async () => {},
          onStepFailed: async () => {},
          onCompensation: async () => {}
        }, input);

        const sagaLog: SagaLog = {
          id: uuidv4(),
          sagaId: saga.id,
          executionId: saga.executionId,
          tenantId: saga.tenantId,
          stepName: stepDef.name,
          stepOrder: saga.currentStep,
          state: SagaState.COMPLETED,
          input,
          output: output.output,
          startedAt: new Date(stepStartTime).toISOString(),
          completedAt: new Date().toISOString()
        };

        saga.steps.push(sagaLog);
        saga.updatedAt = new Date().toISOString();

        console.log(`Step ${stepDef.name} completed successfully`);
        return output;
      } catch (error) {
        attemptCount++;
        lastError = String(error);

        if (this.healingPolicy.autoRetryEnabled && attemptCount < this.healingPolicy.maxCompensationAttempts) {
          const delay = Math.pow(2, attemptCount) * 1000;
          console.log(`Retrying step ${stepDef.name} in ${delay}ms (attempt ${attemptCount})`);
          await this.sleep(delay);
        }
      }
    }

    return {
      stepName: stepDef.name,
      success: false,
      error: `Failed after ${attemptCount} attempts: ${lastError}`,
      compensated: false,
      executionTimeMs: Date.now() - stepStartTime
    };
  }

  // ============================================
  // COMPENSATION
  // ============================================

  private async initiateCompensation(
    saga: SagaInstance,
    steps: SagaStepDefinition[],
    failedStepIndex: number
  ): Promise<void> {
    console.log(`Initiating compensation for saga ${saga.id} from step ${failedStepIndex}`);

    saga.state = SagaState.COMPENSATING;
    saga.updatedAt = new Date().toISOString();

    this.emit("saga:compensation_started", { sagaId: saga.id, fromStep: failedStepIndex });

    for (let i = failedStepIndex - 1; i >= 0; i--) {
      const stepDef = steps[i];
      const existingLog = saga.steps[i];

      if (existingLog && existingLog.output) {
        const compensationResult = await this.stepExecutor.executeCompensation(
          stepDef,
          existingLog.output
        );

        const compensationLog: SagaLog = {
          id: uuidv4(),
          sagaId: saga.id,
          executionId: saga.executionId,
          tenantId: saga.tenantId,
          stepName: stepDef.name,
          stepOrder: i,
          state: compensationResult.success ? SagaState.COMPLETED : SagaState.FAILED,
          input: {},
          compensationInput: compensationResult.output || {},
          error: compensationResult.error,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        };

        saga.compensationHistory.push(compensationLog);

        if (compensationResult.success) {
          saga.steps[i].state = SagaState.COMPLETED;
        }

        this.emit("saga:step_compensated", {
          sagaId: saga.id,
          stepName: stepDef.name,
          success: compensationResult.success
        });
      }
    }

    saga.state = SagaState.COMPLETED;
    saga.completedAt = new Date().toISOString();
    saga.updatedAt = new Date().toISOString();

    console.log(`Compensation completed for saga ${saga.id}`);
    this.emit("saga:compensation_completed", { sagaId: saga.id });
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  private async handleStepComplete(saga: SagaInstance, step: SagaStepResult): Promise<void> {
    this.emit("saga:step_completed", {
      sagaId: saga.id,
      stepName: step.stepName,
      executionTimeMs: step.executionTimeMs
    });
  }

  private async handleStepFailed(saga: SagaInstance, step: SagaStepResult): Promise<void> {
    this.emit("saga:step_failed", {
      sagaId: saga.id,
      stepName: step.stepName,
      error: step.error
    });
  }

  private async handleCompensation(saga: SagaInstance, compensation: SagaStepResult): Promise<void> {
    this.emit("saga:compensated", {
      sagaId: saga.id,
      stepName: compensation.stepName,
      success: compensation.compensated
    });
  }

  // ============================================
  // RECONCILIATION
  // ============================================

  async reconcileSaga(sagaId: string): Promise<ReconciliationResult> {
    const saga = this.sagas.get(sagaId);
    if (!saga) {
      throw new Error(`Saga not found: ${sagaId}`);
    }

    const definition = this.sagaDefinitions.get(saga.definitionId);
    if (!definition) {
      throw new Error(`Saga definition not found: ${saga.definitionId}`);
    }

    const result = await this.reconciliationEngine.reconcile(
      saga,
      this.stepExecutor,
      definition.steps
    );

    this.emit("saga:reconciled", {
      sagaId,
      result
    });

    return result;
  }

  async reconcileAll(): Promise<ReconciliationResult[]> {
    const results: ReconciliationResult[] = [];

    for (const [sagaId] of this.sagas) {
      const saga = this.sagas.get(sagaId)!;

      if (saga.state === SagaState.FAILED || saga.state === SagaState.COMPENSATING || saga.state === SagaState.IN_PROGRESS) {
        const result = await this.reconcileSaga(sagaId);
        results.push(result);
      }
    }

    this.updateHealthStatus();
    return results;
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  getSaga(sagaId: string): SagaInstance | undefined {
    return this.sagas.get(sagaId);
  }

  getSagasByExecution(executionId: string): SagaInstance[] {
    return Array.from(this.sagas.values()).filter(s => s.executionId === executionId);
  }

  getSagasByTenant(tenantId: string): SagaInstance[] {
    return Array.from(this.sagas.values()).filter(s => s.tenantId === tenantId);
  }

  getActiveSagas(): SagaInstance[] {
    return Array.from(this.sagas.values()).filter(s =>
      s.state === SagaState.IN_PROGRESS || s.state === SagaState.PENDING
    );
  }

  getFailedSagas(): SagaInstance[] {
    return Array.from(this.sagas.values()).filter(s =>
      s.state === SagaState.FAILED || s.state === SagaState.COMPENSATING
    );
  }

  async getSagaLogs(sagaId: string): Promise<SagaLog[]> {
    const saga = this.sagas.get(sagaId);
    if (!saga) {
      return [];
    }

    return [...saga.steps, ...saga.compensationHistory].sort((a, b) =>
      a.startedAt.localeCompare(b.startedAt)
    );
  }

  // ============================================
  // HEALTH MONITORING
  // ============================================

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, this.healingPolicy.healthCheckIntervalMs);
  }

  private performHealthCheck(): void {
    const failedCount = this.getFailedSagas().length;
    const pendingReconciliations = failedCount;

    this.healthStatus = {
      engineId: this.healthStatus.engineId,
      isHealthy: failedCount < this.healingPolicy.escalationThreshold,
      activeSagas: this.getActiveSagas().length,
      pendingReconciliations,
      lastHealthCheck: new Date().toISOString(),
      issues: failedCount > 0 ? [`${failedCount} failed sagas requiring reconciliation`] : []
    };

    if (this.healthStatus.pendingReconciliations > this.healingPolicy.escalationThreshold) {
      this.emit("health:degraded", this.healthStatus);
    }

    this.emit("health:check", this.healthStatus);
  }

  getHealthStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  removeSaga(sagaId: string): void {
    const saga = this.sagas.get(sagaId);
    if (saga) {
      this.sagas.delete(sagaId);
      this.updateHealthStatus();
      this.emit("saga:removed", { sagaId });
    }
  }

  clearCompletedSagas(): number {
    let cleared = 0;

    for (const [sagaId, saga] of this.sagas) {
      if (saga.state === SagaState.COMPLETED) {
        this.sagas.delete(sagaId);
        cleared++;
      }
    }

    return cleared;
  }

  async destroy(): Promise<void> {
    this.removeAllListeners();
    this.sagas.clear();
    this.sagaDefinitions.clear();
    console.log("NexusSelfHealingEngine destroyed");
  }

  // ============================================
  // UTILITIES
  // ============================================

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private updateHealthStatus(): void {
    this.healthStatus.activeSagas = this.getActiveSagas().length;
    this.healthStatus.pendingReconciliations = this.getFailedSagas().length;
    this.healthStatus.lastHealthCheck = new Date().toISOString();
  }
}

// ============================================
// FACTORY
// ============================================

export function createSelfHealingEngine(
  healingPolicy?: Partial<HealingPolicy>,
  actionHandlers?: Map<string, (input: Record<string, unknown>) => Promise<Record<string, unknown>>>,
  compensationHandlers?: Map<string, (input: Record<string, unknown>) => Promise<void>>
): NexusSelfHealingEngine {
  const defaultPolicy: HealingPolicy = {
    maxCompensationAttempts: healingPolicy?.maxCompensationAttempts ?? 3,
    autoRetryEnabled: healingPolicy?.autoRetryEnabled ?? true,
    autoCompensateEnabled: healingPolicy?.autoCompensateEnabled ?? true,
    escalationThreshold: healingPolicy?.escalationThreshold ?? 10,
    healthCheckIntervalMs: healingPolicy?.healthCheckIntervalMs ?? 60000
  };

  return new NexusSelfHealingEngine(
    defaultPolicy,
    actionHandlers,
    compensationHandlers
  );
}

// ============================================
// DEFAULT SAGA DEFINITIONS
// ============================================

export const defaultSagaDefinitions: SagaDefinition[] = [
  {
    id: "marketing-campaign-saga",
    name: "Marketing Campaign Saga",
    steps: [
      {
        name: "create-draft",
        action: "create-marketing-draft",
        compensationAction: "delete-marketing-draft",
        timeoutMs: 30000,
        required: true
      },
      {
        name: "validate-content",
        action: "validate-marketing-content",
        compensationAction: "rollback-validation",
        timeoutMs: 10000,
        required: true
      },
      {
        name: "publish-content",
        action: "publish-to-channel",
        compensationAction: "unpublish-content",
        timeoutMs: 60000,
        required: true
      },
      {
        name: "send-notifications",
        action: "send-campaign-notifications",
        compensationAction: "cancel-notifications",
        timeoutMs: 30000,
        required: false
      }
    ],
    timeoutMs: 300000,
    retryPolicy: {
      maxAttempts: 3,
      backoffMs: 1000,
      backoffMultiplier: 2
    }
  }
];
