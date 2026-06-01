/**
 * Social Seller - Skill para automação de vendas em redes sociais
 *
 * Categoria: sales
 * Status: planned (implementação inicial)
 * Versão: 0.0.1
 *
 * Funcionalidades:
 * - Geração de posts de venda para múltiplas plataformas
 * - Calendário de conteúdo social
 * - Automação de respostas e comentários
 * - Análise de engajamento
 * - Integração com Instagram, Facebook, TikTok
 */

import { z } from "zod";
import { invokeLLM } from "../../services/llm-v2";
import type { SkillHandler, SkillExecutionContext, SkillExecutionResult } from "./types";

// ============================================
// INPUT VALIDATION
// ============================================

const SocialPlatform = z.enum(["instagram", "facebook", "tiktok", "linkedin", "twitter"]);
const ContentType = z.enum(["post", "story", "reel", "carousel", "video", "short"]);

export const socialSellerInputSchema = z.object({
  productName: z.string().min(1, "Nome do produto é obrigatório"),
  productDescription: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  targetAudience: z.string().optional().default("público geral"),
  platform: SocialPlatform.optional().default("instagram"),
  contentType: ContentType.optional().default("post"),
  keyBenefits: z.array(z.string()).optional().default([]),
  callToAction: z.string().optional(),
  tone: z.enum(["professional", "casual", "urgency", "inspirational"]).optional().default("casual"),
  includeHashtags: z.boolean().optional().default(true),
  maxHashtags: z.number().optional().default(10),
  scheduleTime: z.string().optional(),
});

export type SocialSellerInput = z.infer<typeof socialSellerInputSchema>;

// ============================================
// OUTPUT TYPES
// ============================================

export interface SocialSellerOutput {
  content: {
    primaryText: string;
    caption?: string;
    hashtags: string[];
    callToAction: string;
    suggestedComments: string[];
  };
  media: {
    imagePrompt?: string;
    videoScript?: string;
    altText?: string;
  };
  scheduling: {
    recommendedTimes: string[];
    optimalDay: string;
    engagementScore: number;
  };
  analytics: {
    estimatedReach: string;
    expectedEngagement: string;
    conversionPotential: string;
  };
}

// ============================================
// HASHTAG GENERATOR
// ============================================

function generateHashtags(product: string, audience: string, count: number): string[] {
  const baseHashtags = [
    "#vendas", "#marketingdigital", "#negóonline", "#empreendedorismo",
    "#diploma", "#cursosead", "#educaçãoonline", "#trabalhoemcasa",
    "#rendacomplementar", "#marketing", "#viral", "#tendência",
    "#negocio digital", "#produtodigital", "#afiliado", "#mmn"
  ];

  const productHashtags = [
    `#${product.toLowerCase().replace(/\s+/g, "")}`,
    `#${product.split(" ")[0].toLowerCase()}`,
    "#vendasonline", "#conversao", "#vendacompleta"
  ];

  const audienceHashtags = [
    "#empreendedor", "#investidor", "#profissionaldigital",
    "# businessman", "#startup", "#growth"
  ];

  const all = [...new Set([...productHashtags, ...baseHashtags, ...audienceHashtags])];
  return all.slice(0, count);
}

// ============================================
// CONTENT TEMPLATES
// ============================================

function generatePlatformContent(
  input: SocialSellerInput,
  platform: string
): { primaryText: string; callToAction: string } {
  const { productName, productDescription, tone, callToAction } = input;

  const toneTemplates: Record<string, { text: string; cta: string }> = {
    professional: {
      text: `🧠 DESVENDANDO: ${productName}\n\n${productDescription}\n\nUm produto que vai transformar sua forma de trabalhar e faturar online.\n\n📈 Resultados comprovados\n✅ Qualidade garantida\n✅ Suporte especializado`,
      cta: callToAction || "👉 Clique abaixo e descubra como começar!"
    },
    casual: {
      text: `🔥 Ei, você já conhece o ${productName}?\n\nOlha só: ${productDescription}\n\nIsso mudou a vida de muitas pessoas que eu conheço!\n\nCorre que é por tempo limitado! 🚀`,
      cta: callToAction || "💬 Comenta aqui pra eu te enviar mais detalhes!"
    },
    urgency: {
      text: `⏰ ÚLTIMAS VAGAS!\n\n${productName}\n\n${productDescription}\n\nNão vai ficar de fora dessa, né?\n\n👉 Correr para garantir sua vaga AGORA!`,
      cta: callToAction || "🚨 Garantir minha vaga agora!"
    },
    inspirational: {
      text: `✨ Imagine alcançar seus objetivos...\n\nCom ${productName}, isso é possível.\n\n${productDescription}\n\nVocê merece o melhor. Comece hoje. 💫`,
      cta: callToAction || "🌟 Quero começar minha jornada!"
    },
  };

  return toneTemplates[tone] || toneTemplates.casual;
}

// ============================================
// ENGAGEMENT ANALYZER
// ============================================

function analyzeEngagement(content: string, platform: string): {
  score: number;
  reach: string;
  engagement: string;
  conversion: string;
} {
  // Simple heuristic scoring
  let score = 50;

  // Engagement triggers
  const triggers = [
    { pattern: /\d+[kK]/g, bonus: 10 }, // Numbers like 10k
    { pattern: /[?!]/g, bonus: 5 }, // Questions/exclamations
    { pattern: /\n/g, bonus: 3 }, // Line breaks
    { pattern: /#[a-zA-Z]+/g, bonus: 2 }, // Hashtags
    { pattern: /[😊🔥💰✨📈]/g, bonus: 3 }, // Emojis
  ];

  triggers.forEach(({ pattern, bonus }) => {
    const matches = content.match(pattern);
    if (matches) {
      score += Math.min(bonus * matches.length, 20);
    }
  });

  // Platform-specific adjustments
  const platformMultipliers: Record<string, number> = {
    instagram: 1.0,
    tiktok: 1.3,
    facebook: 0.9,
    linkedin: 0.8,
    twitter: 0.7,
  };

  score = Math.min(score * (platformMultipliers[platform] || 1), 100);

  return {
    score: Math.round(score),
    reach: score > 70 ? "Alto" : score > 50 ? "Médio" : "Baixo",
    engagement: score > 80 ? "Excelente" : score > 60 ? "Bom" : "Moderado",
    conversion: score > 75 ? "Alto" : score > 55 ? "Médio" : "Baixo",
  };
}

// ============================================
// HANDLER
// ============================================

export const socialSellerHandler: SkillHandler<SocialSellerInput, SocialSellerOutput> = {
  slug: "social-seller",
  title: "Social Seller",
  category: "sales",
  version: "0.0.1",
  supportsAutonomous: false,

  parseInput: (raw: unknown) => {
    return socialSellerInputSchema.parse(raw);
  },

  execute: async (input: SocialSellerInput, context: SkillExecutionContext): Promise<SkillExecutionResult<SocialSellerOutput>> => {
    const startTime = Date.now();
    const executionId = `${Date.now()}-social-seller`;

    try {
      const platform = input.platform;
      const contentType = input.contentType;

      // Generate content based on platform and type
      const { primaryText, callToAction } = generatePlatformContent(input, platform);

      // Generate hashtags
      const hashtags = generateHashtags(
        input.productName,
        input.targetAudience,
        input.maxHashtags || 10
      );

      // Build full content
      const fullContent = `${primaryText}\n\n${hashtags.join(" ")}\n\n${callToAction}`;

      // Analyze engagement potential
      const engagement = analyzeEngagement(fullContent, platform);

      // Generate suggested comments for engagement
      const suggestedComments = [
        "Que top! Me explica mais 👀",
        "Quero saber mais, como faço?",
        "Isso é pra mim? Tenho interesse!",
        "Incrível! Compartilha mais!",
        "Já utilizo, recomendo demais! 👍"
      ];

      // Generate image prompt if needed
      const imagePrompt = contentType !== "story"
        ? `Professional product photo of ${input.productName}, modern design, clean background, high contrast, social media ready, 4:5 aspect ratio`
        : undefined;

      // Generate video script for reels/shorts
      const videoScript = ["reel", "video", "short"].includes(contentType)
        ? `HOOK (0-3s): ${input.productName} - você precisa conhecer!\nCORE (3-15s): ${input.productDescription}\nCTA (15-20s): ${callToAction}`
        : undefined;

      // Recommended scheduling times (heuristic based on platform)
      const schedulingRecommendations: Record<string, string[]> = {
        instagram: ["09:00", "12:30", "18:30", "21:00"],
        facebook: ["10:00", "14:00", "19:00"],
        tiktok: ["07:00", "12:00", "17:00", "20:00"],
        linkedin: ["08:00", "12:00", "17:00"],
        twitter: ["08:00", "12:00", "18:00"],
      };

      const output: SocialSellerOutput = {
        content: {
          primaryText,
          caption: input.contentType === "carousel" ? `${input.productDescription}\n\n🔽 Role para mais detalhes` : undefined,
          hashtags,
          callToAction,
          suggestedComments,
        },
        media: {
          imagePrompt,
          videoScript,
          altText: `${input.productName} - ${input.productDescription}`.substring(0, 125),
        },
        scheduling: {
          recommendedTimes: schedulingRecommendations[platform] || schedulingRecommendations.instagram,
          optimalDay: "Quarta-feira",
          engagementScore: engagement.score,
        },
        analytics: {
          estimatedReach: engagement.reach,
          expectedEngagement: engagement.engagement,
          conversionPotential: engagement.conversion,
        },
      };

      return {
        executionId,
        skill: "social-seller",
        success: true,
        decision: context.autonomyAllowed ? "auto" : "needs_review",
        latencyMs: Date.now() - startTime,
        output,
        message: `Social content gerado para ${platform}`,
        warnings: engagement.score < 60 ? ["Engajamento pode ser baixo, considere ajustar conteúdo"] : undefined,
      };

    } catch (error) {
      return {
        executionId,
        skill: "social-seller",
        success: false,
        decision: "needs_review",
        latencyMs: Date.now() - startTime,
        output: {
          content: { primaryText: "", hashtags: [], callToAction: "" },
          media: {},
          scheduling: { recommendedTimes: [], optimalDay: "", engagementScore: 0 },
          analytics: { estimatedReach: "N/A", expectedEngagement: "N/A", conversionPotential: "N/A" },
        } as SocialSellerOutput,
        message: error instanceof Error ? error.message : "Failed to generate social content",
      };
    }
  },
};

// ============================================
// EXPORTS
// ============================================

// Tipos e schema já são exportados nas declarações acima.
