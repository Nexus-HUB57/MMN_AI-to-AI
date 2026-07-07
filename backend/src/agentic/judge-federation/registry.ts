/**
 * Nexus Affil'IA'te · Judge Federation · Registry de nós
 *
 * Persistência simples (JSON file) dos nós Judge conhecidos.
 * Cada nó tem chaves ed25519, trustLevel e flag active.
 *
 * Em produção (M8): registry distribuído via gossip protocol + mTLS pinned.
 *
 * @module agentic/judge-federation/registry
 * @author Niko Nexus · CEO/AI
 */
import { promises as fs } from "fs";
import path from "path";
import { generateJudgeKeys, type JudgeKeyPair } from "./keys";
import type { KnownNode } from "./quorum";

const REGISTRY_PATH = path.resolve(
  process.cwd(),
  "data",
  "judge-federation-registry.json",
);

interface RegistryFile {
  version: number;
  nodes: Array<{
    nodeId: string;
    name: string;
    publicKeyPem: string;
    privateKeyPem?: string; // local em MVP, em prod fica em KMS
    trustLevel: "sandbox" | "verified" | "elite";
    active: boolean;
    operator: string;
    createdAt: string;
  }>;
  updatedAt?: string;
}

async function ensureFile() {
  await fs.mkdir(path.dirname(REGISTRY_PATH), { recursive: true });
  try {
    await fs.access(REGISTRY_PATH);
  } catch {
    const seed = await seedRegistry();
    await fs.writeFile(REGISTRY_PATH, JSON.stringify(seed, null, 2), "utf8");
  }
}

/**
 * Cria registry inicial com 3 nós Judge para quorum 2-de-3.
 * Nó 1: nexus-judge-prime (elite)
 * Nó 2: nexus-judge-alpha (verified)
 * Nó 3: nexus-judge-beta  (verified)
 */
async function seedRegistry(): Promise<RegistryFile> {
  const nodes = [
    {
      nodeId: "nexus-judge-prime",
      name: "Nexus Judge Prime",
      operator: "Nexus Affil'IA'te",
      trustLevel: "elite" as const,
      ...keys("nexus-judge-prime"),
    },
    {
      nodeId: "nexus-judge-alpha",
      name: "Nexus Judge Alpha",
      operator: "Nexus Affil'IA'te",
      trustLevel: "verified" as const,
      ...keys("nexus-judge-alpha"),
    },
    {
      nodeId: "nexus-judge-beta",
      name: "Nexus Judge Beta",
      operator: "Nexus Affil'IA'te",
      trustLevel: "verified" as const,
      ...keys("nexus-judge-beta"),
    },
  ];

  return {
    version: 1,
    nodes: nodes.map((n) => ({
      nodeId: n.nodeId,
      name: n.name,
      publicKeyPem: n.publicKeyPem,
      privateKeyPem: n.privateKeyPem,
      trustLevel: n.trustLevel,
      active: true,
      operator: n.operator,
      createdAt: new Date().toISOString(),
    })),
    updatedAt: new Date().toISOString(),
  };

  function keys(nodeId: string): Pick<JudgeKeyPair, "publicKeyPem" | "privateKeyPem"> {
    const k = generateJudgeKeys(nodeId);
    return { publicKeyPem: k.publicKeyPem, privateKeyPem: k.privateKeyPem };
  }
}

async function readRegistry(): Promise<RegistryFile> {
  await ensureFile();
  const raw = await fs.readFile(REGISTRY_PATH, "utf8");
  return JSON.parse(raw) as RegistryFile;
}

async function writeRegistry(data: RegistryFile) {
  await fs.writeFile(
    REGISTRY_PATH,
    JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
}

export const judgeRegistry = {
  async list(): Promise<KnownNode[]> {
    const r = await readRegistry();
    return r.nodes.map((n) => ({
      nodeId: n.nodeId,
      publicKeyPem: n.publicKeyPem,
      trustLevel: n.trustLevel,
      active: n.active,
    }));
  },

  async listFull() {
    const r = await readRegistry();
    return r.nodes.map((n) => ({
      nodeId: n.nodeId,
      name: n.name,
      operator: n.operator,
      trustLevel: n.trustLevel,
      active: n.active,
      createdAt: n.createdAt,
      // Não expor privateKey publicamente
      publicKeyFingerprint: n.publicKeyPem.slice(60, 80).replace(/\s/g, ""),
    }));
  },

  async getByNodeId(nodeId: string) {
    const r = await readRegistry();
    return r.nodes.find((n) => n.nodeId === nodeId);
  },

  async getPrivateKey(nodeId: string): Promise<string | null> {
    const node = await this.getByNodeId(nodeId);
    return node?.privateKeyPem ?? null;
  },

  async setActive(nodeId: string, active: boolean) {
    const r = await readRegistry();
    const idx = r.nodes.findIndex((n) => n.nodeId === nodeId);
    if (idx < 0) throw new Error("Nó não encontrado");
    r.nodes[idx].active = active;
    await writeRegistry(r);
    return r.nodes[idx];
  },
};
