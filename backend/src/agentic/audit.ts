import { nanoid } from "nanoid";
import { agenticRepository } from "./repository";
import type { AgentActionAudit, AgenticActionStatus, AgenticJudgeVerdict } from "./types";

export class AgentAuditStore {
  private actions = new Map<string, AgentActionAudit>();

  record(input: {
    sessionId: string;
    actionKey: string;
    toolName: string;
    status: AgenticActionStatus;
    inputSummary: string;
  }): AgentActionAudit {
    const now = new Date().toISOString();
    const action: AgentActionAudit = {
      id: nanoid(),
      sessionId: input.sessionId,
      actionKey: input.actionKey,
      toolName: input.toolName,
      status: input.status,
      inputSummary: input.inputSummary,
      createdAt: now,
      updatedAt: now,
    };

    this.actions.set(action.id, action);
    void agenticRepository.upsertAction(action);
    return action;
  }

  update(
    actionId: string,
    patch: Partial<Pick<AgentActionAudit, "status" | "judgeVerdict" | "score" | "outputSummary" | "reasoning" | "latencyMs">>,
  ): AgentActionAudit | null {
    const current = this.actions.get(actionId);
    if (!current) return null;

    const next: AgentActionAudit = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.actions.set(actionId, next);
    void agenticRepository.upsertAction(next);
    return next;
  }

  complete(actionId: string, outputSummary: string, score?: number, verdict?: AgenticJudgeVerdict, reasoning?: string, latencyMs?: number) {
    return this.update(actionId, {
      status: "completed",
      outputSummary,
      score,
      judgeVerdict: verdict,
      reasoning,
      latencyMs,
    });
  }

  fail(actionId: string, reason: string, latencyMs?: number) {
    return this.update(actionId, {
      status: "failed",
      outputSummary: reason,
      reasoning: reason,
      latencyMs,
    });
  }

  listBySession(sessionId: string, limit = 50): AgentActionAudit[] {
    return Array.from(this.actions.values())
      .filter((action) => action.sessionId === sessionId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  listRecent(limit = 20): AgentActionAudit[] {
    return Array.from(this.actions.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}

export const agentAuditStore = new AgentAuditStore();
