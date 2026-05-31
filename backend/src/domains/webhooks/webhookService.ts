/**
 * Nexus Partners Pack - Sistema de Webhooks para Comissões
 * Implementação com retry automático, circuit breaker e assinatura HMAC
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';

// Types
export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
  metadata?: {
    retryCount?: number;
    source?: string;
  };
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  response?: any;
  error?: string;
  attempts: number;
  duration: number;
}

// Circuit Breaker States
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxCalls: number;
}

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailureTime: number;
  halfOpenCalls: number;
}

interface PendingWebhook {
  id: string;
  config: WebhookConfig;
  payload: WebhookPayload;
  attempt: number;
  timeoutId?: NodeJS.Timeout;
  resolve?: (result: WebhookDeliveryResult) => void;
  reject?: (error: Error) => void;
}

/**
 * Circuit Breaker Implementation
 * Protege contra falhas em cascata em chamadas de webhook
 */
export class WebhookCircuitBreaker {
  private state: CircuitBreakerState;
  private config: CircuitBreakerConfig;
  private listeners: EventEmitter;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      resetTimeout: config.resetTimeout ?? 60000, // 1 minute
      halfOpenMaxCalls: config.halfOpenMaxCalls ?? 3,
    };

    this.state = {
      state: 'CLOSED',
      failures: 0,
      lastFailureTime: 0,
      halfOpenCalls: 0,
    };

    this.listeners = new EventEmitter();
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (Date.now() - this.state.lastFailureTime >= this.config.resetTimeout) {
        this.transitionTo('HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    if (this.state.state === 'HALF_OPEN') {
      if (this.state.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        throw new Error('Circuit breaker half-open limit reached');
      }
      this.state.halfOpenCalls++;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state.state === 'HALF_OPEN') {
      this.transitionTo('CLOSED');
    } else {
      this.state.failures = 0;
    }
  }

  private onFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (
      this.state.state === 'HALF_OPEN' ||
      this.state.failures >= this.config.failureThreshold
    ) {
      this.transitionTo('OPEN');
    }
  }

  private transitionTo(newState: CircuitState): void {
    const previousState = this.state.state;
    this.state.state = newState;

    if (newState === 'CLOSED') {
      this.state.failures = 0;
      this.state.halfOpenCalls = 0;
    } else if (newState === 'OPEN') {
      this.state.lastFailureTime = Date.now();
    } else if (newState === 'HALF_OPEN') {
      this.state.halfOpenCalls = 0;
    }

    this.listeners.emit('stateChange', { previousState, newState });
  }

  getState(): CircuitState {
    return this.state.state;
  }

  onStateChange(callback: (data: { previousState: CircuitState; newState: CircuitState }) => void): void {
    this.listeners.on('stateChange', callback);
  }

  reset(): void {
    this.transitionTo('CLOSED');
  }
}

/**
 * Webhook Manager - Gerencia envios de webhooks com retry e circuit breaker
 */
export class WebhookManager extends EventEmitter {
  private webhooks: Map<string, WebhookConfig> = new Map();
  private circuitBreakers: Map<string, WebhookCircuitBreaker> = new Map();
  private pendingWebhooks: Map<string, PendingWebhook> = new Map();
  private deliveryQueue: PendingWebhook[] = [];
  private isProcessing = false;
  private maxConcurrentDeliveries = 10;
  private activeDeliveries = 0;

  constructor() {
    super();
    this.startQueueProcessor();
  }

  /**
   * Registra um novo webhook endpoint
   */
  registerWebhook(id: string, config: WebhookConfig): void {
    this.webhooks.set(id, config);
    this.circuitBreakers.set(
      id,
      new WebhookCircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 60000,
        halfOpenMaxCalls: 3,
      })
    );

    this.emit('webhook:registered', { id, config });
  }

  /**
   * Remove um webhook registrado
   */
  unregisterWebhook(id: string): void {
    this.webhooks.delete(id);
    this.circuitBreakers.delete(id);
    this.emit('webhook:unregistered', { id });
  }

  /**
   * Envia um webhook para um endpoint específico
   */
  async send(
    webhookId: string,
    event: string,
    data: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<WebhookDeliveryResult> {
    const config = this.webhooks.get(webhookId);
    if (!config) {
      throw new Error(`Webhook not found: ${webhookId}`);
    }

    if (!config.events.includes(event) && !config.events.includes('*')) {
      throw new Error(`Event ${event} not registered for webhook ${webhookId}`);
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      metadata,
    };

    return this.deliverWithRetry(webhookId, config, payload);
  }

  /**
   * Dispara um evento para todos os webhooks registrados
   */
  async broadcast(
    event: string,
    data: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<Map<string, WebhookDeliveryResult>> {
    const results = new Map<string, WebhookDeliveryResult>();

    const sendPromises = Array.from(this.webhooks.entries())
      .filter(([_, config]) => config.events.includes(event) || config.events.includes('*'))
      .map(async ([id, config]) => {
        const payload: WebhookPayload = {
          event,
          timestamp: new Date().toISOString(),
          data,
          metadata,
        };

        try {
          const result = await this.deliverWithRetry(id, config, payload);
          results.set(id, result);
        } catch (error) {
          results.set(id, {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            attempts: 0,
            duration: 0,
          });
        }
      });

    await Promise.all(sendPromises);
    return results;
  }

  /**
   * Entrega webhook com retry exponencial
   */
  private async deliverWithRetry(
    webhookId: string,
    config: WebhookConfig,
    payload: WebhookPayload
  ): Promise<WebhookDeliveryResult> {
    const circuitBreaker = this.circuitBreakers.get(webhookId);
    const maxAttempts = config.retryAttempts ?? 3;
    const baseDelay = config.retryDelay ?? 5000;

    let lastError: Error | null = null;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await circuitBreaker!.execute(async () => {
          return this.deliverWebhook(webhookId, config, {
            ...payload,
            metadata: {
              ...payload.metadata,
              retryCount: attempt - 1,
            },
          });
        });

        this.emit('webhook:delivered', { webhookId, result, attempt });
        return {
          ...result,
          attempts: attempt,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (circuitBreaker?.getState() === 'OPEN') {
          this.emit('webhook:circuit_open', { webhookId, attempt });
          break;
        }

        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    this.emit('webhook:failed', { webhookId, error: lastError });
    return {
      success: false,
      error: lastError?.message ?? 'Delivery failed',
      attempts: maxAttempts,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Executa a entrega real do webhook via HTTP
   */
  private async deliverWebhook(
    webhookId: string,
    config: WebhookConfig,
    payload: WebhookPayload
  ): Promise<Omit<WebhookDeliveryResult, 'attempts' | 'duration'>> {
    const signature = this.generateSignature(payload, config.secret);
    const timeout = config.timeout ?? 30000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-Timestamp': payload.timestamp,
          'X-Webhook-ID': webhookId,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let responseBody;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }

      return {
        success: true,
        statusCode: response.status,
        response: responseBody,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Webhook delivery timed out');
      }

      throw error;
    }
  }

  /**
   * Gera assinatura HMAC-SHA256 para autenticação
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    return `sha256=${signature}`;
  }

  /**
   * Verifica assinatura de um webhook recebido
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const expected = `sha256=${expectedSignature}`;

    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Processa fila de webhooks pendentes
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      if (this.activeDeliveries < this.maxConcurrentDeliveries && this.deliveryQueue.length > 0) {
        const webhook = this.deliveryQueue.shift();
        if (webhook) {
          this.processQueueItem(webhook);
        }
      }
    }, 100);
  }

  private async processQueueItem(webhook: PendingWebhook): Promise<void> {
    this.activeDeliveries++;

    try {
      const result = await this.deliverWithRetry(webhook.id, webhook.config, webhook.payload);
      webhook.resolve?.(result);
    } catch (error) {
      webhook.reject?.(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      this.activeDeliveries--;
    }
  }

  /**
   * Adiciona webhook à fila de processamento
   */
  enqueue(webhookId: string, event: string, data: Record<string, any>): Promise<WebhookDeliveryResult> {
    const config = this.webhooks.get(webhookId);
    if (!config) {
      return Promise.reject(new Error(`Webhook not found: ${webhookId}`));
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    return new Promise((resolve, reject) => {
      this.deliveryQueue.push({
        id: webhookId,
        config,
        payload,
        attempt: 0,
        resolve,
        reject,
      });
    });
  }

  /**
   * Retorna estatísticas de webhooks
   */
  getStats(): {
    registered: number;
    circuitBreakers: Record<string, CircuitState>;
    queueLength: number;
    activeDeliveries: number;
  } {
    const circuitBreakerStates: Record<string, CircuitState> = {};

    this.circuitBreakers.forEach((cb, id) => {
      circuitBreakerStates[id] = cb.getState();
    });

    return {
      registered: this.webhooks.size,
      circuitBreakers: circuitBreakerStates,
      queueLength: this.deliveryQueue.length,
      activeDeliveries: this.activeDeliveries,
    };
  }
}

// Singleton instance
export const webhookManager = new WebhookManager();

// Commission-specific webhook events
export const CommissionWebhookEvents = {
  COMMISSION_CREATED: 'commission.created',
  COMMISSION_APPROVED: 'commission.approved',
  COMMISSION_REJECTED: 'commission.rejected',
  COMMISSION_PAID: 'commission.paid',
  COMMISSION_BATCH_PROCESSED: 'commission.batch_processed',
  TIER_PROMOTION: 'tier.promotion',
  BONUS_QUALIFIED: 'bonus.qualified',
} as const;

export type CommissionWebhookEvent = typeof CommissionWebhookEvents[keyof typeof CommissionWebhookEvents];
