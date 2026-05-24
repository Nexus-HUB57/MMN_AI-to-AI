/**
 * XP / Career domain events.
 */

import {
  eventBus,
  DomainEventType,
  type XPGrantedPayload,
  type CareerLevelUpPayload,
} from "../../_core/events/eventBus";
import { createDomainEvent } from "../shared/eventFactory";

export async function publishXpGranted(
  payload: XPGrantedPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<XPGrantedPayload>({
      type: DomainEventType.XP_GRANTED,
      aggregateId: payload.userId,
      aggregateType: "User",
      payload,
      metadata,
    }),
  );
}

export async function publishXpLevelUp(
  userId: string,
  previousLevel: number,
  newLevel: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.XP_LEVEL_UP,
      aggregateId: userId,
      aggregateType: "User",
      payload: { userId, previousLevel, newLevel },
      metadata,
    }),
  );
}

export async function publishCareerLevelUp(
  payload: CareerLevelUpPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<CareerLevelUpPayload>({
      type: DomainEventType.CAREER_LEVEL_UP,
      aggregateId: payload.userId,
      aggregateType: "User",
      payload,
      metadata,
    }),
  );
}
