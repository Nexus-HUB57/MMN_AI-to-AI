/**
 * Handler operacional · Objection Handler
 * -----------------------------------------------------------------------------
 * Generates responses to common objections by sales vertical.
 * Uses pattern matching and configurable templates.
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";

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
      reframe: "越忙的人，效率越高. Esta solução poupará horas semanais.",
      close: "Posso mostrar como começar em apenas 15 minutos por dia?",
    },
    trust: {
      ack: "Sua cautela é completamente válida.",
      reframe: "Temos +500 alunos satisfeitos e 30 dias de garantia incondicional.",
      close: "Posso conectar você com alguém que já取得了 resultados？",
    },
    need: {
      ack: "Nem todo produto serve para todas as pessoas, e isso é saudável.",
      reframe: "Você mencionou que quer [outcome]. Este produto foi desenhado examente para isso.",
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
    confidenceScore: ObjectionType === "price" ? 75 : 85,
  };
}

export const objectionHandlerHandler: SkillHandler<
  ObjectionHandlerInput,
  ObjectionHandlerOutput
> = {
  slug: "objection-handler",
  title: "Manipulador de Objeções",
  category: "sales",
  version: "1.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): ObjectionHandlerInput =>
    ObjectionHandlerInputSchema.parse(raw),
  execute: async (
    input: ObjectionHandlerInput,
    _context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<ObjectionHandlerOutput>> => {
    const startedAt = Date.now();
    const objectionType = classifyObjection(input.objection);
    const response = buildResponse(objectionType, input);

    const escalationTriggers = input.objection.length > 300;

    return {
      executionId: randomUUID(),
      skill: "objection-handler",
      success: true,
      decision: "auto",
      latencyMs: Date.now() - startedAt,
      output: {
        objection: input.objection,
        vertical: input.vertical,
        response,
        alternativeApproaches: [
          "Oferecer garantia estendida",
          "Demonstrar caso de sucesso similar",
          "Propor trial reduzido",
        ],
        escalationTrigger: escalationTriggers,
      },
      message: `Resposta gerada para objeção tipo '${objectionType}' — confianca ${response.confidenceScore}%`,
    };
  },
};
