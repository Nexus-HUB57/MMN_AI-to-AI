/**
 * Nexus Affil'IA'te · CEO/AI Orchestrator
 *
 * Orquestrador autonomo do CEO/AI sobre o ecossistema. Combina:
 *   - Cron jobs ja existentes (backend/src/domains/cron)
 *   - VectorMemoryStore + RetrieverAdapter (RAG)
 *   - BullMQ queues operacionais
 *   - Validacao editorial (scripts/academia/validate.mjs)
 *
 * Operacoes principais:
 *   1. plan()    -> propoe acoes baseadas em sinais do runtime + memoria
 *   2. decide()  -> aplica heuristicas SHO/Judge e classifica em auto|review|block
 *   3. execute() -> enfileira jobs aprovados nas queues corretas
 *   4. learn()   -> escreve outcomes em VectorMemory para auto-ajuste
 *
 * @module agentic/ceo-ai/orchestrator
 */
import { z } from "zod";

// ----------------------------------------------------------------------------
// Schemas
// ----------------------------------------------------------------------------

export const ceoSignalSchema = z.object({
  signalId: z.string().min(1),
  source: z.enum([
    "runtime-metric",
    "user-feedback",
    "validator-error",
    "judge-block",
    "marketplace-spike",
    "academia-gap",
    "external-agent",
    "manual-input",
  ]),
  severity: z.enum(["info", "warn", "critical"]).default("info"),
  payload: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
});

export type CEOSignal = z.infer<typeof ceoSignalSchema>;

export const ceoActionSchema = z.object({
  actionId: z.string().min(1),
  kind: z.enum([
    "enqueue-job",
    "create-cron",
    "update-cron",
    "publish-content",
    "rotate-credential",
    "notify-operator",
    "spawn-agent",
    "no-op",
  ]),
  target: z.string().min(1),
  payload: z.record(z.unknown()).default({}),
  estimatedRisk: z.number().min(0).max(1).default(0.1),
  estimatedValue: z.number().min(0).max(1).default(0.5),
  rationale: z.string().max(560),
});

export type CEOAction = z.infer<typeof ceoActionSchema>;

export const ceoDecisionSchema = z.object({
  action: ceoActionSchema,
  classification: z.enum(["auto-approved", "needs-review", "blocked"]),
  confidence: z.number().min(0).max(1),
  judgeNotes: z.array(z.string()).default([]),
});

export type CEODecision = z.infer<typeof ceoDecisionSchema>;

// ----------------------------------------------------------------------------
// Roteamento Sinal -> Acao (heuristicas iniciais)
// ----------------------------------------------------------------------------

const SIGNAL_TO_ACTION: Record<
  CEOSignal["source"],
  (signal: CEOSignal) => CEOAction
> = {
  "runtime-metric": (s) => ({
    actionId: `act-${s.signalId}`,
    kind: "notify-operator",
    target: "ops-dashboard",
    payload: { metric: s.payload, severity: s.severity },
    estimatedRisk: 0.1,
    estimatedValue: 0.4,
    rationale: "Sinal de runtime requer visibilidade operacional.",
  }),
  "user-feedback": (s) => ({
    actionId: `act-${s.signalId}`,
    kind: "publish-content",
    target: "academia-suggestion-queue",
    payload: { feedback: s.payload },
    estimatedRisk: 0.05,
    estimatedValue: 0.6,
    rationale: "Feedback do afiliado vira insumo para Academia Viva.",
  }),
  "validator-error": (s) => ({
    actionId: `act-${s.signalId}`,
    kind: "enqueue-job",
    target: "editorial-fix-queue",
    payload: { errors: s.payload },
    estimatedRisk: 0.05,
    estimatedValue: 0.7,
    rationale:
      "Erros do validador editorial sao corrigidos via fila automatica.",
  }),
  "judge-block": (s) => ({
    actionId: `act-${s.signalId}`,
    kind: "notify-operator",
    target: "judge-review",
    payload: s.payload,
    estimatedRisk: 0.4,
    estimatedValue: 0.5,
    rationale: "Bloqueio do Judge exige analise humana ou recalibracao.",
  }),
  "marketplace-spike": (s) => ({
    actionId: `act-${s.signalId}`,
    kind: "spawn-agent",
    target: "marketplace-scaler",
    payload: s.payload,
    estimatedRisk: 0.2,
    estimatedValue: 0.8,
    rationale: "Pico no marketplace -> escalar agente especialista.",
  }),
  "academia-gap": (s) => ({
    actionId: `act-${s.signalId}`,
    kind: "publish-content",
    target: "academia-author-queue",
    payload: s.payload,
    estimatedRisk: 0.05,
    estimatedValue: 0.6,
    rationale: "Lacuna detectada na Academia -> propor nova aula.",
  }),
  "external-agent": (s) => ({
    actionId: `act-${s.signalId}`,
    kind: "enqueue-job",
    target: "a2a-handshake-queue",
    payload: s.payload,
    estimatedRisk: 0.3,
    estimatedValue: 0.7,
    rationale: "Agente externo solicitou interacao via A2A.",
  }),
  "manual-input": (s) => ({
    actionId: `act-${s.signalId}`,
    kind: "no-op",
    target: "manual-review",
    payload: s.payload,
    estimatedRisk: 0.1,
    estimatedValue: 0.5,
    rationale: "Entrada manual aguarda decisao explicita do operador.",
  }),
};

// ----------------------------------------------------------------------------
// CEOPlanner.plan(): converte sinal em acao proposta
// ----------------------------------------------------------------------------

export function plan(signal: CEOSignal): CEOAction {
  const parsed = ceoSignalSchema.parse(signal);
  return SIGNAL_TO_ACTION[parsed.source](parsed);
}

// ----------------------------------------------------------------------------
// CEOPlanner.decide(): aplica SHO sobre a acao
// ----------------------------------------------------------------------------

export interface DecideOptions {
  /** limiar de confianca para autoaprovar */
  confidenceThreshold?: number;
  /** limite de risco aceito automaticamente */
  riskLimit?: number;
  /** se true, forca review independente do score */
  forceReview?: boolean;
}

export function decide(
  action: CEOAction,
  opts: DecideOptions = {},
): CEODecision {
  const confidenceThreshold = opts.confidenceThreshold ?? 0.7;
  const riskLimit = opts.riskLimit ?? 0.3;

  // Score sintetico inicial: valor - risco (clipado em [0,1])
  const confidence = Math.max(
    0,
    Math.min(1, action.estimatedValue - action.estimatedRisk + 0.5),
  );

  let classification: CEODecision["classification"] = "needs-review";
  const judgeNotes: string[] = [];

  if (opts.forceReview) {
    classification = "needs-review";
    judgeNotes.push("Forcado para review por configuracao.");
  } else if (action.estimatedRisk > 0.8) {
    classification = "blocked";
    judgeNotes.push("Risco estimado acima do limite critico.");
  } else if (
    confidence >= confidenceThreshold &&
    action.estimatedRisk <= riskLimit
  ) {
    classification = "auto-approved";
    judgeNotes.push("Confianca alta e risco baixo: aprovado automaticamente.");
  } else if (action.estimatedRisk > riskLimit) {
    classification = "needs-review";
    judgeNotes.push("Risco acima do tolerado para autoaprovacao.");
  } else {
    classification = "needs-review";
    judgeNotes.push("Confianca insuficiente para autoaprovar.");
  }

  return ceoDecisionSchema.parse({
    action,
    classification,
    confidence: Number(confidence.toFixed(3)),
    judgeNotes,
  });
}

// ----------------------------------------------------------------------------
// CEOPlanner.execute(): roteamento para queues / handlers
// ----------------------------------------------------------------------------

export interface ExecutionResult {
  ok: boolean;
  actionId: string;
  kind: CEOAction["kind"];
  target: string;
  executedAt: string;
  ref?: string;
  reason?: string;
}

export type ExecutorAdapters = {
  enqueueJob: (queue: string, payload: unknown) => Promise<string>;
  createCron: (input: Record<string, unknown>) => Promise<string>;
  updateCron: (id: string, patch: Record<string, unknown>) => Promise<void>;
  publishContent: (target: string, content: unknown) => Promise<string>;
  notifyOperator: (channel: string, message: unknown) => Promise<void>;
  spawnAgent: (kind: string, payload: unknown) => Promise<string>;
};

export async function execute(
  decision: CEODecision,
  adapters: ExecutorAdapters,
): Promise<ExecutionResult> {
  const at = new Date().toISOString();
  if (decision.classification !== "auto-approved") {
    return {
      ok: false,
      actionId: decision.action.actionId,
      kind: decision.action.kind,
      target: decision.action.target,
      executedAt: at,
      reason: `not-auto-approved:${decision.classification}`,
    };
  }

  const { action } = decision;
  try {
    switch (action.kind) {
      case "enqueue-job": {
        const ref = await adapters.enqueueJob(action.target, action.payload);
        return {
          ok: true,
          actionId: action.actionId,
          kind: action.kind,
          target: action.target,
          executedAt: at,
          ref,
        };
      }
      case "create-cron": {
        const ref = await adapters.createCron({
          ...action.payload,
          name: action.target,
        });
        return {
          ok: true,
          actionId: action.actionId,
          kind: action.kind,
          target: action.target,
          executedAt: at,
          ref,
        };
      }
      case "update-cron": {
        await adapters.updateCron(action.target, action.payload);
        return {
          ok: true,
          actionId: action.actionId,
          kind: action.kind,
          target: action.target,
          executedAt: at,
        };
      }
      case "publish-content": {
        const ref = await adapters.publishContent(action.target, action.payload);
        return {
          ok: true,
          actionId: action.actionId,
          kind: action.kind,
          target: action.target,
          executedAt: at,
          ref,
        };
      }
      case "notify-operator": {
        await adapters.notifyOperator(action.target, action.payload);
        return {
          ok: true,
          actionId: action.actionId,
          kind: action.kind,
          target: action.target,
          executedAt: at,
        };
      }
      case "spawn-agent": {
        const ref = await adapters.spawnAgent(action.target, action.payload);
        return {
          ok: true,
          actionId: action.actionId,
          kind: action.kind,
          target: action.target,
          executedAt: at,
          ref,
        };
      }
      case "rotate-credential":
      case "no-op":
      default:
        return {
          ok: false,
          actionId: action.actionId,
          kind: action.kind,
          target: action.target,
          executedAt: at,
          reason: "kind-not-executable-automatically",
        };
    }
  } catch (err: any) {
    return {
      ok: false,
      actionId: action.actionId,
      kind: action.kind,
      target: action.target,
      executedAt: at,
      reason: `executor-error:${err?.message ?? "unknown"}`,
    };
  }
}

// ----------------------------------------------------------------------------
// learn(): persiste outcome em vector memory para RAG futuro
// ----------------------------------------------------------------------------

export interface LearnInput {
  signal: CEOSignal;
  decision: CEODecision;
  result: ExecutionResult;
}

export interface MemoryAdapter {
  remember: (entry: {
    sessionId: string;
    memoryType: "episodic" | "semantic";
    content: string;
    tags?: string[];
    importance?: number;
  }) => unknown;
  search?: (query: string, k?: number) => Promise<unknown>;
}

export function learn(input: LearnInput, memory: MemoryAdapter): void {
  const content = JSON.stringify({
    signal: input.signal,
    action: input.decision.action,
    classification: input.decision.classification,
    confidence: input.decision.confidence,
    result: input.result,
  });
  memory.remember({
    sessionId: `ceo-ai:${input.signal.source}`,
    memoryType: "episodic",
    content,
    tags: [
      "ceo-ai",
      input.signal.source,
      input.decision.classification,
      input.result.ok ? "success" : "failure",
    ],
    importance: input.result.ok ? 0.7 : 0.9,
  });
}

// ----------------------------------------------------------------------------
// API publica do orquestrador
// ----------------------------------------------------------------------------

export class CEOOrchestrator {
  constructor(
    private adapters: ExecutorAdapters,
    private memory: MemoryAdapter,
    private opts: DecideOptions = {},
  ) {}

  async handle(signal: CEOSignal): Promise<ExecutionResult> {
    const action = plan(signal);
    const decision = decide(action, this.opts);
    const result = await execute(decision, this.adapters);
    learn({ signal, decision, result }, this.memory);
    return result;
  }
}
