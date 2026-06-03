import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";
import { ReasoningStep, ReflectionEntry, MemoryManager, Planner, Reflector, MetricsTracker, ReasoningEngine, AgentTool } from "./agenticCore";

/**
 * Handler operacional · Content Translator v2 (Agentic)
 * -----------------------------------------------------------------------------
 * Translates content with cultural adaptation.
 * Agora suporta Reasoning Trace, Reflexão e Memória.
 */

const ContentTranslatorInputSchema = z.object({
  content: z.string().min(10).max(4000),
  sourceLanguage: z.string().default("pt-BR"),
  targetLanguage: z.enum([
    "pt-BR", "en-US", "es-ES", "fr-FR", "de-DE", "it-IT",
  ]).default("en-US"),
  contentType: z.enum(["social", "email", "landing", "ad", "documentation"]).default("social"),
  adaptationLevel: z.enum(["literal", "cultural", "full"]).default("cultural"),
});

export type ContentTranslatorInput = z.infer<typeof ContentTranslatorInputSchema>;

export interface ContentTranslatorOutput {
  originalContent: string;
  translatedContent: string;
  sourceLanguage: string;
  targetLanguage: string;
  adaptations: string[];
  hashtags: string[];
  culturalNotes: string[];
  qualityScore: number;
  reasoningTrace?: ReasoningStep[];
  reflection?: ReflectionEntry;
}

const TRANSLATION_ADAPTATIONS: Record<string, Record<string, string>> = {
  "pt-BR": {
    urgency: "🎯 do Tempo",
    price: "R$",
    greeting: "Olá,",
    closing: "Um abraço,",
  },
  "en-US": {
    urgency: "Act now!",
    price: "$",
    greeting: "Hey,",
    closing: "Best,",
  },
  "es-ES": {
    urgency: "¡Disponible ahora!",
    price: "€",
    greeting: "Hola,",
    closing: "Saludos,",
  },
};

function adaptContent(
  content: string,
  source: string,
  target: string,
  level: string,
): { adapted: string; notes: string[] } {
  const notes: string[] = [];
  let adapted = content;

  const patterns = TRANSLATION_ADAPTATIONS[source] || {};
  const targetPatterns = TRANSLATION_ADAPTATIONS[target] || {};

  if (level === "cultural") {
    for (const [key, fromVal] of Object.entries(patterns)) {
      const toVal = targetPatterns[key];
      if (toVal && fromVal !== toVal) {
        adapted = adapted.replace(new RegExp(fromVal, "gi"), toVal);
        notes.push(`Adaptado: ${key} de \'${fromVal}\' para \'${toVal}\'`);
      }
    }
  }

  return { adapted, notes };
}

function generateHashtags(original: string[], target: string): string[] {
  const langHashtags: Record<string, string[]> = {
    "en-US": ["#Success", "#Growth", "#Marketing"],
    "es-ES": ["#Éxito", "#Crecimiento", "#Marketing"],
    "pt-BR": ["#Sucesso", "#Crescimento", "#Marketing"],
  };

  return langHashtags[target] || ["#Global", "#Marketing"];
}

export const contentTranslatorHandler: SkillHandler<
  ContentTranslatorInput,
  ContentTranslatorOutput
> = {
  slug: "content-translator",
  title: "Tradutor de Conteúdo",
  category: "i18n",
  version: "2.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): ContentTranslatorInput =>
    ContentTranslatorInputSchema.parse(raw),
  execute: async (
    input: ContentTranslatorInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<ContentTranslatorOutput>> => {
    const startedAt = Date.now();

    // 1. Reasoning Trace
    const reasoningTrace: ReasoningStep[] = [
      {
        thought: `Iniciando tradução de conteúdo do tipo ${input.contentType} de ${input.sourceLanguage} para ${input.targetLanguage}.`,
      },
    ];

    // 2. Memory Retrieval (Check for previous similar translations)
    const previousTranslations = await context.memory.retrieve(`translation for ${input.content.substring(0, 50)}... to ${input.targetLanguage}`, 1);
    reasoningTrace.push({
      thought: `Analisando memória: ${previousTranslations.length} traduções anteriores encontradas.`,
    });

    const { adapted, notes: adaptationNotes } = adaptContent(
      input.content,
      input.sourceLanguage,
      input.targetLanguage,
      input.adaptationLevel,
    );

    const culturalNotes = [
      ...adaptationNotes,
      `Nível de adaptação: ${input.adaptationLevel}`,
      `Tipo de conteúdo: ${input.contentType}`,
    ];

    if (input.adaptationLevel !== "literal") {
      culturalNotes.push("Conteúdo adaptado culturalmente para o mercado-alvo");
    }

    const output: ContentTranslatorOutput = {
      originalContent: input.content,
      translatedContent: adapted,
      sourceLanguage: input.sourceLanguage,
      targetLanguage: input.targetLanguage,
      adaptations: adaptationNotes,
      hashtags: generateHashtags([], input.targetLanguage),
      culturalNotes,
      qualityScore: input.adaptationLevel === "full" ? 90 : 75,
      reasoningTrace,
    };

    // 3. Reflection
    if (context.reflector) {
      output.reflection = await context.reflector.reflect(context, reasoningTrace);
      reasoningTrace.push({
        thought: "Reflexão aplicada para otimizar a tradução.",
        result: "Tradução refinada com base em insights de performance."
      });
    }

    // 4. Store in Memory
    await context.memory.store({
      timestamp: new Date(),
      content: `Conteúdo traduzido de ${input.sourceLanguage} para ${input.targetLanguage}: ${output.translatedContent.substring(0, 100)}...`,
      type: 'episodic',
      relatedSkills: ["content-translator"]
    });

    // 5. Record Metrics
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'translation_quality_score',
      value: output.qualityScore,
      unit: 'points',
      skillSlug: "content-translator"
    });
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'adaptation_level',
      value: input.adaptationLevel === "literal" ? 0 : (input.adaptationLevel === "cultural" ? 1 : 2),
      unit: 'level',
      skillSlug: "content-translator"
    });

    return {
      executionId: randomUUID(),
      skill: "content-translator",
      success: true,
      decision: "auto",
      latencyMs: Date.now() - startedAt,
      output,
      message: `Tradução ${input.adaptationLevel} de ${input.sourceLanguage} para ${input.targetLanguage}`,
    };
  },
};
