/**
 * Agent Runtime domain events.
 */

import {
  eventBus,
  DomainEventType,
  type AgentSessionPayload,
} from "../../_core/events/eventBus";
import { createDomainEvent } from "../shared/eventFactory";

export async function publishAgentSessionStarted(
  payload: AgentSessionPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<AgentSessionPayload>({
      type: DomainEventType.AGENT_SESSION_STARTED,
      aggregateId: payload.sessionId,
      aggregateType: "AgentSession",
      payload,
      metadata,
    }),
  );
}

export async function publishAgentSessionCompleted(
  payload: AgentSessionPayload,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent<AgentSessionPayload>({
      type: DomainEventType.AGENT_SESSION_COMPLETED,
      aggregateId: payload.sessionId,
      aggregateType: "AgentSession",
      payload,
      metadata,
    }),
  );
}

export async function publishAgentSessionFailed(
  payload: AgentSessionPayload & { errorMessage: string },
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.AGENT_SESSION_FAILED,
      aggregateId: payload.sessionId,
      aggregateType: "AgentSession",
      payload,
      metadata,
    }),
  );
}

export async function publishAgentSkillActivated(
  agentId: string,
  skillId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.AGENT_SKILL_ACTIVATED,
      aggregateId: agentId,
      aggregateType: "Agent",
      payload: { agentId, skillId },
      metadata,
    }),
  );
}

export async function publishAgentContentGenerated(
  agentId: string,
  contentId: string,
  channel: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await eventBus.publish(
    createDomainEvent({
      type: DomainEventType.AGENT_CONTENT_GENERATED,
      aggregateId: agentId,
      aggregateType: "Agent",
      payload: { agentId, contentId, channel },
      metadata,
    }),
  );
}
