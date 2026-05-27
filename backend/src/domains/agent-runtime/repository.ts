import {
  createSessionAudit,
  getActiveUpgrades,
  getAgentByUserId,
  updateAgent,
} from "../../../../database/schemas/db";

import type {
  AgentRuntimeAgentRecord,
  AgentRuntimeAuditInput,
  AgentRuntimeUpgradeRecord,
} from "./types";

export async function findAgentByUserId(
  userId: number,
): Promise<AgentRuntimeAgentRecord | null> {
  return (await getAgentByUserId(userId)) ?? null;
}

export async function listActiveUpgradesByAgentId(
  agentId: number,
): Promise<AgentRuntimeUpgradeRecord[]> {
  return (await getActiveUpgrades(agentId)) as AgentRuntimeUpgradeRecord[];
}

export async function updateAgentPerformanceScore(
  agentId: number,
  performanceScore: number,
) {
  return (await updateAgent(agentId, { performanceScore } as any)) ?? null;
}

export async function insertAgentRuntimeAudit(input: AgentRuntimeAuditInput) {
  return createSessionAudit(input as any);
}
