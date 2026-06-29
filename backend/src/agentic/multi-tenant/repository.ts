/**
 * Nexus Affil'IA'te · M8 · Multi-Tenant Repository
 *
 * Persiste tenants whitelabel em data/tenants.json
 *
 * @module agentic/multi-tenant/repository
 * @author Niko Nexus · CEO/AI
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { tenantSchema, type Tenant } from "./types";

const STORE_PATH = path.resolve(process.cwd(), "data", "tenants.json");

interface Store {
  tenants: Tenant[];
  updatedAt: string;
}

async function ensureStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    const fresh: Store = { tenants: [], updatedAt: new Date().toISOString() };
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

async function persistStore(s: Store): Promise<void> {
  s.updatedAt = new Date().toISOString();
  await fs.writeFile(STORE_PATH, JSON.stringify(s, null, 2));
}

export const tenantRepository = {
  async list(): Promise<Tenant[]> {
    const s = await ensureStore();
    // Não expõe apiKey
    return s.tenants.map((t) => ({ ...t, apiKey: t.apiKey ? "***" : undefined }));
  },

  async listFull(): Promise<Tenant[]> {
    const s = await ensureStore();
    return s.tenants;
  },

  async getById(tenantId: string): Promise<Tenant | null> {
    const s = await ensureStore();
    const t = s.tenants.find((x) => x.tenantId === tenantId);
    return t ?? null;
  },

  async register(input: Omit<Tenant, "registeredAt" | "totalPings" | "successfulPings" | "totalVotes" | "validVotes" | "avgLatencyMs">): Promise<Tenant> {
    const s = await ensureStore();
    if (s.tenants.find((t) => t.tenantId === input.tenantId)) {
      throw new Error(`Tenant ${input.tenantId} já registrado`);
    }
    const tenant: Tenant = tenantSchema.parse({
      ...input,
      trustLevel: input.trustLevel ?? "sandbox",
      active: input.active ?? true,
      registeredAt: new Date().toISOString(),
      totalPings: 0,
      successfulPings: 0,
      totalVotes: 0,
      validVotes: 0,
      avgLatencyMs: 0,
      metadata: input.metadata ?? {},
    });
    s.tenants.push(tenant);
    await persistStore(s);
    return { ...tenant, apiKey: tenant.apiKey ? "***" : undefined };
  },

  async recordPing(tenantId: string, success: boolean, latencyMs: number): Promise<void> {
    const s = await ensureStore();
    const idx = s.tenants.findIndex((t) => t.tenantId === tenantId);
    if (idx < 0) return;
    const t = s.tenants[idx];
    t.totalPings += 1;
    if (success) t.successfulPings += 1;
    // média móvel simples
    const n = t.totalPings;
    t.avgLatencyMs = (t.avgLatencyMs * (n - 1) + latencyMs) / n;
    t.lastSeenAt = new Date().toISOString();
    await persistStore(s);
  },

  async recordVote(tenantId: string, valid: boolean): Promise<void> {
    const s = await ensureStore();
    const idx = s.tenants.findIndex((t) => t.tenantId === tenantId);
    if (idx < 0) return;
    const t = s.tenants[idx];
    t.totalVotes += 1;
    if (valid) t.validVotes += 1;
    await persistStore(s);
  },

  async promote(tenantId: string, newTrust: Tenant["trustLevel"]): Promise<Tenant | null> {
    const s = await ensureStore();
    const idx = s.tenants.findIndex((t) => t.tenantId === tenantId);
    if (idx < 0) return null;
    s.tenants[idx].trustLevel = newTrust;
    s.tenants[idx].promotedAt = new Date().toISOString();
    await persistStore(s);
    return s.tenants[idx];
  },

  async setActive(tenantId: string, active: boolean): Promise<Tenant | null> {
    const s = await ensureStore();
    const idx = s.tenants.findIndex((t) => t.tenantId === tenantId);
    if (idx < 0) return null;
    s.tenants[idx].active = active;
    await persistStore(s);
    return s.tenants[idx];
  },

  async stats() {
    const s = await ensureStore();
    const total = s.tenants.length;
    const active = s.tenants.filter((t) => t.active).length;
    const byTrust = {
      sandbox: s.tenants.filter((t) => t.trustLevel === "sandbox").length,
      verified: s.tenants.filter((t) => t.trustLevel === "verified").length,
      elite: s.tenants.filter((t) => t.trustLevel === "elite").length,
    };
    return { total, active, byTrust };
  },
};
