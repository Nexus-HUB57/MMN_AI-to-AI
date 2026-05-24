/**
 * Circuit Breaker Pattern Implementation
 *
 * Protege contra falhas em cascata em serviços externos e operações críticas.
 * Estados: CLOSED (normal), OPEN (falhou, rejeitando), HALF_OPEN (testando recuperação)
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;      // Número de falhas para abrir o circuito
  successThreshold: number;      // Sucessos necessários para fechar (half_open → closed)
  timeout: number;              // Tempo em ms antes de tentar recover (open → half_open)
  resetTimeout: number;          // Tempo em ms entre tentativas em half_open
  monitorWindow: number;         // Janela de tempo para contar falhas (ms)
  halfOpenMaxCalls: number;      // Número máximo de chamadas em half_open
}

export interface CircuitMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  rejectedCalls: number;
  averageLatency: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  currentState: CircuitState;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
}

export interface CircuitEvent {
  type: 'OPEN' | 'CLOSE' | 'HALF_OPEN' | 'SUCCESS' | 'FAILURE' | 'REJECTED';
  circuitName: string;
  timestamp: number;
  reason?: string;
  metrics?: CircuitMetrics;
}

type CircuitEventHandler = (event: CircuitEvent) => void;

const DEFAULT_CONFIG: Omit<CircuitBreakerConfig, 'name'> = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 60000,           // 60 segundos
  resetTimeout: 10000,      // 10 segundos
  monitorWindow: 60000,     // 60 segundos
  halfOpenMaxCalls: 3
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number = 0;
  private lastAttemptTime: number = 0;
  private halfOpenCalls: number = 0;
  private failureTimestamps: number[] = [];

  private eventHandlers: CircuitEventHandler[] = [];

  constructor(
    private config: CircuitBreakerConfig
  ) {}

  /**
   * Executa uma função com proteção de circuit breaker
   */
  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    // Verificar se deve rejeitar
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        this.recordRejection();
        if (fallback) {
          return fallback();
        }
        throw new CircuitOpenError(this.config.name, this.getTimeUntilRetry());
      }
    }

    // Executar operação
    try {
      this.lastAttemptTime = Date.now();
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(error as Error);
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  /**
   * Verifica se deve tentar resetar o circuito
   */
  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.timeout;
  }

  /**
   * Registra sucesso
   */
  private recordSuccess(): void {
    const now = Date.now();
    this.successes++;
    this.halfOpenCalls++;

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successes >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      } else if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        this.transitionTo(CircuitState.OPEN);
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failures = 0;
      this.failureTimestamps = [];
    }

    this.emitEvent({
      type: 'SUCCESS',
      circuitName: this.config.name,
      timestamp: now
    });
  }

  /**
   * Registra falha
   */
  private recordFailure(error: Error): void {
    const now = Date.now();
    this.failures++;
    this.failureTimestamps.push(now);
    this.lastFailureTime = now;
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;

    // Limpar falhas antigas fora da janela
    this.failureTimestamps = this.failureTimestamps.filter(
      ts => now - ts < this.config.monitorWindow
    );

    // Verificar se deve abrir o circuito
    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
    } else if (this.state === CircuitState.CLOSED) {
      const recentFailures = this.failureTimestamps.length;
      if (recentFailures >= this.config.failureThreshold) {
        this.transitionTo(CircuitState.OPEN);
      }
    }

    this.emitEvent({
      type: 'FAILURE',
      circuitName: this.config.name,
      timestamp: now,
      reason: error.message
    });
  }

  /**
   * Registra rejeição
   */
  private recordRejection(): void {
    this.emitEvent({
      type: 'REJECTED',
      circuitName: this.config.name,
      timestamp: Date.now()
    });
  }

  /**
   * Transiciona para novo estado
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    switch (newState) {
      case CircuitState.OPEN:
        this.halfOpenCalls = 0;
        this.successes = 0;
        break;
      case CircuitState.HALF_OPEN:
        this.halfOpenCalls = 0;
        this.successes = 0;
        break;
      case CircuitState.CLOSED:
        this.failures = 0;
        this.successes = 0;
        this.failureTimestamps = [];
        this.consecutiveFailures = 0;
        this.consecutiveSuccesses = 0;
        break;
    }

    this.emitEvent({
      type: newState as CircuitEvent['type'],
      circuitName: this.config.name,
      timestamp: Date.now(),
      reason: `Transitioned from ${oldState} to ${newState}`
    });
  }

  /**
   * Emite evento
   */
  private emitEvent(event: CircuitEvent): void {
    event.metrics = this.getMetrics();
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error(`Circuit breaker event handler error: ${e}`);
      }
    });
  }

  /**
   * Retorna tempo até próxima tentativa
   */
  private getTimeUntilRetry(): number {
    const elapsed = Date.now() - this.lastFailureTime;
    return Math.max(0, this.config.timeout - elapsed);
  }

  /**
   * Obtém métricas atuais
   */
  getMetrics(): CircuitMetrics {
    return {
      totalCalls: this.successes + this.failures,
      successfulCalls: this.successes,
      failedCalls: this.failures,
      rejectedCalls: 0,
      averageLatency: 0,
      lastFailureTime: this.lastFailureTime || null,
      lastSuccessTime: this.lastAttemptTime || null,
      currentState: this.state,
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses
    };
  }

  /**
   * Obtém estado atual
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Verifica se está aberto
   */
  isOpen(): boolean {
    return this.state === CircuitState.OPEN;
  }

  /**
   * Força reset do circuit breaker
   */
  reset(): void {
    this.transitionTo(CircuitState.CLOSED);
  }

  /**
   * Adiciona manipulador de eventos
   */
  onEvent(handler: CircuitEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove manipulador de eventos
   */
  offEvent(handler: CircuitEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }
}

/**
 * Erro lançado quando o circuit breaker está aberto
 */
export class CircuitOpenError extends Error {
  constructor(
    public readonly circuitName: string,
    public readonly retryAfterMs: number
  ) {
    super(`Circuit breaker "${circuitName}" is OPEN. Retry after ${Math.ceil(retryAfterMs / 1000)}s`);
    this.name = 'CircuitOpenError';
  }
}

/**
 * Factory para criar circuit breakers
 */
export class CircuitBreakerFactory {
  private static circuits: Map<string, CircuitBreaker> = new Map();

  /**
   * Cria ou obtém circuit breaker
   */
  static get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.circuits.has(name)) {
      this.circuits.set(
        name,
        new CircuitBreaker({
          name,
          ...DEFAULT_CONFIG,
          ...config
        })
      );
    }
    return this.circuits.get(name)!;
  }

  /**
   * Remove circuit breaker
   */
  static remove(name: string): void {
    this.circuits.delete(name);
  }

  /**
   * Limpa todos os circuit breakers
   */
  static clear(): void {
    this.circuits.clear();
  }

  /**
   * Obtém todos os circuit breakers
   */
  static getAll(): Map<string, CircuitBreaker> {
    return new Map(this.circuits);
  }

  /**
   * Obtém métricas de todos os circuit breakers
   */
  static getAllMetrics(): Record<string, CircuitMetrics> {
    const metrics: Record<string, CircuitMetrics> = {};
    this.circuits.forEach((cb, name) => {
      metrics[name] = cb.getMetrics();
    });
    return metrics;
  }

  /**
   * Reseta todos os circuit breakers
   */
  static resetAll(): void {
    this.circuits.forEach(cb => cb.reset());
  }
}

/**
 * Decorator para aplicar circuit breaker em funções
 */
export function withCircuitBreaker(
  name: string,
  config?: Partial<CircuitBreakerConfig>,
  fallback?: () => Promise<any>
) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: T,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const circuit = CircuitBreakerFactory.get(name, config);

    descriptor.value = async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      return circuit.execute(
        () => originalMethod.apply(this, args),
        fallback
      );
    };

    return descriptor;
  };
}

export default CircuitBreaker;