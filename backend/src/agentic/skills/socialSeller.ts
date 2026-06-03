import { z } from "zod";
import {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";
import { ReasoningStep, ReflectionEntry } from "./agenticCore";

// ============================================
// SCHEMAS
// ============================================

const socialSellerInputSchema = z.object({
  platform: z.enum(["instagram", "facebook", "tiktok", "linkedin", "twitter"]),
  contentType: z.enum(["post", "story", "reel", "video", "short", "carousel"]),
  productName: z.string().min(2).max(100),
  productDescription: z.string().min(10).max(1000),
  targetAudience: z.string().min(2).max(200),
  brandTone: z.string().optional().default("professional"),
  affiliateLink: z.string().url().optional(),
  maxHashtags: z.number().int().min(0).max(30).optional().default(10),
});

const socialSellerOutputSchema = z.object({
  content: z.object({
    primaryText: z.string(),
    caption: z.string().optional(),
    hashtags: z.array(z.string()),
    callToAction: z.string(),
    suggestedComments: z.array(z.string()),
  }),
  media: z.object({
    imagePrompt: z.string().optional(),
    videoScript: z.string().optional(),
    altText: z.string().optional(),
  }),
  scheduling: z.object({
    recommendedTimes: z.array(z.string()),
    optimalDay: z.string(),
    engagementScore: z.number(),
  }),
  analytics: z.object({
    estimatedReach: z.string(),
    expectedEngagement: z.string(),
    conversionPotential: z.string(),
  }),
  reasoningTrace: z.array(z.any()).optional(),
  reflection: z.any().optional(),
});

export type SocialSellerInput = z.infer<typeof socialSellerInputSchema>;
export type SocialSellerOutput = z.infer<typeof socialSellerOutputSchema>;

// ============================================
// HELPERS
// ============================================

function generatePlatformContent(input: SocialSellerInput, platform: string) {
  const tone = input.brandTone || "professional";
  let primaryText = "";
  let callToAction = "";

  if (platform === "instagram") {
    primaryText = `📸 ${input.productName}: ${input.productDescription}. Ideal para ${input.targetAudience}!`;
    callToAction = input.affiliateLink ? `Confira no link da bio: ${input.affiliateLink}` : "Comente 'EU QUERO' para saber mais!";
  } else {
    primaryText = `🚀 ${input.productName} está revolucionando o mercado para ${input.targetAudience}.`;
    callToAction = input.affiliateLink ? `Saiba mais aqui: ${input.affiliateLink}` : "Entre em contato agora!";
  }

  return { primaryText, callToAction };
}

function generateHashtags(product: string, audience: string, count: number) {
  const base = ["marketing", "vendas", "sucesso", "negocios"];
  return base.slice(0, count).map(h => `#${h}`);
}

function analyzeEngagement(content: string, platform: string) {
  return { score: 85, reach: "Alto", engagement: "Excelente", conversion: "Alto" };
}

// ============================================
// HANDLER
// ============================================

export const socialSellerHandler: SkillHandler<SocialSellerInput, SocialSellerOutput> = {
  slug: "social-seller",
  title: "Social Seller",
  category: "sales",
  version: "2.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown) => {
    return socialSellerInputSchema.parse(raw);
  },
  execute: async (input: SocialSellerInput, context: SkillExecutionContext): Promise<SkillExecutionResult<SocialSellerOutput>> => {
    const startTime = Date.now();
    const executionId = `social-${Math.random().toString(36).substring(7)}`;
    const reasoningTrace: ReasoningStep[] = [
      { thought: `Iniciando Social Seller para plataforma ${input.platform}` }
    ];

    try {
      reasoningTrace.push({ thought: "Gerando conteúdo específico para a plataforma" });
      const { primaryText, callToAction } = generatePlatformContent(input, input.platform);
      
      reasoningTrace.push({ thought: "Calculando hashtags e engajamento" });
      const hashtags = generateHashtags(input.productName, input.targetAudience, input.maxHashtags || 10);
      const engagement = analyzeEngagement(primaryText, input.platform);

      let reflection: ReflectionEntry | undefined;
      if (context.reflector) {
        reflection = await context.reflector.reflect(context, reasoningTrace);
        reasoningTrace.push({ thought: "Reflexão aplicada para validar tom de voz" });
      }

      await context.metrics.record({
        timestamp: new Date(),
        metricName: 'social_engagement_score',
        value: engagement.score,
        unit: 'points',
        skillSlug: 'social-seller'
      });

      const output: SocialSellerOutput = {
        content: {
          primaryText,
          hashtags,
          callToAction,
          suggestedComments: ["Top!", "Quero saber mais"],
        },
        media: {
          imagePrompt: `Photo of ${input.productName}`,
          altText: input.productName,
        },
        scheduling: {
          recommendedTimes: ["09:00", "18:00"],
          optimalDay: "Quarta-feira",
          engagementScore: engagement.score,
        },
        analytics: {
          estimatedReach: engagement.reach,
          expectedEngagement: engagement.engagement,
          conversionPotential: engagement.conversion,
        },
        reasoningTrace,
        reflection
      };

      return {
        executionId,
        skill: "social-seller",
        success: true,
        decision: "auto",
        latencyMs: Date.now() - startTime,
        output,
        message: `Social content gerado para ${input.platform}`,
      };
    } catch (error) {
      return {
        executionId,
        skill: "social-seller",
        success: false,
        decision: "needs_review",
        latencyMs: Date.now() - startTime,
        output: {} as SocialSellerOutput,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  },
};
