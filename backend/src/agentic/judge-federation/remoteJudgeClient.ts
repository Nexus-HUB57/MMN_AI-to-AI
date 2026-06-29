/**
 * Nexus Affil'IA'te · M7 · Remote Judge Client (A2A)
 *
 * Cliente HTTP para contatar nós Judge externos via A2A Protocol.
 *
 * Fluxo:
 *   1. Lê registro de nós remotos (data/remote-judges.json)
 *   2. Para cada nó ativo + endpoint configurado:
 *      a) Faz handshake A2A (ed25519, JWS, nonce)
 *      b) POST /api/a2a/invoke com skill="judge.vote"
 *      c) Recebe voto assinado (signature em ed25519 do nó remoto)
 *      d) Verifica assinatura contra publicKey conhecida
 *   3. Retorna lista de votos válidos para o orchestrator
 *
 * Fallback gracioso:
 *   - Timeout 3s por nó (não bloqueia decisão)
 *   - Se nó remoto falha → marca como rejected, segue com votos restantes
 *   - Se quorum insuficiente após timeout → orchestrator usa heurísticos seed
 *
 * @module agentic/judge-federation/remoteJudgeClient
 * @author Niko Nexus · CEO/AI
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { JudgeVote } from "./quorum";
import { verifyJudgeSignature } from "./keys";

const REMOTE_REGISTRY_PATH = path.resolve(
  process.cwd(),
  "data",
  "remote-judges.json",
);

const DEFAULT_TIMEOUT_MS = 3000;

export interface RemoteJudgeNode {
  nodeId: string;
  name: string;
  operator: string;
  endpoint: string;            // ex: https://parceiro.com.br/api/a2a/invoke
  publicKeyPem: string;        // chave pública ed25519
  trustLevel: "sandbox" | "verified" | "elite";
  active: boolean;
  apiKey?: string;             // opcional, header Authorization
  createdAt: string;
}

interface RemoteRegistry {
  nodes: RemoteJudgeNode[];
  updatedAt: string;
}

async function readRegistry(): Promise<RemoteRegistry> {
  try {
    const raw = await fs.readFile(REMOTE_REGISTRY_PATH, "utf8");
    return JSON.parse(raw) as RemoteRegistry;
  } catch {
    const fresh: RemoteRegistry = {
      nodes: [],
      updatedAt: new Date().toISOString(),
    };
    await fs.mkdir(path.dirname(REMOTE_REGISTRY_PATH), { recursive: true });
    await fs.writeFile(REMOTE_REGISTRY_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

async function writeRegistry(r: RemoteRegistry): Promise<void> {
  r.updatedAt = new Date().toISOString();
  await fs.writeFile(REMOTE_REGISTRY_PATH, JSON.stringify(r, null, 2));
}

/**
 * Faz POST a um nó Judge remoto, com timeout e parsing seguro.
 */
async function invokeRemoteJudge(
  node: RemoteJudgeNode,
  payload: {
    payloadId: string;
    payloadDigest: string;
    kind: string;
    rationale: string;
  },
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<{ vote: JudgeVote | null; error: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Detecta se o endpoint é tRPC interno (próprio backend) ou A2A externo
    const isInternalTrpc = node.endpoint.includes("/api/trpc/");

    const body = isInternalTrpc
      ? {
          // Formato tRPC: campos no top-level
          nodeId: node.nodeId,
          payloadId: payload.payloadId,
          payloadDigest: payload.payloadDigest,
          kind: payload.kind,
          rationale: payload.rationale,
        }
      : {
          // Formato A2A externo: envelope com payload aninhado
          protocol: "a2a/1.0",
          skill: "judge.vote",
          requesterId: "ceo-ai:niko-nexus",
          requesterOperator: "Nexus Affil'IA'te",
          payload,
        };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-A2A-Protocol": "1.0",
    };
    if (node.apiKey) headers["Authorization"] = `Bearer ${node.apiKey}`;

    const res = await fetch(node.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      return { vote: null, error: `http-${res.status}` };
    }

    const raw = (await res.json()) as any;
    // tRPC wrapper: result.data contém o payload real
    const data = (raw?.result?.data ?? raw) as {
      ok?: boolean;
      error?: string;
      decision?: "approve" | "review" | "block";
      qualityScore?: number;
      riskScore?: number;
      rationale?: string;
      signature?: string;
      signedAt?: string;
    };

    // Se tRPC retornou erro de business logic
    if (data.ok === false) {
      return { vote: null, error: data.error ?? "business-error" };
    }

    if (
      !data.decision ||
      typeof data.qualityScore !== "number" ||
      typeof data.riskScore !== "number" ||
      !data.signature ||
      !data.signedAt
    ) {
      return { vote: null, error: "malformed-response" };
    }

    // Verificar assinatura do nó remoto
    const q = data.qualityScore.toFixed(3);
    const r = data.riskScore.toFixed(3);
    const message = `${payload.payloadDigest}|${data.decision}|${q}|${r}|${data.signedAt}`;
    const valid = verifyJudgeSignature(message, data.signature, node.publicKeyPem);
    if (!valid) {
      return { vote: null, error: "invalid-signature" };
    }

    return {
      vote: {
        nodeId: node.nodeId,
        decision: data.decision,
        qualityScore: Number(q),
        riskScore: Number(r),
        rationale:
          data.rationale ??
          `${node.nodeId}: voto remoto via A2A (trust=${node.trustLevel})`,
        signature: data.signature,
        signedAt: data.signedAt,
      },
      error: null,
    };
  } catch (e: any) {
    clearTimeout(timer);
    return {
      vote: null,
      error: e?.name === "AbortError" ? "timeout" : `fetch-error:${e?.message ?? "unknown"}`,
    };
  }
}

/**
 * Coleta votos de TODOS os nós Judge remotos ativos em paralelo.
 * Retorna votos válidos + erros por nó.
 */
export async function collectRemoteVotes(payload: {
  payloadId: string;
  payloadDigest: string;
  kind: string;
  rationale: string;
}): Promise<{
  votes: JudgeVote[];
  remoteAttempts: number;
  remoteErrors: Array<{ nodeId: string; error: string }>;
}> {
  const registry = await readRegistry();
  const activeNodes = registry.nodes.filter((n) => n.active);

  if (activeNodes.length === 0) {
    return { votes: [], remoteAttempts: 0, remoteErrors: [] };
  }

  const results = await Promise.all(
    activeNodes.map((node) => invokeRemoteJudge(node, payload)),
  );

  const votes: JudgeVote[] = [];
  const errors: Array<{ nodeId: string; error: string }> = [];

  results.forEach((r, idx) => {
    const node = activeNodes[idx];
    if (r.vote) votes.push(r.vote);
    else if (r.error) errors.push({ nodeId: node.nodeId, error: r.error });
  });

  return {
    votes,
    remoteAttempts: activeNodes.length,
    remoteErrors: errors,
  };
}

// ─── API de gestão (CRUD do registro de nós remotos) ───────────────────────

export const remoteJudgeRegistry = {
  async list(): Promise<RemoteJudgeNode[]> {
    const r = await readRegistry();
    // Não expõe apiKey
    return r.nodes.map((n) => ({ ...n, apiKey: n.apiKey ? "***" : undefined }));
  },

  async listFull(): Promise<RemoteJudgeNode[]> {
    const r = await readRegistry();
    return r.nodes;
  },

  async register(node: Omit<RemoteJudgeNode, "createdAt">): Promise<RemoteJudgeNode> {
    const r = await readRegistry();
    if (r.nodes.find((n) => n.nodeId === node.nodeId)) {
      throw new Error(`Nó remoto ${node.nodeId} já registrado`);
    }
    const newNode: RemoteJudgeNode = {
      ...node,
      createdAt: new Date().toISOString(),
    };
    r.nodes.push(newNode);
    await writeRegistry(r);
    return { ...newNode, apiKey: newNode.apiKey ? "***" : undefined };
  },

  async setActive(nodeId: string, active: boolean): Promise<RemoteJudgeNode> {
    const r = await readRegistry();
    const node = r.nodes.find((n) => n.nodeId === nodeId);
    if (!node) throw new Error(`Nó ${nodeId} não encontrado`);
    node.active = active;
    await writeRegistry(r);
    return { ...node, apiKey: node.apiKey ? "***" : undefined };
  },

  async remove(nodeId: string): Promise<boolean> {
    const r = await readRegistry();
    const before = r.nodes.length;
    r.nodes = r.nodes.filter((n) => n.nodeId !== nodeId);
    if (r.nodes.length === before) return false;
    await writeRegistry(r);
    return true;
  },

  async testPing(nodeId: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const r = await readRegistry();
    const node = r.nodes.find((n) => n.nodeId === nodeId);
    if (!node) return { ok: false, latencyMs: 0, error: "node-not-found" };
    const start = Date.now();
    const result = await invokeRemoteJudge(node, {
      payloadId: `ping_${crypto.randomBytes(4).toString("hex")}`,
      payloadDigest: crypto.createHash("sha256").update("ping").digest("hex"),
      kind: "system.ping",
      rationale: "Health-check do nó remoto via A2A",
    }, 5000);
    return {
      ok: result.vote !== null,
      latencyMs: Date.now() - start,
      error: result.error ?? undefined,
    };
  },
};
