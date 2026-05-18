import { nanoid } from "nanoid";
import type { AgentQueueJob } from "./types";

export class AgentRuntimeQueue {
  private jobs = new Map<string, AgentQueueJob>();

  enqueue(sessionId: string, type: string, payload: Record<string, unknown>): AgentQueueJob {
    const now = new Date().toISOString();
    const job: AgentQueueJob = {
      id: nanoid(),
      sessionId,
      type,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      payload,
    };

    this.jobs.set(job.id, job);
    return job;
  }

  start(jobId: string): AgentQueueJob | null {
    return this.patch(jobId, { status: "running" });
  }

  complete(jobId: string, result?: Record<string, unknown>): AgentQueueJob | null {
    return this.patch(jobId, { status: "completed", result });
  }

  fail(jobId: string, error: string): AgentQueueJob | null {
    return this.patch(jobId, { status: "failed", error });
  }

  private patch(jobId: string, patch: Partial<AgentQueueJob>): AgentQueueJob | null {
    const current = this.jobs.get(jobId);
    if (!current) return null;

    const next: AgentQueueJob = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, next);
    return next;
  }

  listRecent(limit = 20): AgentQueueJob[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  listBySession(sessionId: string, limit = 20): AgentQueueJob[] {
    return this.listRecent(200).filter((job) => job.sessionId === sessionId).slice(0, limit);
  }

  getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      queued: jobs.filter((job) => job.status === "queued").length,
      running: jobs.filter((job) => job.status === "running").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      failed: jobs.filter((job) => job.status === "failed").length,
      total: jobs.length,
    };
  }
}

export const agentRuntimeQueue = new AgentRuntimeQueue();
