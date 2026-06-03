/**
 * Lab Nexus · Usage Ledger
 * --------------------------------------------------------------
 * Ledger leve em memória para controlar consumo diário do Chat Bot
 * por afiliado/tier. Serve como camada P0 de proteção de custo,
 * auditoria operacional e rate limiting funcional no backend.
 */

export type LabNexusTier = "iniciante" | "operador" | "estrategista" | "elite";

export interface LabNexusLedgerRecord {
  date: string;
  tier: LabNexusTier;
  subjectId: string;
  requestsToday: number;
  estimatedInputTokens: number;
  tokensOut: number;
  lastUsedAt: string | null;
}

export interface LabNexusUsageSnapshot extends LabNexusLedgerRecord {
  requestLimit: number;
  requestsRemaining: number;
}

const REQUEST_LIMITS: Record<LabNexusTier, number> = {
  iniciante: 0,
  operador: 50,
  estrategista: 500,
  elite: 5000,
};

const usageStore = new Map<string, LabNexusLedgerRecord>();

function resolveDateKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function resolveSubjectId(affiliateId?: number | string | null) {
  if (affiliateId === undefined || affiliateId === null || affiliateId === "") {
    return "anon";
  }
  return String(affiliateId);
}

function resolveLedgerKey(date: string, tier: LabNexusTier, subjectId: string) {
  return `${date}:${tier}:${subjectId}`;
}

function ensureRecord(date: string, tier: LabNexusTier, subjectId: string) {
  const key = resolveLedgerKey(date, tier, subjectId);
  const existing = usageStore.get(key);
  if (existing) return existing;

  const created: LabNexusLedgerRecord = {
    date,
    tier,
    subjectId,
    requestsToday: 0,
    estimatedInputTokens: 0,
    tokensOut: 0,
    lastUsedAt: null,
  };
  usageStore.set(key, created);
  return created;
}

export function estimateLabNexusInputTokens(messages: Array<{ content: string }>): number {
  const totalChars = messages.reduce((sum, message) => sum + (message.content?.length ?? 0), 0);
  return Math.max(1, Math.ceil(totalChars / 4));
}

export function getLabNexusUsageSnapshot(input: {
  affiliateId?: number | string | null;
  tier: LabNexusTier;
  now?: Date;
}): LabNexusUsageSnapshot {
  const date = resolveDateKey(input.now);
  const subjectId = resolveSubjectId(input.affiliateId);
  const record = ensureRecord(date, input.tier, subjectId);
  const requestLimit = REQUEST_LIMITS[input.tier] ?? 0;

  return {
    ...record,
    requestLimit,
    requestsRemaining: Math.max(0, requestLimit - record.requestsToday),
  };
}

export function assertLabNexusUsageAvailable(input: {
  affiliateId?: number | string | null;
  tier: LabNexusTier;
  now?: Date;
}): LabNexusUsageSnapshot {
  const snapshot = getLabNexusUsageSnapshot(input);
  if (snapshot.requestsToday >= snapshot.requestLimit) {
    throw new Error(
      `Limite diário do Lab Nexus atingido para o tier ${snapshot.tier}: ${snapshot.requestsToday}/${snapshot.requestLimit}.`,
    );
  }
  return snapshot;
}

export function recordLabNexusUsage(input: {
  affiliateId?: number | string | null;
  tier: LabNexusTier;
  estimatedInputTokens: number;
  tokensOut?: number;
  now?: Date;
}): LabNexusUsageSnapshot {
  const date = resolveDateKey(input.now);
  const subjectId = resolveSubjectId(input.affiliateId);
  const record = ensureRecord(date, input.tier, subjectId);

  record.requestsToday += 1;
  record.estimatedInputTokens += Math.max(0, Math.floor(input.estimatedInputTokens));
  record.tokensOut += Math.max(0, Math.floor(input.tokensOut ?? 0));
  record.lastUsedAt = (input.now ?? new Date()).toISOString();

  return getLabNexusUsageSnapshot({
    affiliateId: input.affiliateId,
    tier: input.tier,
    now: input.now,
  });
}

export function __resetLabNexusUsageLedger() {
  usageStore.clear();
}
