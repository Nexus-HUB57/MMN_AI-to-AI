/**
 * Circuit Breaker Integration for tRPC
 *
 * Aplica circuit breakers em procedures tRPC para proteção contra falhas.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { CircuitBreaker, CircuitBreakerFactory, CircuitState } from '../_core/CircuitBreaker';

export interface CircuitBreakerOptions {
  name: string;
  failureThreshold?: number;
  timeout?: number;
  onOpen?: (name: string) => void;
  onClose?: (name: string) => void;
}

/**
 * Cria um middleware de circuit breaker para tRPC
 */
export function createCircuitBreakerMiddleware(options: CircuitBreakerOptions) {
  const circuit = CircuitBreakerFactory.get(options.name, {
    name: options.name,
    failureThreshold: options.failureThreshold ?? 5,
    timeout: options.timeout ?? 60000
  });

  // Registar event handlers
  if (options.onOpen) {
    circuit.onEvent((event) => {
      if (event.type === 'OPEN') {
        options.onOpen!(options.name);
      }
    });
  }

  if (options.onClose) {
    circuit.onEvent((event) => {
      if (event.type === 'CLOSE') {
        options.onClose!(options.name);
      }
    });
  }

  return circuit;
}

/**
 * Middleware tRPC com circuit breaker
 */
export function circuitBreakerMiddleware(options: CircuitBreakerOptions) {
  const circuit = createCircuitBreakerMiddleware(options);

  return async ({ next, type, path }: any) => {
    try {
      return await circuit.execute(async () => {
        return next();
      }, async () => {
        // Fallback: retorna erro controlado
        throw new TRPCError({
          code: 'SERVICE_UNAVAILABLE',
          message: `Service temporarily unavailable. Circuit breaker "${options.name}" is active.`,
          cause: 'CIRCUIT_BREAKER_OPEN'
        });
      });
    } catch (error: any) {
      if (error.code === 'CIRCUIT_BREAKER_OPEN') {
        throw new TRPCError({
          code: 'SERVICE_UNAVAILABLE',
          message: `Service "${path}" is temporarily unavailable. Please try again later.`,
          cause: 'CIRCUIT_BREAKER_OPEN'
        });
      }
      throw error;
    }
  };
}

/**
 * Health check endpoint para circuit breakers
 */
export function getCircuitBreakerHealth() {
  const metrics = CircuitBreakerFactory.getAllMetrics();

  const circuits = Object.entries(metrics).map(([name, m]) => ({
    name,
    state: m.currentState,
    totalCalls: m.totalCalls,
    failedCalls: m.failedCalls,
    healthy: m.currentState !== CircuitState.OPEN
  }));

  const allHealthy = circuits.every(c => c.healthy);

  return {
    status: allHealthy ? 'healthy' : 'degraded',
    circuits,
    timestamp: new Date().toISOString()
  };
}

/**
 * Dashboard de Circuit Breakers
 */
export function getCircuitBreakerDashboard() {
  const metrics = CircuitBreakerFactory.getAllMetrics();

  return {
    summary: {
      total: Object.keys(metrics).length,
      open: Object.values(metrics).filter(m => m.currentState === CircuitState.OPEN).length,
      halfOpen: Object.values(metrics).filter(m => m.currentState === CircuitState.HALF_OPEN).length,
      closed: Object.values(metrics).filter(m => m.currentState === CircuitState.CLOSED).length
    },
    circuits: Object.entries(metrics).map(([name, m]) => ({
      name,
      state: m.currentState,
      metrics: {
        totalCalls: m.totalCalls,
        successfulCalls: m.successfulCalls,
        failedCalls: m.failedCalls,
        rejectionRate: m.totalCalls > 0
          ? ((m.totalCalls - m.successfulCalls - m.failedCalls) / m.totalCalls * 100).toFixed(2) + '%'
          : '0%',
        lastFailure: m.lastFailureTime
          ? new Date(m.lastFailureTime).toISOString()
          : null,
        lastSuccess: m.lastSuccessTime
          ? new Date(m.lastSuccessTime).toISOString()
          : null
      }
    }))
  };
}

// Pre-configured circuit breakers para serviços críticos
export const SERVICE_CIRCUITS = {
  // Integração com Mercado Livre
  MERCADO_LIVRE: 'mercado_livre',

  // Integração com Shopee
  SHOPEE: 'shopee',

  // Integração com Hotmart
  HOTMART: 'hotmart',

  // Processamento de pagamentos
  PAYMENT_GATEWAY: 'payment_gateway',

  // Integração PIX
  PIX_INTEGRATION: 'pix_integration',

  // Database operations
  DATABASE: 'database',

  // External APIs
  EXTERNAL_API: 'external_api',

  // AI/LLM services
  LLM_SERVICE: 'llm_service',

  // BullMQ workers
  WORKER_QUEUE: 'worker_queue'
} as const;

export type ServiceCircuitName = typeof SERVICE_CIRCUITS[keyof typeof SERVICE_CIRCUITS];

/**
 * Inicializa circuit breakers para serviços padrão
 */
export function initializeServiceCircuits() {
  // Mercado Livre - mais tolerante a falhas
  CircuitBreakerFactory.get(SERVICE_CIRCUITS.MERCADO_LIVRE, {
    failureThreshold: 3,
    timeout: 30000,
    resetTimeout: 5000
  });

  // Shopee
  CircuitBreakerFactory.get(SERVICE_CIRCUITS.SHOPEE, {
    failureThreshold: 3,
    timeout: 30000,
    resetTimeout: 5000
  });

  // Hotmart
  CircuitBreakerFactory.get(SERVICE_CIRCUITS.HOTMART, {
    failureThreshold: 5,
    timeout: 60000,
    resetTimeout: 10000
  });

  // Payment Gateway - menos tolerante
  CircuitBreakerFactory.get(SERVICE_CIRCUITS.PAYMENT_GATEWAY, {
    failureThreshold: 2,
    timeout: 30000,
    resetTimeout: 5000
  });

  // Database - muito tolerante
  CircuitBreakerFactory.get(SERVICE_CIRCUITS.DATABASE, {
    failureThreshold: 10,
    timeout: 120000,
    resetTimeout: 30000
  });

  // LLM Service
  CircuitBreakerFactory.get(SERVICE_CIRCUITS.LLM_SERVICE, {
    failureThreshold: 5,
    timeout: 60000,
    resetTimeout: 10000
  });

  console.log('[CircuitBreaker] Service circuits initialized');
}

export default {
  createCircuitBreakerMiddleware,
  circuitBreakerMiddleware,
  getCircuitBreakerHealth,
  getCircuitBreakerDashboard,
  SERVICE_CIRCUITS,
  initializeServiceCircuits
};