import { describe, it, expect, vi } from "vitest";

import {
  DomainEventType,
  EventBus,
  EventFactory,
} from "../../backend/src/_core/events/eventBus";

describe("EventBus", () => {
  it("publica eventos para subscribers registrados", async () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.subscribe(DomainEventType.AFFILIATE_REGISTERED, handler);

    const event = EventFactory.affiliateRegistered({
      affiliateId: "aff-1",
      sponsorId: "sponsor-1",
      email: "affiliate@example.com",
      name: "Affiliate Test",
      plan: "affiliate",
      rank: "active",
    });

    await bus.publish(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: DomainEventType.AFFILIATE_REGISTERED,
        aggregateId: "aff-1",
      }),
    );
  });

  it("mantém histórico filtrável por tipo e aggregateId", async () => {
    const bus = new EventBus();

    await bus.publish(
      EventFactory.commissionGenerated({
        commissionId: "com-1",
        affiliateId: "aff-1",
        orderId: "order-1",
        amount: 99.9,
        commissionType: "direct",
        percentage: 10,
        status: "pending",
      }),
    );

    await bus.publish(
      EventFactory.commissionGenerated({
        commissionId: "com-2",
        affiliateId: "aff-2",
        orderId: "order-2",
        amount: 49.9,
        commissionType: "indirect",
        percentage: 5,
        status: "approved",
      }),
    );

    const filtered = bus.getHistory({
      eventType: DomainEventType.COMMISSION_GENERATED,
      aggregateId: "com-2",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.aggregateId).toBe("com-2");
    expect(filtered[0]?.payload).toMatchObject({ affiliateId: "aff-2" });
  });

  it("permite unsubscribe e expõe contagem de subscribers", async () => {
    const bus = new EventBus();
    const handler = vi.fn();

    const subscriptionId = bus.subscribe(DomainEventType.XP_GRANTED, handler);
    expect(bus.getSubscribersCount(DomainEventType.XP_GRANTED)).toBe(1);

    bus.unsubscribe(subscriptionId);
    expect(bus.getSubscribersCount(DomainEventType.XP_GRANTED)).toBe(0);

    await bus.publish(
      EventFactory.xpGranted({
        userId: "user-1",
        amount: 100,
        reason: "test",
        source: "bonus",
        newTotal: 1000,
      }),
    );

    expect(handler).not.toHaveBeenCalled();
  });
});
