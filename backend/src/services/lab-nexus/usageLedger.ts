/**
 * usageLedger — Lab Nexus Usage Ledger
 * --------------------------------------------------------------
 * Registra e controla o uso do Lab Nexus por afiliado.
 * Rastreia tokens consumidos, mensagens enviadas e quotas diárias.
 */

// In-memory usage tracking (resets daily per tier)
interface UsageEntry {
  messagesSent: number;
  tokensUsed: number;
  lastReset: string; // YYYY-MM-DD
}

const usageStore = new Map<string, UsageEntry>();

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getEntry(affiliateId: number, tier: string): UsageEntry {
  const key = `${affiliateId}:${tier}`;
  let entry = usageStore.get(key);
  const today = getToday();

  if (!entry || entry.lastReset !== today) {
    entry = { messagesSent: 0, tokensUsed: 0, lastReset: today };
    usageStore.set(key, entry);
  }

  return entry;
}

export interface UsageSnapshot {
  affiliateId: number | undefined;
  tier: string;
  messagesSent: number;
  tokensUsed: number;
  date: string;
}

/** Retorna snapshot de uso atual do afiliado */
export function getLabNexusUsageSnapshot(opts: {
  affiliateId?: number;
  tier: string;
}): UsageSnapshot {
  const entry = getEntry(opts.affiliateId ?? 0, opts.tier);
  return {
    affiliateId: opts.affiliateId,
    tier: opts.tier,
    messagesSent: entry.messagesSent,
    tokensUsed: entry.tokensUsed,
    date: entry.lastReset,
  };
}

/** Registra uso de uma mensagem */
export function recordLabNexusUsage(opts: {
  affiliateId: number;
  tier: string;
  tokensUsed: number;
}): void {
  const entry = getEntry(opts.affiliateId, opts.tier);
  entry.messagesSent += 1;
  entry.tokensUsed += opts.tokensUsed;
}
