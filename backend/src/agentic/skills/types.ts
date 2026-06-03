/**
 * Tipos compartilhados pelos handlers operacionais das Skills do agente.
 * -----------------------------------------------------------------------------
 * Cada handler implementa o contrato SkillHandler. O dispatcher
 * `executeSkill` é responsável por:
 *  - validar entitlement (skill ativa no agente do usuário);
 *  - registrar auditoria (audit trail);
 *  - aplicar policies (auto vs. requer aprovação humana);
 *  - rotear para o handler correto.
 */
import { MemoryManager, Planner, Reflector, MetricsTracker, ReasoningEngine, AgentTool } from "./agenticCore";

export type SkillSlug =
  | "copywriter-persuasivo"
  | "prospeccao-outbound"
  | "detector-tendencias"
  | "auto-publisher"
  | "follow-up-strategist"
  | "judge-revisor"
  | "analytics-reporter"
  | "audience-segmenter"
  | "funnel-architect"
  | "lead-enricher"
  | "objection-handler"
  | "pricing-optimizer"
  | "ab-test-designer"
  | "commission-calculator"
  | "content-translator"
  | "creator-matcher"
  | "lifecycle-orchestrator"
  | "webhook-router"
  | "fraud-detector"
  | "compliance-auditor"
  | "roi-attributor"
  | "cold-emailer"
  | "upsell-strategist"
  // Planned skills (Roadmap)
  | "social-seller"
  | "webinar-engine"
  | "referral-engineer"
  | "cross-sell-engine"
  | "cart-recovery"
  | "loyalty-architect"
  | "video-script-writer"
  | "image-prompt-engineer"
  | "seo-strategist"
  | "viral-hook-generator"
  | "landing-page-builder"
  | "email-sequence-designer"
  | "kpi-monitor"
  | "anomaly-detector"
  | "incident-responder"
  | "contract-analyzer"
  | "tax-advisor-br"
  | "cohort-analyzer"
  | "churn-predictor"
  | "ltv-forecaster"
  | "competitor-watcher"
  | "market-sentiment-tracker";

export interface SkillExecutionContext {
  agentId: number;
  userId: number;
  agentName: string;
  /** Performance score atual do agente (0-100). */
  performanceScore: number;
  /** Indica se a execução pode ocorrer de forma totalmente autônoma. */
  autonomyAllowed: boolean;
  /** Hint de canal alvo (instagram, whatsapp, facebook, email, ...) */
  channelHint?: string;
  // Agentic Capabilities
  memory: MemoryManager;
  planner: Planner;
  reflector: Reflector;
  metrics: MetricsTracker;
  reasoner: ReasoningEngine;
  tools: Record<string, AgentTool>;
}

export interface SkillExecutionResult<TOutput = unknown> {
  /** Identificador único da execução (para correlação em logs/auditoria). */
  executionId: string;
  /** Skill executada. */
  skill: SkillSlug;
  /** True quando concluída sem erro lógico. */
  success: boolean;
  /** Decisão da policy: autônoma ou requer revisão humana. */
  decision: "auto" | "needs_review";
  /** Latência total em milissegundos. */
  latencyMs: number;
  /** Conteúdo/output do handler (estrutura específica por skill). */
  output: TOutput;
  /** Mensagem opcional para exibição ao operador. */
  message?: string;
  /** Avisos/observações relevantes para auditoria. */
  warnings?: string[];
}

export interface SkillHandler<TInput = unknown, TOutput = unknown> {
  slug: SkillSlug;
  title: string;
  /** Categoria operacional (publishing, prospecting, decision, content...) */
  category: string;
  /** Versão semântica do handler. */
  version: string;
  /** Indica se pode rodar autonomamente quando a policy permite. */
  supportsAutonomous: boolean;
  /** Validação/normalização do input específico. */
  parseInput: (raw: unknown) => TInput;
  /** Execução do handler. Não deve lançar para erros de domínio; usar success=false. */
  execute: (
    input: TInput,
    context: SkillExecutionContext,
    reasoning?: ReasoningEngine,
    memory?: MemoryManager,
    planner?: Planner,
    reflector?: Reflector,
    metrics?: MetricsTracker,
    tools?: Record<string, AgentTool>,
  ) => Promise<SkillExecutionResult<TOutput>>;
}
