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
export type SkillSlug =
  | "copywriter-persuasivo"
  | "prospeccao-outbound"
  | "detector-tendencias"
  | "auto-publisher"
  | "follow-up-strategist"
  | "judge-revisor"
  | "analytics-reporter"
  | "audience-segmenter";

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
  ) => Promise<SkillExecutionResult<TOutput>>;
}
