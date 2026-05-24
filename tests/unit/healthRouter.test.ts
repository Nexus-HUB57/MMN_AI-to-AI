import { beforeEach, describe, expect, it } from "vitest";

import { CircuitBreakerFactory } from "../../backend/src/_core/CircuitBreaker";
import { eventBus, DomainEventType } from "../../backend/src/_core/events/eventBus";
import { healthRouter } from "../../backend/src/routers/healthRouter";

describe("healthRouter", () => {
  beforeEach(() => {
    CircuitBreakerFactory.clear();
  });

  it("retorna liveness probe com ok=true", async () => {
    const caller = healthRouter.createCaller({} as any);
    const result = await caller.live();

    expect(result.ok).toBe(true);
    expect(typeof result.timestamp).toBe("string");
  });

  it("retorna readiness com componentes e métricas", async () => {
    const caller = healthRouter.createCaller({} as any);
    const result = await caller.ready();

    expect(["healthy", "degraded", "unhealthy"]).toContain(result.overall);
    expect(result.components.length).toBeGreaterThan(0);
    expect(result.metrics.memory.heapTotal).toBeGreaterThan(0);
    expect(result.metrics.uptime).toBeGreaterThanOrEqual(0);
  });

  it("expõe status do event bus com subscriptions", async () => {
    const caller = healthRouter.createCaller({} as any);

    const subscriptionId = eventBus.subscribe(
      DomainEventType.AFFILIATE_REGISTERED,
      () => undefined,
    );

    const result = await caller.eventBus();

    expect(result.totalEventTypes).toBeGreaterThan(0);
    expect(result.subscriptions[DomainEventType.AFFILIATE_REGISTERED]).toBeGreaterThanOrEqual(1);

    eventBus.unsubscribe(subscriptionId);
  });

  it("lista circuit breakers registrados", async () => {
    CircuitBreakerFactory.get("ai_provider_openai");
    CircuitBreakerFactory.get("ai_provider_google");

    const caller = healthRouter.createCaller({} as any);
    const result = await caller.circuitBreakers();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.map((item) => item.name)).toEqual(
      expect.arrayContaining(["ai_provider_openai", "ai_provider_google"]),
    );
  });
});
