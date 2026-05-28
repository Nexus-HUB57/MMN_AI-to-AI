/**
 * Fila de aprovações operacionais (`needs_review`)
 * -----------------------------------------------------------------------------
 * Cada vez que uma execução de skill termina com `decision = needs_review`,
 * registramos aqui uma entrada estruturada para o admin revisar e decidir
 * (approve / reject). A fila vive em memória (com TTL) e é exposta via
 * router `/admin/approvals/runtime`.
 *
 * Estrutura:
 *  - enqueue(item) → adiciona aprovação pendente.
 *  - list({ status, limit }) → lista filtrada.
 *  - decide(id, decision) → marca como aprovada ou rejeitada.
 *
 * Quando o Postgres estiver online, este módulo poderá ser estendido para
 * persistir em uma tabela `skill_approvals` sem mudar a API pública.
 */

export interface ApprovalItem {
  id: string;
  executionId: string;
  skill: string;
  status: "pending" | "approved" | "rejected";
  warnings: string[];
  output: unknown;
  channelHint?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

const MAX_QUEUE = 200;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const queue: ApprovalItem[] = [];

function cleanupExpired(): void {
  const now = Date.now();
  for (let i = queue.length - 1; i >= 0; i -= 1) {
    const item = queue[i];
    const createdAt = new Date(item.createdAt).getTime();
    if (item.status !== "pending" && now - createdAt > TTL_MS) {
      queue.splice(i, 1);
    }
  }
  if (queue.length > MAX_QUEUE) {
    // remove os mais antigos resolvidos primeiro
    const resolved = queue
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.status !== "pending")
      .sort((a, b) => new Date(a.item.createdAt).getTime() - new Date(b.item.createdAt).getTime());
    const toRemove = queue.length - MAX_QUEUE;
    for (let i = 0; i < toRemove && i < resolved.length; i += 1) {
      const targetIndex = resolved[i].index;
      queue.splice(targetIndex, 1);
    }
  }
}

export interface EnqueueInput {
  executionId: string;
  skill: string;
  warnings?: string[];
  output: unknown;
  channelHint?: string;
}

export function enqueueApproval(input: EnqueueInput): ApprovalItem {
  cleanupExpired();
  const item: ApprovalItem = {
    id: `apv_${input.executionId}`,
    executionId: input.executionId,
    skill: input.skill,
    status: "pending",
    warnings: input.warnings ?? [],
    output: input.output,
    channelHint: input.channelHint,
    createdAt: new Date().toISOString(),
  };
  queue.unshift(item);
  return item;
}

export function listApprovals(options?: {
  status?: ApprovalItem["status"];
  limit?: number;
}): ApprovalItem[] {
  cleanupExpired();
  const limit = options?.limit ?? 50;
  const filtered = options?.status
    ? queue.filter((item) => item.status === options.status)
    : queue.slice();
  return filtered.slice(0, limit);
}

export function getApprovalStats(): {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
} {
  cleanupExpired();
  return {
    pending: queue.filter((item) => item.status === "pending").length,
    approved: queue.filter((item) => item.status === "approved").length,
    rejected: queue.filter((item) => item.status === "rejected").length,
    total: queue.length,
  };
}

export function decideApproval(
  id: string,
  decision: "approved" | "rejected",
  resolvedBy: string,
  note?: string,
): ApprovalItem | null {
  const item = queue.find((entry) => entry.id === id);
  if (!item || item.status !== "pending") return null;
  item.status = decision;
  item.resolvedAt = new Date().toISOString();
  item.resolvedBy = resolvedBy;
  if (note) item.resolutionNote = note;
  return item;
}

export function resetApprovalsQueue(): void {
  queue.length = 0;
}
