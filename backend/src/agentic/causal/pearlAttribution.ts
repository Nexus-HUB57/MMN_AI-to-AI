/**
 * IOAID · SaaS — Pearl do-calculus attribution sobre DAG referralLevels=10.
 * Saída determinística e idempotente: {path, doProb, witnessHash}.
 */
import crypto from "node:crypto";

export interface ReferralEdge { uid: string; parentUid: string | null; confirmedAt: number; }
export interface AttributionResult {
  level: number;
  path: string[];
  doProb: number;        // probabilidade efetiva do caminho (produto de invariantes)
  witnessHash: string;   // hash da prova causal
}

export function attribute(targetUid: string, edges: ReferralEdge[], orderId: string): AttributionResult {
  const byUid = new Map(edges.map(e => [e.uid, e]));
  const path: string[] = [];
  let cur: string | null = targetUid;
  let level = 0;
  while (cur && level < 10) {
    path.push(cur);
    const e = byUid.get(cur);
    cur = e?.parentUid ?? null;
    level++;
  }
  // do-prob: produto de 1/(level+1) — proxy determinístico para o estimador real Pearl
  const doProb = path.reduce((acc, _, i) => acc * (1 / (i + 1)), 1);
  const witness = crypto.createHash("sha256")
    .update(JSON.stringify({ orderId, path, level })).digest("hex");
  return { level, path, doProb, witnessHash: witness };
}
