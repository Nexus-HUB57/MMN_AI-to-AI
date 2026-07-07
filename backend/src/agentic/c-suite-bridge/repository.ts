/**
 * Nexus Affil'IA'te · M9 · C-Suite Repository
 *
 * Persiste identidades dos agentes C-level em data/c-suite.json
 * Gera chaves ed25519 dedicadas no primeiro registro.
 *
 * @module agentic/c-suite-bridge/repository
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  cLevelAgentSchema,
  type CLevelAgent,
  type CLevelRole,
} from "./types";

const STORE_PATH = path.resolve(process.cwd(), "data", "c-suite.json");

interface Store {
  agents: CLevelAgent[];
  updatedAt: string;
}

async function ensureStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    const fresh: Store = { agents: [], updatedAt: new Date().toISOString() };
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

async function persistStore(s: Store): Promise<void> {
  s.updatedAt = new Date().toISOString();
  await fs.writeFile(STORE_PATH, JSON.stringify(s, null, 2));
}

/**
 * Gera par de chaves ed25519 PEM.
 */
function generateKeyPair(): { publicKeyPem: string; privateKeyPem: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  return {
    publicKeyPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
    privateKeyPem: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  };
}

export const cSuiteRepository = {
  async list(): Promise<CLevelAgent[]> {
    const s = await ensureStore();
    // Não expõe privateKey
    return s.agents.map((a) => ({ ...a, privateKeyPem: undefined }));
  },

  async listFull(): Promise<CLevelAgent[]> {
    const s = await ensureStore();
    return s.agents;
  },

  async getById(agentId: string): Promise<CLevelAgent | null> {
    const s = await ensureStore();
    const a = s.agents.find((x) => x.agentId === agentId);
    if (!a) return null;
    return { ...a, privateKeyPem: undefined };
  },

  async getByRole(role: CLevelRole): Promise<CLevelAgent | null> {
    const s = await ensureStore();
    const a = s.agents.find((x) => x.role === role);
    if (!a) return null;
    return { ...a, privateKeyPem: undefined };
  },

  async getPrivateKey(agentId: string): Promise<string | null> {
    const s = await ensureStore();
    return s.agents.find((a) => a.agentId === agentId)?.privateKeyPem ?? null;
  },

  /**
   * Registra um agente C-level. Gera chaves automaticamente se não fornecidas.
   * Idempotente: se já existe, retorna o existente.
   */
  async register(input: {
    agentId: string;
    name: string;
    role: CLevelRole;
    workspace?: string;
    mandate: string;
    reportsTo?: string;
    permittedKinds?: string[];
    metadata?: Record<string, unknown>;
  }): Promise<CLevelAgent> {
    const s = await ensureStore();
    const existing = s.agents.find((a) => a.agentId === input.agentId);
    if (existing) {
      return { ...existing, privateKeyPem: undefined };
    }
    const keys = generateKeyPair();
    const agent: CLevelAgent = cLevelAgentSchema.parse({
      agentId: input.agentId,
      name: input.name,
      role: input.role,
      workspace: input.workspace,
      publicKeyPem: keys.publicKeyPem,
      privateKeyPem: keys.privateKeyPem,
      trustLevel: "elite",
      active: true,
      mandate: input.mandate,
      reportsTo: input.reportsTo,
      permittedKinds: input.permittedKinds ?? [],
      joinedAt: new Date().toISOString(),
      judgeNodeId: `judge-${input.agentId.replace(/[^a-z0-9-]/gi, "-")}`,
      metadata: input.metadata ?? {},
    });
    s.agents.push(agent);
    await persistStore(s);
    return { ...agent, privateKeyPem: undefined };
  },

  async setActive(agentId: string, active: boolean): Promise<CLevelAgent | null> {
    const s = await ensureStore();
    const idx = s.agents.findIndex((a) => a.agentId === agentId);
    if (idx < 0) return null;
    s.agents[idx].active = active;
    await persistStore(s);
    return { ...s.agents[idx], privateKeyPem: undefined };
  },

  async stats() {
    const s = await ensureStore();
    return {
      total: s.agents.length,
      active: s.agents.filter((a) => a.active).length,
      byRole: {
        ceo: s.agents.filter((a) => a.role === "CEO/AI").length,
        cto: s.agents.filter((a) => a.role === "CTO/AI").length,
        cmo: s.agents.filter((a) => a.role === "CMO/AI").length,
      },
    };
  },
};
