/**
 * Nexus Affil'IA'te · M4 · Governance Loop · Repository
 *
 * Persistência simples em JSON (data/governance-records.json).
 * Estrutura intencionalmente file-based para audit/replay determinístico
 * e migração futura para DB sem mudança de contrato.
 *
 * @module agentic/governance-loop/repository
 * @author Niko Nexus · CEO/AI
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  governanceRecordSchema,
  type GovernanceRecord,
  type GovernedAction,
  type GovernanceDecision,
} from "./types";

const STORE_PATH = path.resolve(
  process.cwd(),
  "data",
  "governance-records.json",
);

interface Store {
  records: GovernanceRecord[];
  updatedAt: string;
}

async function ensureStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    const fresh: Store = { records: [], updatedAt: new Date().toISOString() };
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

async function persistStore(store: Store): Promise<void> {
  store.updatedAt = new Date().toISOString();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

export function computeAuditDigest(
  action: GovernedAction,
  decision: Omit<GovernanceDecision, "auditDigest">,
): string {
  const canonical = JSON.stringify({
    actionId: action.actionId,
    kind: action.kind,
    subject: action.subject,
    initiator: action.initiator,
    createdAt: action.createdAt,
    decision: {
      finalDecision: decision.finalDecision,
      consensus: decision.consensus.toFixed(4),
      avgQuality: decision.avgQuality.toFixed(4),
      avgRisk: decision.avgRisk.toFixed(4),
      votersCount: decision.votersCount,
      validVotes: decision.validVotes,
      decidedAt: decision.decidedAt,
    },
  });
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

export const governanceRepository = {
  async append(record: GovernanceRecord): Promise<GovernanceRecord> {
    const parsed = governanceRecordSchema.parse(record);
    const store = await ensureStore();
    store.records.push(parsed);
    await persistStore(store);
    return parsed;
  },

  async list(opts?: {
    limit?: number;
    kind?: string;
    decision?: "approved" | "review" | "blocked";
  }): Promise<GovernanceRecord[]> {
    const store = await ensureStore();
    let out = store.records.slice().reverse();
    if (opts?.kind) {
      out = out.filter((r) => r.action.kind === opts.kind);
    }
    if (opts?.decision) {
      out = out.filter((r) => r.decision.finalDecision === opts.decision);
    }
    if (opts?.limit && opts.limit > 0) {
      out = out.slice(0, opts.limit);
    }
    return out;
  },

  async getByActionId(actionId: string): Promise<GovernanceRecord | null> {
    const store = await ensureStore();
    return store.records.find((r) => r.action.actionId === actionId) ?? null;
  },

  async updateExecution(
    actionId: string,
    status: GovernanceRecord["executionStatus"],
    log?: string,
  ): Promise<GovernanceRecord | null> {
    const store = await ensureStore();
    const idx = store.records.findIndex((r) => r.action.actionId === actionId);
    if (idx < 0) return null;
    store.records[idx].executionStatus = status;
    store.records[idx].executedAt = new Date().toISOString();
    if (log) store.records[idx].executionLog = log;
    await persistStore(store);
    return store.records[idx];
  },

  async stats() {
    const store = await ensureStore();
    const total = store.records.length;
    const approved = store.records.filter(
      (r) => r.decision.finalDecision === "approved",
    ).length;
    const blocked = store.records.filter(
      (r) => r.decision.finalDecision === "blocked",
    ).length;
    const review = store.records.filter(
      (r) => r.decision.finalDecision === "review",
    ).length;
    const executed = store.records.filter(
      (r) => r.executionStatus === "executed",
    ).length;
    return {
      total,
      approved,
      blocked,
      review,
      executed,
      approvalRate: total > 0 ? approved / total : 0,
    };
  },
};
