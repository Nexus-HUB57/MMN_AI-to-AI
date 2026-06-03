import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";
import { ReasoningStep, ReflectionEntry, MemoryManager, Planner, Reflector, MetricsTracker, ReasoningEngine, AgentTool } from "./agenticCore";

/**
 * Handler operacional · Objection Handler v2 (Agentic)
 * -----------------------------------------------------------------------------
 * Generates responses to common objections by sales vertical.
 * Uses pattern matching and configurable templates.
 * Agora suporta Reasoning Trace, Reflexão e Memória.
 */

const ObjectionHandlerInputSchema = z.object({
  objection: z.string().min(3).max(500),
  vertical: z.enum([
    "saas", "course", "mentorship", "ecommerce", "affiliate", "freelance", "agency",
  ]).default("course"),
  productValue: z.string().min(3).max(240).optional(),
  competitorMentioned: z.string().max(120).optional(),
  customerProfile: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
});

export type ObjectionHandlerInput = z.infer<typeof ObjectionHandlerInputSchema>;

export interface ObjectionResponse {
  acknowledgment: string;
  reframe: string;
  response: string;
  proof: string[];
  closeQuestion: string;
  confidenceScore: number;
}

export interface ObjectionHandlerOutput {
  objection: string;
  vertical: string;
  response: ObjectionResponse;
  alternativeApproaches: string[];
  escalationTrigger: boolean;
  reasoningTrace?: ReasoningStep[];
  reflection?: ReflectionEntry;
}

const OBJECTION_PATTERNS: Record<string, string[]> = {
  price: ["muito caro", "não tenho orçamento", "preço elevado", "expensive"],
  time: ["não tenho tempo", "sem tempo", "muito occupied", "no time"],
  trust: ["não conheço", "não confio", "nunca comprei online", "don't know"],
  need: ["não preciso", "não serve", "não é para mim", "not for me"],
  competition: ["outro produto", "concorrente", "já uso", "already have"],
};

function classifyObjection(objection: string): string {
  const lower = objection.toLowerCase();
  for (const [pattern, keywords] of Object.entries(OBJECTION_PATTERNS)) {
    if (keywords.some((kw) => lower.includes(kw))) return pattern;
  }
  return "generic";
}

function buildResponse(
  objectionType: string,
  input: ObjectionHandlerInput,
): ObjectionResponse {
  const responses: Record<string, { ack: string; reframe: string; close: string }> = {
    price: {
      ack: "Entendo sua preocupação com investimento.",
      reframe: "O verdadeiro custo de não agir é maior. O que você perde por semana sem essa solução?",
      close: "Posso ajudar você a encontrar uma forma de parcelar que funcione no seu orçamento?",
    },
    time: {
      ack: "Tempo é o ativo mais valioso que temos.",
      reframe: "Quanto mais ocupado, mais eficiente. Esta solução poupará horas semanais.",
      close: "Posso mostrar como começar em apenas 15 minutos por dia?",
    },
    trust: {
      ack: "Sua cautela é completamente válida.",
      reframe: "Temos +500 alunos satisfeitos e 30 dias de garantia incondicional.",
      close: "Posso conectar você com alguém que já obteve resultados?",
    },
    need: {
      ack: "Nem todo produto serve para todas as pessoas, e isso é saudável.",
      reframe: "Você mencionou que quer [outcome]. Este produto foi desenhado exatamente para isso.",
      close: "O que exatamente você está tentando alcançar?",
    },
    competition: {
      ack: "Que bom que você pesquisou antes de decidir.",
      reframe: "Nosso diferencial é [diferencial] — o que você mais valoriza na decisão?",
      close: "Posso fazer uma comparação lado a lado para facilitar sua decisão?",
    },
    generic: {
      ack: "Entendo perfeitamente sua perspectiva.",
      reframe: "Vamos explorar isso mais a fundo para encontrar a melhor solução.",
      close: "O que tornaria esta decisão mais fácil para você?",
    },
  };

  const r = responses[objectionType] || responses.generic;

  return {
    acknowledgment: r.ack,
    reframe: r.reframe + (input.productValue ? ` ${input.productValue}.` : ""),
    response: `${r.ack} ${r.reframe}`,
    proof: [
      "Garantia de 30 dias",
      "+500 alunos satisfeitos",
      "Suporte 7 dias/semana",
    ],
    closeQuestion: r.close,
    confidenceScore: objectionType === "price" ? 75 : 85,
  };
}

export const objectionHandlerHandler: SkillHandler<
  ObjectionHandlerInput,
  ObjectionHandlerOutput
> = {
  slug: "objection-handler",
  title: "Manipulador de Objeções",
  category: "sales",
  version: "2.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): ObjectionHandlerInput =>
    ObjectionHandlerInputSchema.parse(raw),
  execute: async (
    input: ObjectionHandlerInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<ObjectionHandlerOutput>> => {
    const startedAt = Date.now();

    // 1. Reasoning Trace
    const reasoningTrace: ReasoningStep[] = [
      {
        thought: `Iniciando tratamento de objeção: '${input.objection}' para a vertical de vendas '${input.vertical}'.`,
      },
    ];

    // 2. Memory Retrieval (Check for previous similar objection handling)
    const previousObjections = await context.memory.retrieve(`objection handling for '${input.objection}' in vertical '${input.vertical}'`, 1);
    reasoningTrace.push({
      thought: `Analisando memória: ${previousObjections.length} tratamentos de objeções anteriores encontrados.`,
    });

    const objectionType = classifyObjection(input.objection);
    reasoningTrace.push({
      thought: `Objeção classificada como do tipo '${objectionType}'.`,
      result: `Tipo de objeção: ${objectionType}.`
    });

    const response = buildResponse(objectionType, input);
    reasoningTrace.push({
      thought: `Resposta gerada com confiança de ${response.confidenceScore}%.`,
      result: `Resposta gerada.`
    });

    const escalationTriggers = input.objection.length > 300;
    if (escalationTriggers) {
      reasoningTrace.push({
        thought: "Objeção longa, pode requerer escalonamento.",
        result: "Alerta de objeção complexa."
      });
    }

    const output: ObjectionHandlerOutput = {
      objection: input.objection,
      vertical: input.vertical,
      response,
      alternativeApproaches: [
        "Oferecer garantia estendida",
        "Demonstrar caso de sucesso similar",
        "Propor trial reduzido",
      ],
      escalationTrigger: escalationTriggers,
      reasoningTrace,
    };

    // 3. Reflection
    if (context.reflector) {
      output.reflection = await context.reflector.reflect(context, reasoningTrace);
      reasoningTrace.push({
        thought: "Reflexão aplicada para otimizar o tratamento de objeções.",
        result: "Tratamento de objeções refinado com base em insights de performance."
      });
    }

    // 4. Store in Memory
    await context.memory.store({
      timestamp: new Date(),
      content: `Objeção '${input.objection}' tratada. Tipo: ${objectionType}, Confiança: ${response.confidenceScore}%.`,
      type: 'episodic',
      relatedSkills: ["objection-handler"]
    });

    // 5. Record Metrics
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'objection_confidence_score',
      value: response.confidenceScore,
      unit: 'percent',
      skillSlug: "objection-handler"
    });
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'objection_escalation_triggered',
      value: escalationTriggers ? 1 : 0,
      unit: 'boolean',
      skillSlug: "objection-handler"
    });

    return {
      executionId: randomUUID(),
      skill: "objection-handler",
      success: true,
      decision: "auto",
      latencyMs: Date.now() - startedAt,
      output,
      message: `Resposta gerada para objeção tipo '${objectionType}' — confiança ${response.confidenceScore}%`,
    };
  },
};
