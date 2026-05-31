/**
 * Nexus Partners Pack - Sistema Generativo de Alto Fluxo com rRNA Auto-Cura
 *
 * Arquitetura inspirada em princípios biológicos de auto-reparo e resiliência.
 * O sistema implementa um pipeline de geração de conteúdo com capacidades de
 * auto-diagnóstico, auto-cura e auto-otimização baseadas em padrões observados
 * em RNA ribossomal (rRNA) de sistemas biológicos.
 *
 * Conceitos Principais:
 * 1. rRNA Self-Healing: Capacidade de detectar falhas e，自动修复损坏的序列
 * 2. High-Throughput Pipeline: Processamento paralelo de múltiplas solicitações
 * 3. Protocolos de API: Interface padronizada para integração com múltiplos provedores
 * 4. Circuit Breaker: Proteção contra falhas em cascata
 * 5. Load Balancing: Distribuição inteligente de carga
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type AIProvider = 'openai' | 'anthropic' | 'local' | 'custom';
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'healing';
export type ContentType = 'text' | 'html' | 'social' | 'email' | 'seo' | 'chatbot';

export interface GenerationRequest {
  id: string;
  prompt: string;
  contentType: ContentType;
  provider?: AIProvider;
  model?: string;
  parameters: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  createdAt: Date;
  deadline?: Date;
}

export interface GenerationResult {
  requestId: string;
  status: GenerationStatus;
  content?: string;
  model: string;
  provider: AIProvider;
  tokensUsed: number;
  cost: number;
  latency: number;
  healingAttempts?: number;
  error?: string;
  completedAt: Date;
}

export interface HealthStatus {
  provider: AIProvider;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
  latency: number;
  errorRate: number;
  lastCheck: Date;
  consecutiveFailures: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  initialDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
  retryableErrors: string[];
}

// ============================================================================
// CONFIGURAÇÃO DO SISTEMA
// ============================================================================

const DEFAULT_CONFIG = {
  // High-Throughput Pipeline
  pipeline: {
    maxConcurrentRequests: 50,
    batchSize: 10,
    queueSize: 1000,
    processingTimeout: 60000, // 1 minute
    gracefulShutdownTimeout: 30000,
  },

  // rRNA Self-Healing Configuration
  selfHealing: {
    enabled: true,
    maxHealingAttempts: 3,
    healingThreshold: 0.3, // 30% error rate triggers healing
    healthCheckInterval: 30000, // 30 seconds
    healthCheckTimeout: 5000,
    circuitBreaker: {
      failureThreshold: 5,
      resetTimeout: 60000,
      halfOpenMaxCalls: 3,
    },
    autoFallback: true,
    parallelProviderFallback: true,
  },

  // Retry Configuration
  retry: {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 30000,
    retryableErrors: [
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNREFUSED',
      '429',
      '500',
      '502',
      '503',
      '504',
    ],
  },

  // Provider Configuration
  providers: {
    openai: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
      defaultModel: 'gpt-4-turbo',
      costPer1kTokens: 0.01,
      maxTokens: 4000,
      timeout: 30000,
    },
    anthropic: {
      endpoint: 'https://api.anthropic.com/v1/messages',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      defaultModel: 'claude-3-opus',
      costPer1kTokens: 0.015,
      maxTokens: 4096,
      timeout: 30000,
    },
    local: {
      endpoint: process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434',
      models: ['llama3', 'mistral', 'codellama'],
      defaultModel: 'llama3',
      costPer1kTokens: 0,
      maxTokens: 8192,
      timeout: 60000,
    },
  },

  // Cache Configuration
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 10000,
    strategy: 'lru' as const,
  },

  // Rate Limiting
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    tokensPerMinute: 100000,
  },
};

// ============================================================================
// SEQUÊNCIA rRNA - SISTEMA DE AUTO-CURA
// ============================================================================

/**
 * Sequência rRNA representa um padrão de repair/instrução que pode ser
 * aplicado quando falhas são detectadas no sistema.
 */
interface RNASequence {
  id: string;
  type: 'repair' | 'optimize' | 'fallback' | 'retry' | 'escalate';
  pattern: RegExp;
  action: string;
  priority: number;
  successRate: number;
  lastUsed?: Date;
}

/**
 * Registry de sequências rRNA para auto-cura
 */
const RNASEQUENCES: RNASequence[] = [
  {
    id: 'rna_timeout_retry',
    type: 'retry',
    pattern: /timeout|timed_out|ETIMEDOUT/i,
    action: 'switch_to_faster_model',
    priority: 1,
    successRate: 0.85,
  },
  {
    id: 'rna_rate_limit_backoff',
    type: 'repair',
    pattern: /rate_limit|429|too_many_requests/i,
    action: 'exponential_backoff_with_jitter',
    priority: 1,
    successRate: 0.92,
  },
  {
    id: 'rna_server_error_retry',
    type: 'retry',
    pattern: /500|502|503|504|internal_error/i,
    action: 'retry_with_circuit_breaker',
    priority: 2,
    successRate: 0.78,
  },
  {
    id: 'rna_quota_exceeded_fallback',
    type: 'fallback',
    pattern: /quota|exceeded|limit_reached/i,
    action: 'fallback_to_local_model',
    priority: 1,
    successRate: 0.95,
  },
  {
    id: 'rna_invalid_request_optimize',
    type: 'optimize',
    pattern: /invalid_request|bad_request|validation/i,
    action: 'sanitize_and_retry',
    priority: 2,
    successRate: 0.88,
  },
  {
    id: 'rna_auth_failure_repair',
    type: 'repair',
    pattern: /unauthorized|401|authentication/i,
    action: 'refresh_credentials_and_retry',
    priority: 1,
    successRate: 0.99,
  },
  {
    id: 'rna_network_error_heal',
    type: 'repair',
    pattern: /ECONNRESET|ECONNREFUSED|network/i,
    action: 'rebuild_connection_and_retry',
    priority: 1,
    successRate: 0.82,
  },
  {
    id: 'rna_model_overloaded_escalate',
    type: 'escalate',
    pattern: /model_overloaded|overloaded/i,
    action: 'queue_with_priority_bump',
    priority: 3,
    successRate: 0.70,
  },
];

/**
 * rRNA Self-Healing Engine
 * Implementa lógica de auto-cura inspirada em mecanismos biológicos
 */
export class RNASelfHealingEngine {
  private sequences: Map<string, RNASequence> = new Map();
  private healingHistory: Array<{
    timestamp: Date;
    error: string;
    sequence: string;
    success: boolean;
    attempts: number;
  }> = [];
  private isActive: boolean = true;

  constructor() {
    RNASEQUENCES.forEach(seq => this.sequences.set(seq.id, seq));
  }

  /**
   * Analisa erro e retorna sequência de cura apropriada
   */
  findHealingSequence(error: string): RNASequence | null {
    for (const seq of this.sequences.values()) {
      if (seq.pattern.test(error)) {
        seq.lastUsed = new Date();
        return seq;
      }
    }
    return null;
  }

  /**
   * Executa ação de cura baseada na sequência
   */
  async executeHealing(
    error: string,
    context: Record<string, any>
  ): Promise<{
    success: boolean;
    action: string;
    modifiedContext?: Record<string, any>;
  }> {
    const sequence = this.findHealingSequence(error);

    if (!sequence) {
      return { success: false, action: 'no_matching_sequence' };
    }

    let modifiedContext = { ...context };

    switch (sequence.action) {
      case 'switch_to_faster_model':
        modifiedContext.model = 'gpt-3.5-turbo';
        modifiedContext.maxTokens = Math.min(context.maxTokens || 2000, 2000);
        break;

      case 'exponential_backoff_with_jitter':
        const baseDelay = context.retryDelay || 1000;
        const jitter = Math.random() * 0.3 * baseDelay;
        modifiedContext.retryDelay = Math.min(
          baseDelay * Math.pow(2, context.attempts || 1) + jitter,
          30000
        );
        break;

      case 'fallback_to_local_model':
        modifiedContext.provider = 'local';
        modifiedContext.model = 'llama3';
        break;

      case 'sanitize_and_retry':
        modifiedContext.prompt = this.sanitizePrompt(context.prompt);
        break;

      case 'refresh_credentials_and_retry':
        modifiedContext.forceRefreshToken = true;
        break;

      case 'rebuild_connection_and_retry':
        modifiedContext.forceNewConnection = true;
        break;

      case 'queue_with_priority_bump':
        modifiedContext.priority = 'high';
        break;

      default:
        return { success: false, action: sequence.action };
    }

    this.healingHistory.push({
      timestamp: new Date(),
      error,
      sequence: sequence.id,
      success: true,
      attempts: (context.attempts || 0) + 1,
    });

    return {
      success: true,
      action: sequence.action,
      modifiedContext,
    };
  }

  /**
   * Calcula taxa de sucesso geral do sistema de cura
   */
  getHealingSuccessRate(): number {
    if (this.healingHistory.length === 0) return 1;
    const successful = this.healingHistory.filter(h => h.success).length;
    return successful / this.healingHistory.length;
  }

  /**
   * Retorna estatísticas de cura
   */
  getStats(): {
    totalHealings: number;
    successRate: number;
    mostUsedSequence: string | null;
    averageAttempts: number;
  } {
    if (this.healingHistory.length === 0) {
      return {
        totalHealings: 0,
        successRate: 1,
        mostUsedSequence: null,
        averageAttempts: 0,
      };
    }

    const sequenceCounts = new Map<string, number>();
    let totalAttempts = 0;

    this.healingHistory.forEach(h => {
      const count = sequenceCounts.get(h.sequence) || 0;
      sequenceCounts.set(h.sequence, count + 1);
      totalAttempts += h.attempts;
    });

    let mostUsedSeq: string | null = null;
    let maxCount = 0;
    sequenceCounts.forEach((count, seq) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedSeq = seq;
      }
    });

    return {
      totalHealings: this.healingHistory.length,
      successRate: this.getHealingSuccessRate(),
      mostUsedSequence: mostUsedSeq,
      averageAttempts: totalAttempts / this.healingHistory.length,
    };
  }

  private sanitizePrompt(prompt: string): string {
    // Remove potentially problematic characters
    return prompt
      .replace(/[\x00-\x1F\x7F]/g, '')
      .replace(/{.*}/g, match => match.length < 100 ? match : match.substring(0, 100))
      .trim();
  }
}

// ============================================================================
// CIRCUIT BREAKER IMPLEMENTATION
// ============================================================================

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxCalls: number;
}

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenCalls: number = 0;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      resetTimeout: config.resetTimeout ?? 60000,
      halfOpenMaxCalls: config.halfOpenMaxCalls ?? 3,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
        this.transitionTo('HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        throw new Error('Circuit breaker half-open limit reached');
      }
      this.halfOpenCalls++;
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
    if (this.state === 'HALF_OPEN') {
      this.transitionTo('CLOSED');
    } else {
      this.failures = 0;
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (
      this.state === 'HALF_OPEN' ||
      this.failures >= this.config.failureThreshold
    ) {
      this.transitionTo('OPEN');
    }
  }

  private transitionTo(newState: CircuitState): void {
    this.state = newState;

    if (newState === 'CLOSED') {
      this.failures = 0;
      this.halfOpenCalls = 0;
    } else if (newState === 'OPEN') {
      this.lastFailureTime = Date.now();
    } else if (newState === 'HALF_OPEN') {
      this.halfOpenCalls = 0;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.transitionTo('CLOSED');
  }
}

// ============================================================================
// HIGH-THROUGHPUT REQUEST QUEUE
// ============================================================================

interface QueuedRequest {
  request: GenerationRequest;
  resolve: (result: GenerationResult) => void;
  reject: (error: Error) => void;
  addedAt: Date;
  priority: number;
}

class HighThroughputQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private maxConcurrent: number;
  private activeCount = 0;
  private onProcess: (request: GenerationRequest) => Promise<GenerationResult>;

  constructor(
    maxConcurrent: number,
    onProcess: (request: GenerationRequest) => Promise<GenerationResult>
  ) {
    this.maxConcurrent = maxConcurrent;
    this.onProcess = onProcess;
  }

  async enqueue(request: GenerationRequest): Promise<GenerationResult> {
    return new Promise((resolve, reject) => {
      const priorityMap = { urgent: 0, high: 1, normal: 2, low: 3 };
      const priority = priorityMap[request.priority] ?? 2;

      this.queue.push({
        request,
        resolve,
        reject,
        addedAt: new Date(),
        priority,
      });

      // Sort by priority
      this.queue.sort((a, b) => a.priority - b.priority);

      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing) return;
    if (this.queue.length === 0) return;

    while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      this.activeCount++;

      this.onProcess(item.request)
        .then(item.resolve)
        .catch(item.reject)
        .finally(() => {
          this.activeCount--;
          this.process();
        });
    }
  }

  getStats(): { queueLength: number; activeCount: number } {
    return {
      queueLength: this.queue.length,
      activeCount: this.activeCount,
    };
  }
}

// ============================================================================
// CACHE DE RESPOSTAS
// ============================================================================

interface CacheEntry {
  key: string;
  value: string;
  createdAt: Date;
  expiresAt: Date;
  hits: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttl: number;
  private maxSize: number;
  private strategy: 'lru' | 'lfu';

  constructor(
    ttl: number = 3600,
    maxSize: number = 10000,
    strategy: 'lru' | 'lfu' = 'lru'
  ) {
    this.ttl = ttl;
    this.maxSize = maxSize;
    this.strategy = strategy;
  }

  generateKey(prompt: string, params: Record<string, any>): string {
    const data = JSON.stringify({ prompt, ...params });
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.value;
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    const now = new Date();
    this.cache.set(key, {
      key,
      value,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.ttl * 1000),
      hits: 0,
    });
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string | null = null;

    if (this.strategy === 'lru') {
      let oldest: Date | null = null;
      this.cache.forEach((entry, key) => {
        if (!oldest || entry.createdAt < oldest) {
          oldest = entry.createdAt;
          keyToEvict = key;
        }
      });
    } else {
      let lowestHits = Infinity;
      this.cache.forEach((entry, key) => {
        if (entry.hits < lowestHits) {
          lowestHits = entry.hits;
          keyToEvict = key;
        }
      });
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; hits: number } {
    let hits = 0;
    this.cache.forEach(entry => {
      hits += entry.hits;
    });
    return { size: this.cache.size, hits };
  }
}

// ============================================================================
// PROVEDOR DE IA - INTERFACE ABSTRATA
// ============================================================================

abstract class AIProviderClient {
  abstract provider: AIProvider;
  abstract config: typeof DEFAULT_CONFIG.providers.openai;

  abstract generate(
    prompt: string,
    params: Record<string, any>
  ): Promise<{ content: string; tokens: number; cost: number }>;

  abstract healthCheck(): Promise<HealthStatus>;

  protected async makeRequest(
    endpoint: string,
    body: any,
    headers: Record<string, string>
  ): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }
}

// ============================================================================
// OPENAI PROVIDER
// ============================================================================

class OpenAIProvider extends AIProviderClient {
  provider: AIProvider = 'openai';
  config = DEFAULT_CONFIG.providers.openai;

  async generate(
    prompt: string,
    params: Record<string, any>
  ): Promise<{ content: string; tokens: number; cost: number }> {
    const model = params.model || this.config.defaultModel;

    const response = await this.makeRequest(
      this.config.endpoint,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? this.config.maxTokens,
        top_p: params.topP ?? 1,
        frequency_penalty: params.frequencyPenalty ?? 0,
        presence_penalty: params.presencePenalty ?? 0,
      },
      {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      }
    );

    const content = response.choices[0]?.message?.content || '';
    const tokens = response.usage?.total_tokens || 0;
    const cost = (tokens / 1000) * this.config.costPer1kTokens;

    return { content, tokens, cost };
  }

  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      await this.makeRequest(
        this.config.endpoint,
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        },
        { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
      );

      return {
        provider: 'openai',
        status: 'healthy',
        latency: Date.now() - start,
        errorRate: 0,
        lastCheck: new Date(),
        consecutiveFailures: 0,
      };
    } catch (error) {
      return {
        provider: 'openai',
        status: 'unhealthy',
        latency: Date.now() - start,
        errorRate: 1,
        lastCheck: new Date(),
        consecutiveFailures: 1,
      };
    }
  }
}

// ============================================================================
// ANTHROPIC PROVIDER
// ============================================================================

class AnthropicProvider extends AIProviderClient {
  provider: AIProvider = 'anthropic';
  config = DEFAULT_CONFIG.providers.anthropic;

  async generate(
    prompt: string,
    params: Record<string, any>
  ): Promise<{ content: string; tokens: number; cost: number }> {
    const model = params.model || this.config.defaultModel;

    const response = await this.makeRequest(
      this.config.endpoint,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: params.maxTokens ?? this.config.maxTokens,
        temperature: params.temperature ?? 0.7,
      },
      {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      }
    );

    const content = response.content[0]?.text || '';
    const tokens = response.usage?.input_tokens + response.usage?.output_tokens || 0;
    const cost = (tokens / 1000) * this.config.costPer1kTokens;

    return { content, tokens, cost };
  }

  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      await this.makeRequest(
        this.config.endpoint,
        {
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        },
        {
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        }
      );

      return {
        provider: 'anthropic',
        status: 'healthy',
        latency: Date.now() - start,
        errorRate: 0,
        lastCheck: new Date(),
        consecutiveFailures: 0,
      };
    } catch (error) {
      return {
        provider: 'anthropic',
        status: 'unhealthy',
        latency: Date.now() - start,
        errorRate: 1,
        lastCheck: new Date(),
        consecutiveFailures: 1,
      };
    }
  }
}

// ============================================================================
// GENERATIVE AI SYSTEM - MAIN CLASS
// ============================================================================

export class GenerativeAISystem extends EventEmitter {
  private providers: Map<AIProvider, AIProviderClient> = new Map();
  private circuitBreakers: Map<AIProvider, CircuitBreaker> = new Map();
  private healingEngine: RNASelfHealingEngine;
  private cache: ResponseCache;
  private queue: HighThroughputQueue;
  private healthMonitor: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private config: typeof DEFAULT_CONFIG;

  constructor(config?: Partial<typeof DEFAULT_CONFIG>) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.healingEngine = new RNASelfHealingEngine();
    this.cache = new ResponseCache(
      this.config.cache.ttl,
      this.config.cache.maxSize,
      this.config.cache.strategy
    );

    // Initialize providers
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('anthropic', new AnthropicProvider());

    // Initialize circuit breakers
    this.providers.forEach((_, provider) => {
      this.circuitBreakers.set(
        provider,
        new CircuitBreaker(this.config.selfHealing.circuitBreaker)
      );
    });

    // Initialize queue
    this.queue = new HighThroughputQueue(
      this.config.pipeline.maxConcurrentRequests,
      (request) => this.processRequest(request)
    );
  }

  /**
   * Inicia o sistema de geração
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Start health monitoring
    this.healthMonitor = setInterval(() => {
      this.checkProvidersHealth();
    }, this.config.selfHealing.healthCheckInterval);

    this.emit('system:started');
    console.log('[GenerativeAISystem] Started with rRNA Self-Healing enabled');
  }

  /**
   * Para o sistema de geração
   */
  async stop(): Promise<void> {
    if (this.healthMonitor) {
      clearInterval(this.healthMonitor);
      this.healthMonitor = null;
    }
    this.isRunning = false;
    this.emit('system:stopped');
    console.log('[GenerativeAISystem] Stopped');
  }

  /**
   * Gera conteúdo via API
   */
  async generate(request: Omit<GenerationRequest, 'id' | 'createdAt'>): Promise<GenerationResult> {
    const fullRequest: GenerationRequest = {
      ...request,
      id: `gen_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date(),
    };

    this.emit('request:received', fullRequest);

    // Check cache if enabled
    if (this.config.cache.enabled) {
      const cacheKey = this.cache.generateKey(request.prompt, request.parameters);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.emit('cache:hit', { requestId: fullRequest.id, cacheKey });
        return {
          requestId: fullRequest.id,
          status: 'completed',
          content: cached,
          model: request.model || 'cached',
          provider: request.provider || 'cache',
          tokensUsed: 0,
          cost: 0,
          latency: 0,
          completedAt: new Date(),
        };
      }
    }

    // Add to queue
    const result = await this.queue.enqueue(fullRequest);

    if (result.content && this.config.cache.enabled) {
      const cacheKey = this.cache.generateKey(request.prompt, request.parameters);
      this.cache.set(cacheKey, result.content);
    }

    return result;
  }

  /**
   * Processa uma requisição
   */
  private async processRequest(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    let provider = request.provider || 'openai';
    let model = request.model;
    let attempts = 0;

    while (attempts < this.config.retry.maxAttempts) {
      attempts++;

      try {
        // Get circuit breaker
        const cb = this.circuitBreakers.get(provider);
        if (!cb) {
          throw new Error(`Unknown provider: ${provider}`);
        }

        // Execute with circuit breaker
        const result = await cb.execute(async () => {
          const providerClient = this.providers.get(provider);
          if (!providerClient) {
            throw new Error(`Provider not initialized: ${provider}`);
          }

          return providerClient.generate(request.prompt, {
            ...request.parameters,
            model,
          });
        });

        const latency = Date.now() - startTime;

        this.emit('request:completed', {
          requestId: request.id,
          provider,
          model: model || provider,
          latency,
        });

        return {
          requestId: request.id,
          status: 'completed',
          content: result.content,
          model: model || 'default',
          provider,
          tokensUsed: result.tokens,
          cost: result.cost,
          latency,
          healingAttempts: attempts - 1,
          completedAt: new Date(),
        };
      } catch (error) {
        const err = error instanceof Error ? error.message : 'Unknown error';

        this.emit('request:error', {
          requestId: request.id,
          provider,
          error: err,
          attempt: attempts,
        });

        // Try to heal and retry
        if (this.config.selfHealing.enabled && attempts < this.config.retry.maxAttempts) {
          const healing = await this.healingEngine.executeHealing(err, {
            provider,
            model,
            attempts,
            ...request.parameters,
          });

          if (healing.success && healing.modifiedContext) {
            provider = healing.modifiedContext.provider || provider;
            model = healing.modifiedContext.model || model;
            Object.assign(request.parameters, healing.modifiedContext);

            this.emit('healing:applied', {
              requestId: request.id,
              action: healing.action,
              newProvider: provider,
            });

            continue;
          }
        }

        // If healing failed or not enabled, try fallback provider
        if (this.config.selfHealing.autoFallback && attempts === 1) {
          const fallbackProvider = this.getFallbackProvider(provider);
          if (fallbackProvider) {
            provider = fallbackProvider;
            model = undefined;
            continue;
          }
        }

        // All attempts exhausted
        return {
          requestId: request.id,
          status: 'failed',
          error: err,
          healingAttempts: attempts - 1,
          completedAt: new Date(),
        };
      }
    }

    return {
      requestId: request.id,
      status: 'failed',
      error: 'Max retry attempts exceeded',
      healingAttempts: attempts,
      completedAt: new Date(),
    };
  }

  /**
   * Obtém provider de fallback
   */
  private getFallbackProvider(currentProvider: AIProvider): AIProvider | null {
    const providers: AIProvider[] = ['openai', 'anthropic', 'local'];
    const currentIndex = providers.indexOf(currentProvider);

    for (let i = currentIndex + 1; i < providers.length; i++) {
      const cb = this.circuitBreakers.get(providers[i]);
      if (cb && cb.getState() !== 'OPEN') {
        return providers[i];
      }
    }

    return null;
  }

  /**
   * Verifica saúde dos providers
   */
  private async checkProvidersHealth(): Promise<void> {
    for (const [provider, client] of this.providers) {
      try {
        const status = await client.healthCheck();
        this.emit('health:update', status);

        if (status.errorRate > this.config.selfHealing.healingThreshold) {
          this.emit('health:degraded', { provider, status });
        }
      } catch (error) {
        this.emit('health:error', { provider, error });
      }
    }
  }

  /**
   * Retorna estatísticas do sistema
   */
  getStats(): {
    isRunning: boolean;
    providers: Record<AIProvider, HealthStatus | null>;
    circuitBreakers: Record<AIProvider, CircuitState>;
    queue: { length: number; active: number };
    cache: { size: number; hits: number };
    healing: ReturnType<RNASelfHealingEngine['getStats']>;
  } {
    const providerStatuses: Record<string, HealthStatus | null> = {};
    const circuitStates: Record<string, CircuitState> = {};

    this.providers.forEach((client, provider) => {
      providerStatuses[provider] = null;
    });

    this.circuitBreakers.forEach((cb, provider) => {
      circuitStates[provider] = cb.getState();
    });

    return {
      isRunning: this.isRunning,
      providers: providerStatuses as any,
      circuitBreakers: circuitStates as any,
      queue: this.queue.getStats(),
      cache: this.cache.getStats(),
      healing: this.healingEngine.getStats(),
    };
  }

  /**
   * Limpa cache
   */
  clearCache(): void {
    this.cache.clear();
    this.emit('cache:cleared');
  }

  /**
   * Reseta circuit breaker de um provider
   */
  resetCircuitBreaker(provider: AIProvider): void {
    const cb = this.circuitBreakers.get(provider);
    if (cb) {
      cb.reset();
      this.emit('circuit:reset', { provider });
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const generativeAI = new GenerativeAISystem();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export async function generateContent(
  prompt: string,
  contentType: ContentType = 'text',
  options?: {
    provider?: AIProvider;
    model?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  }
): Promise<GenerationResult> {
  return generativeAI.generate({
    prompt,
    contentType,
    provider: options?.provider,
    model: options?.model,
    parameters: {},
    priority: options?.priority || 'normal',
  });
}

export function getSystemStats() {
  return generativeAI.getStats();
}

export function startGenerativeSystem() {
  generativeAI.start();
}

export async function stopGenerativeSystem() {
  await generativeAI.stop();
}