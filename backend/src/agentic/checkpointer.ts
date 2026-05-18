import { nanoid } from "nanoid";
import type { AgentCheckpoint } from "./types";

export class AgentCheckpointer {
  private checkpoints = new Map<string, AgentCheckpoint[]>();

  save(sessionId: string, reason: string, snapshot: Record<string, unknown>): AgentCheckpoint {
    const checkpoint: AgentCheckpoint = {
      id: nanoid(),
      sessionId,
      reason,
      snapshot,
      createdAt: new Date().toISOString(),
    };

    const existing = this.checkpoints.get(sessionId) || [];
    existing.unshift(checkpoint);
    this.checkpoints.set(sessionId, existing.slice(0, 20));
    return checkpoint;
  }

  list(sessionId: string): AgentCheckpoint[] {
    return this.checkpoints.get(sessionId) || [];
  }
}

export const agentCheckpointer = new AgentCheckpointer();
