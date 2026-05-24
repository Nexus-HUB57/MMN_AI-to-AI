/**
 * Domain Event Factory
 *
 * Helper utilitário para criar `DomainEvent` consistentes a partir de qualquer
 * domínio. Garante:
 *  - `id` único (timestamp + random)
 *  - `timestamp` ISO 8601 UTC
 *  - `version` semântica (default 1)
 *  - propagação opcional de `correlationId` / `causationId`
 *
 * Introduzido na continuação da Fase Beta (Prioridade 3 — Event-Driven).
 */

import {
  type DomainEvent,
  type DomainEventType,
} from "../../_core/events/eventBus";

export interface CreateEventInput<T> {
  type: DomainEventType;
  aggregateId: string;
  aggregateType: string;
  payload: T;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, unknown>;
  version?: number;
}

/**
 * Cria um `DomainEvent` tipado com defaults seguros.
 */
export function createDomainEvent<T>(input: CreateEventInput<T>): DomainEvent<T> {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    type: input.type,
    aggregateId: input.aggregateId,
    aggregateType: input.aggregateType,
    timestamp: new Date().toISOString(),
    version: input.version ?? 1,
    correlationId: input.correlationId,
    causationId: input.causationId,
    metadata: input.metadata ?? {},
    payload: input.payload,
  };
}
