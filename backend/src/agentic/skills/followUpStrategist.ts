import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";
import { ReasoningStep, ReflectionEntry, MemoryManager, Planner, Reflector, MetricsTracker, ReasoningEngine, AgentTool } from "./agenticCore";

/**
 * Handler operacional · Follow-Up Strategist v2 (Agentic)
 * -----------------------------------------------------------------------------
 * Fecha o ciclo pós-venda / pós-toque. Recebe contatos com seu último estado
 * (lead morno, lead que abriu mas não clicou, cliente que comprou, prospect
 * que recusou) e gera estratégias de follow-up personalizadas, agrupadas
 * em uma timeline executável.
 *
 * Para cada contato:
 *  - Determina a fase do funil (cooling, warming, retention, win-back)
 *  - Calcula prioridade 0-100 considerando recência e valor
 *  - Gera plano de 3 toques com intervalos adaptativos por fase
 *  - Define canal recomendado e tom da mensagem
 *  - Sinaliza risco de churn quando aplicável
 *
 * Esta skill completa o ecossistema operacional: depois que o
 * prospeccao-outbound abre, o copywriter persuade, o publisher distribui,
 * o judge revisa — o follow-up garante que ninguém se perca.
 * Agora suporta Reasoning Trace, Reflexão e Memória.
 */

const ContactStateSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  name: z.string().min(2).max(120),
  lastInteraction: z.string().datetime().optional(),
  lastOutcome: z.enum([
    "no_response",
    "opened",
    "clicked",
    "replied",
    "purchased",
    "refused",
    "churned",
  ]),
  ticketValue: z.number().min(0).max(1_000_000).default(0),
  preferredChannel: z
    .enum(["whatsapp", "email", "instagram", "phone", "sms"])
    .default("whatsapp"),
  lifecycleStage: z
    .enum(["lead", "opportunity", "customer", "former_customer"])
    .default("lead"),
});

const FollowUpInputSchema = z.object({
  contacts: z.array(ContactStateSchema).min(1).max(60),
  productName: z.string().min(2).max(160),
  productBenefit: z.string().min(2).max(240),
  brand: z.string().min(2).max(80).default("Nexus Affil\"IA\"te"),
  /** Janela em dias para considerar interações "recentes". */
  recencyDays: z.number().int().min(1).max(180).default(30),
});

export type FollowUpInput = z.infer<typeof FollowUpInputSchema>;
type ContactState = z.infer<typeof ContactStateSchema>;

type FunnelPhase = "cooling" | "warming" | "retention" | "win_back";

export interface FollowUpPlan {
  contactId: string;
  name: string;
  phase: FunnelPhase;
  priority: number;
  churnRisk: "low" | "medium" | "high";
  channel: ContactState["preferredChannel"];
  tone: "consultivo" | "celebratorio" | "diagnostico" | "reativacao";
  touches: Array<{
    step: 1 | 2 | 3;
    sendAtIso: string;
    headline: string;
    body: string;
  }>;
  reasoning: string[];
}

export interface FollowUpOutput {
  totalContacts: number;
  byPhase: Record<FunnelPhase, number>;
  highPriorityCount: number;
  plans: FollowUpPlan[];
  alerts: string[];
  reasoningTrace?: ReasoningStep[];
  reflection?: ReflectionEntry;
}

const PHASE_BY_OUTCOME: Record<ContactState["lastOutcome"], FunnelPhase> = {
  no_response: "warming",
  opened: "warming",
  clicked: "warming",
  replied: "warming",
  purchased: "retention",
  refused: "cooling",
  churned: "win_back",
};

const TONE_BY_PHASE: Record<FunnelPhase, FollowUpPlan["tone"]> = {
  cooling: "diagnostico",
  warming: "consultivo",
  retention: "celebratorio",
  win_back: "reativacao",
};

const INTERVAL_DAYS_BY_PHASE: Record<FunnelPhase, [number, number, number]> = {
  cooling: [3, 10, 21],
  warming: [1, 4, 9],
  retention: [7, 21, 45],
  win_back: [2, 7, 14],
};

function daysSince(iso: string | undefined): number {
  if (!iso) return 365;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function priorityFor(contact: ContactState, recencyDays: number): number {
  const recencyDecay = Math.max(
    0,
    Math.min(100, 100 - (daysSince(contact.lastInteraction) / recencyDays) * 100),
  );
  const valueScore = Math.min(100, Math.log10(contact.ticketValue + 1) * 25);
  const stageBoost = {
    lead: 60,
    opportunity: 80,
    customer: 90,
    former_customer: 70,
  }[contact.lifecycleStage];
  return Math.round(recencyDecay * 0.4 + valueScore * 0.35 + stageBoost * 0.25);
}

function churnRiskFor(contact: ContactState): FollowUpPlan["churnRisk"] {
  if (contact.lastOutcome === "churned") return "high";
  if (contact.lastOutcome === "refused") return "medium";
  if (
    contact.lifecycleStage === "customer" &&
    daysSince(contact.lastInteraction) > 60
  ) {
    return "medium";
  }
  return "low";
}

function buildTouch(
  step: 1 | 2 | 3,
  plan: Omit<FollowUpPlan, "touches" | "reasoning">,
  input: FollowUpInput,
): FollowUpPlan["touches"][number] {
  const dayOffset = INTERVAL_DAYS_BY_PHASE[plan.phase][step - 1];
  const sendAt = new Date();
  sendAt.setUTCDate(sendAt.getUTCDate() + dayOffset);

  const firstName = plan.name.split(" ")[0] || "Olá";
  const headlineByPhase: Record<FunnelPhase, [string, string, string]> = {
    cooling: [
      `${firstName}, posso fazer uma pergunta direta?`,
      `${firstName}, repensei nossa última conversa`,
      `${firstName}, último toque antes de encerrar`,
    ],
    warming: [
      `${firstName}, complemento rápido`,
      `${firstName}, exemplo concreto`,
      `${firstName}, decisão por hoje`,
    ],
    retention: [
      `${firstName}, parabéns pela jornada`,
      `${firstName}, próximo nível disponível`,
      `${firstName}, benefício exclusivo`,
    ],
    win_back: [
      `${firstName}, sentimos sua falta`,
      `${firstName}, atualizações que mudam o jogo`,
      `${firstName}, oferta especial de retorno`,
    ],
  };
  const bodyByPhase: Record<FunnelPhase, [string, string, string]> = {
    cooling: [
      `Sem rodeios: ${input.productName} faz sentido para o seu momento atual? Se sim, eu sigo; se não, encerro a sequência.`,
      `Revisei nossa conversa anterior e identifiquei um ângulo diferente que pode ajudar: ${input.productBenefit}.`,
      `Vou encerrar essa linha por aqui. Se quiser retomar no futuro, é só responder esta mensagem.`,
    ],
    warming: [
      `Te envio o caso concreto que prometi: ${input.productBenefit} aplicado ao seu cenário.`,
      `Exemplo real do que ${input.productName} entrega em 30 dias: ${input.productBenefit}.`,
      `Se ${input.productName} fizer sentido, eu libero o acesso ainda hoje. Se não, sem problema.`,
    ],
    retention: [
      `Parabéns pelo uso de ${input.productName}. Tem um próximo passo que potencializa o que você já está fazendo.`,
      `${input.brand} liberou uma evolução de ${input.productName}: ${input.productBenefit}.`,
      `Como cliente ativo, você ganha prioridade para o próximo benefício exclusivo.`,
    ],
    win_back: [
      `Faz tempo que não nos falamos. ${input.brand} evoluiu bastante — vale uma revisita rápida?`,
      `Algumas mudanças importantes em ${input.productName} que resolvem o que estava limitando antes.`,
      `Te ofereço uma condição especial de retorno se ${input.productName} fizer sentido agora.`,
    ],
  };

  return {
    step,
    sendAtIso: sendAt.toISOString(),
    headline: headlineByPhase[plan.phase][step - 1],
    body: bodyByPhase[plan.phase][step - 1],
  };
}

export const followUpStrategistHandler: SkillHandler<FollowUpInput, FollowUpOutput> = {
  slug: "follow-up-strategist",
  title: "Follow-Up Strategist",
  category: "retention",
  version: "2.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): FollowUpInput => FollowUpInputSchema.parse(raw),
  execute: async (
    input: FollowUpInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<FollowUpOutput>> => {
    const startedAt = Date.now();

    // 1. Reasoning Trace
    const reasoningTrace: ReasoningStep[] = [
      {
        thought: `Iniciando estratégia de follow-up para ${input.contacts.length} contatos.`,
      },
    ];

    // 2. Memory Retrieval (Check for previous similar follow-up strategies)
    const previousStrategies = await context.memory.retrieve(`follow-up strategy for ${input.productName}`, 1);
    reasoningTrace.push({
      thought: `Analisando memória: ${previousStrategies.length} estratégias anteriores encontradas.`,
    });

    const plans: FollowUpPlan[] = input.contacts.map((contact) => {
      const phase = PHASE_BY_OUTCOME[contact.lastOutcome];
      const priority = priorityFor(contact, input.recencyDays);
      const churnRisk = churnRiskFor(contact);
      const reasoning: string[] = [
        `Outcome=${contact.lastOutcome} → fase ${phase}.`,
        `Estágio=${contact.lifecycleStage}, ticket=${contact.ticketValue}.`,
      ];
      if (churnRisk === "high") reasoning.push("Risco alto de churn — acionar urgência.");
      if (priority >= 80) reasoning.push("Alta prioridade — colocar no topo da fila.");

      const base: Omit<FollowUpPlan, "touches" | "reasoning"> = {
        contactId: contact.id ?? randomUUID(),
        name: contact.name,
        phase,
        priority,
        churnRisk,
        channel: contact.preferredChannel,
        tone: TONE_BY_PHASE[phase],
      };

      return {
        ...base,
        reasoning,
        touches: [1, 2, 3].map((step) =>
          buildTouch(step as 1 | 2 | 3, base, input),
        ),
      } satisfies FollowUpPlan;
    });

    plans.sort((a, b) => b.priority - a.priority);

    const byPhase: Record<FunnelPhase, number> = {
      cooling: 0,
      warming: 0,
      retention: 0,
      win_back: 0,
    };
    for (const plan of plans) {
      byPhase[plan.phase] += 1;
    }
    const highPriorityCount = plans.filter((plan) => plan.priority >= 80).length;
    const highChurnCount = plans.filter((plan) => plan.churnRisk === "high").length;

    const alerts: string[] = [];
    if (highChurnCount > 0) {
      alerts.push(`${highChurnCount} contato(s) com risco alto de churn detectados.`);
    }
    if (byPhase.win_back > plans.length / 2) {
      alerts.push("Mais da metade da base está em win-back — sinal de retenção fraca.");
    }
    if (plans.length === 0) {
      alerts.push("Nenhum contato processado.");
    }

    const output: FollowUpOutput = {
      totalContacts: plans.length,
      byPhase,
      highPriorityCount,
      plans,
      alerts,
      reasoningTrace,
    };

    // 3. Reflection
    if (context.reflector) {
      output.reflection = await context.reflector.reflect(context, reasoningTrace);
      reasoningTrace.push({
        thought: "Reflexão aplicada para otimizar a estratégia de follow-up.",
        result: "Estratégia de follow-up refinada com base em insights de performance."
      });
    }

    // 4. Store in Memory
    await context.memory.store({
      timestamp: new Date(),
      content: `Estratégia de follow-up gerada para ${output.totalContacts} contatos. ${output.highPriorityCount} com alta prioridade.`, 
      type: 'episodic',
      relatedSkills: ["follow-up-strategist"]
    });

    // 5. Record Metrics
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'total_follow_up_contacts',
      value: output.totalContacts,
      unit: 'count',
      skillSlug: "follow-up-strategist"
    });
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'high_priority_contacts',
      value: output.highPriorityCount,
      unit: 'count',
      skillSlug: "follow-up-strategist"
    });

    const decision: SkillExecutionResult["decision"] =
      !context.autonomyAllowed || highChurnCount > 0 ? "needs_review" : "auto";

    return {
      executionId: randomUUID(),
      skill: "follow-up-strategist",
      success: plans.length > 0,
      decision,
      latencyMs: Date.now() - startedAt,
      output,
      warnings: alerts,
      message:
        decision === "auto"
          ? `Follow-up planejado: ${plans.length} contatos, ${highPriorityCount} alta prioridade.`
          : `Follow-up gerado com alerta(s) de retenção — revisar antes de disparar.`,
    };
  },
};
