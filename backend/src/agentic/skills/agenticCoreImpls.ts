/**
 * agenticCoreImpls — Implementações concretas dos abstratos do agenticCore.
 *
 * Fornece adapters in-memory (sufficientes para Pack A² operacional) para:
 *   - MemoryManager  (short-term / long-term)
 *   - MetricsTracker (in-memory + opcional DB)
 *   - Planner        (gera PlanStep[] simples a partir de templates)
 *   - Reflector      (no-op observador)
 *
 * Estes adapters resolvem o "Cannot read properties of undefined (reading 'createPlan')"
 * sem demandar LLM externo, mantendo o sistema 100% operacional.
 *
 * Quando o time quiser plug-in real (Claude/GPT), basta substituir o Planner
 * por uma implementação que chama a API LLM.
 */
import crypto from "node:crypto";
import type {
  MemoryManager,
  MemoryEntry,
  MetricsTracker,
  MetricEntry,
  Planner,
  PlanStep,
  Reflector,
  ReflectionEntry,
  ReasoningStep,
} from "./agenticCore";

// -----------------------------------------------------------------------------
// Memory in-memory (TTL 30 minutos para short-term)
// -----------------------------------------------------------------------------
const memoryStore: MemoryEntry[] = [];

export const inMemoryMemoryManager: MemoryManager = {
  async retrieve(query: string, limit = 10) {
    const q = query.toLowerCase();
    return memoryStore
      .filter((e) => e.content.toLowerCase().includes(q))
      .slice(-limit);
  },
  async store(entry: MemoryEntry) {
    memoryStore.push(entry);
    // GC short-term após 30 min
    if (entry.type === "short-term") {
      const cutoff = Date.now() - 30 * 60 * 1000;
      while (memoryStore.length && memoryStore[0].timestamp.getTime() < cutoff) {
        memoryStore.shift();
      }
    }
    // limite global ~10k
    if (memoryStore.length > 10000) memoryStore.shift();
  },
  async update(/* id, updates */) {
    // simplificado: noop (entries são imutáveis nesta impl)
  },
};

// -----------------------------------------------------------------------------
// Metrics in-memory (com rotação 1h)
// -----------------------------------------------------------------------------
const metricsStore: MetricEntry[] = [];

export const inMemoryMetricsTracker: MetricsTracker = {
  async record(entry: MetricEntry) {
    metricsStore.push(entry);
    const cutoff = Date.now() - 60 * 60 * 1000;
    while (metricsStore.length && metricsStore[0].timestamp.getTime() < cutoff) {
      metricsStore.shift();
    }
  },
} as any;

// -----------------------------------------------------------------------------
// Planner simples (template-based, sem LLM)
// -----------------------------------------------------------------------------
export const templatePlanner: Planner = {
  async createPlan(goal: string, _context: any): Promise<PlanStep[]> {
    const planId = crypto.randomBytes(4).toString("hex");
    const lower = (goal || "").toLowerCase();

    // Templates baseados em keywords do goal
    const baseSteps = (steps: string[]): PlanStep[] =>
      steps.map((desc, i) => ({
        id: `${planId}-step-${i + 1}`,
        description: desc,
        status: "pending" as const,
      }));

    if (lower.includes("prospect") || lower.includes("outbound") || lower.includes("lead")) {
      return baseSteps([
        "Coletar lista de leads do segmento alvo",
        "Enriquecer dados (LinkedIn / email / empresa)",
        "Pontuar leads (audienceFit × engagement × buyingPower)",
        "Selecionar canal preferencial por lead",
        "Gerar mensagens personalizadas",
        "Agendar envio respeitando opt-in e LGPD",
      ]);
    }

    if (lower.includes("copy") || lower.includes("conteúdo") || lower.includes("conteudo")) {
      return baseSteps([
        "Analisar audiência e dor do público",
        "Definir headline + hook principal",
        "Estruturar corpo (problema → solução → prova → CTA)",
        "Gerar 3 variações para A/B",
        "Validar tom (consistência com marca)",
      ]);
    }

    if (lower.includes("publish") || lower.includes("publica")) {
      return baseSteps([
        "Validar drafts (compliance + qualidade)",
        "Distribuir por canais configurados",
        "Agendar horários de pico por canal",
        "Aplicar utm_source/medium/campaign",
        "Monitorar status de publicação",
      ]);
    }

    if (lower.includes("trend") || lower.includes("tendênc") || lower.includes("tendenc")) {
      return baseSteps([
        "Coletar sinais (Hotmart / Shopee / ML / search)",
        "Normalizar scores (growth × volume × margin × fit)",
        "Rankear tendências por janela temporal",
        "Sugerir 3 melhores nichos para focar",
      ]);
    }

    if (lower.includes("enrich")) {
      return baseSteps([
        "Buscar dados do lead em bases públicas",
        "Validar email (deliverability)",
        "Estimar intenção de compra (heurística)",
        "Marcar risco de spam / opt-in",
      ]);
    }

    // Fallback genérico
    return baseSteps([
      "Analisar objetivo recebido",
      "Identificar recursos necessários",
      "Executar ação principal",
      "Validar resultado",
      "Registrar telemetria",
    ]);
  },
  async updatePlan() {
    // noop — planos são imutáveis nesta impl simples
  },
  async getPlan() {
    return [];
  },
};

// -----------------------------------------------------------------------------
// Reflector no-op (observa, não age)
// -----------------------------------------------------------------------------
export const noopReflector: Reflector = {
  async reflect(_context: any, recentActions: ReasoningStep[]): Promise<ReflectionEntry> {
    return {
      timestamp: new Date(),
      observation: `Observados ${recentActions.length} passos recentes`,
      analysis: "Análise pendente (reflector no-op ativo)",
      insights: [],
      actionableImprovements: [],
    };
  },
};

// -----------------------------------------------------------------------------
// Bundle pronto para ser injetado em SkillExecutionContext
// -----------------------------------------------------------------------------
export function buildAgenticContextDefaults() {
  return {
    memory: inMemoryMemoryManager,
    metrics: inMemoryMetricsTracker,
    planner: templatePlanner,
    reflector: noopReflector,
  };
}
