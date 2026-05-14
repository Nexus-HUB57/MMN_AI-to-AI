import { OpenAI } from "openai";

/**
 * Serviço de Recomendações de Conteúdo
 * Gera recomendações personalizadas baseadas em histórico, performance e análise de sentimento
 */

interface ContentHistory {
  id: string;
  content: string;
  platform: string;
  tone: string;
  performance: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
  };
  sentiment?: {
    score: number;
    classification: string;
  };
  createdAt: Date;
}

interface RecommendationResult {
  topic: string;
  format: string;
  tone: string;
  platform: string;
  bestTimeToPost: string;
  reasoning: string;
  examples: string[];
  confidence: number;
}

interface UserProfile {
  userId: number;
  totalPosts: number;
  averageEngagement: number;
  topTopics: string[];
  preferredTones: string[];
  preferredPlatforms: string[];
  bestPerformingFormat: string;
}

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analisar histórico de conteúdo do usuário
 */
export async function analyzeUserContentHistory(
  contentHistory: ContentHistory[]
): Promise<UserProfile> {
  if (contentHistory.length === 0) {
    return {
      userId: 0,
      totalPosts: 0,
      averageEngagement: 0,
      topTopics: [],
      preferredTones: [],
      preferredPlatforms: [],
      bestPerformingFormat: "general",
    };
  }

  // Calcular métricas
  const totalPosts = contentHistory.length;
  const totalEngagement = contentHistory.reduce(
    (sum, post) => sum + post.performance.engagementRate,
    0
  );
  const averageEngagement = totalEngagement / totalPosts;

  // Encontrar plataformas mais usadas
  const platformCounts = contentHistory.reduce(
    (acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const preferredPlatforms = Object.entries(platformCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([platform]) => platform);

  // Encontrar tons mais usados
  const toneCounts = contentHistory.reduce(
    (acc, post) => {
      acc[post.tone] = (acc[post.tone] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const preferredTones = Object.entries(toneCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tone]) => tone);

  // Encontrar melhor formato (baseado em engajamento)
  const bestPerforming = contentHistory.reduce((best, post) =>
    post.performance.engagementRate > best.performance.engagementRate ? post : best
  );

  return {
    userId: 0,
    totalPosts,
    averageEngagement,
    topTopics: extractTopics(contentHistory),
    preferredTones,
    preferredPlatforms,
    bestPerformingFormat: bestPerforming.tone,
  };
}

/**
 * Extrair tópicos principais do histórico
 */
function extractTopics(contentHistory: ContentHistory[]): string[] {
  const topicMap = new Map<string, number>();

  contentHistory.forEach((post) => {
    // Extrair palavras-chave do conteúdo (simplificado)
    const words = post.content
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 5);

    words.forEach((word) => {
      topicMap.set(word, (topicMap.get(word) || 0) + 1);
    });
  });

  return Array.from(topicMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic);
}

/**
 * Gerar recomendações de conteúdo
 */
export async function generateContentRecommendations(
  userProfile: UserProfile,
  contentHistory: ContentHistory[],
  count: number = 5
): Promise<RecommendationResult[]> {
  try {
    const systemPrompt = `Você é um especialista em estratégia de conteúdo e marketing digital. 
Baseado no perfil do usuário e histórico de conteúdo, gere recomendações personalizadas e acionáveis.
Retorne um JSON com array de recomendações, cada uma com: topic, format, tone, platform, bestTimeToPost, reasoning, examples (array com 2-3 exemplos), confidence (0-1).`;

    const userPrompt = `Perfil do usuário:
- Total de posts: ${userProfile.totalPosts}
- Engajamento médio: ${userProfile.averageEngagement.toFixed(2)}%
- Tópicos principais: ${userProfile.topTopics.join(", ")}
- Tons preferidos: ${userProfile.preferredTones.join(", ")}
- Plataformas preferidas: ${userProfile.preferredPlatforms.join(", ")}
- Melhor formato: ${userProfile.bestPerformingFormat}

Histórico recente (últimos 5 posts):
${contentHistory
  .slice(-5)
  .map(
    (post) =>
      `- "${post.content.substring(0, 100)}..." (${post.platform}, engajamento: ${post.performance.engagementRate.toFixed(2)}%)`
  )
  .join("\n")}

Gere ${count} recomendações de conteúdo personalizadas.
Retorne APENAS um JSON válido com a estrutura: { recommendations: [...] }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta vazia do modelo");
    }

    const result = JSON.parse(content);
    return result.recommendations || [];
  } catch (error) {
    console.error("[ContentRecommendation] Erro ao gerar recomendações:", error);
    throw new Error("Erro ao gerar recomendações de conteúdo");
  }
}

/**
 * Recomendar melhor horário para postar
 */
export async function recommendBestTimeToPost(
  platform: string,
  contentHistory: ContentHistory[]
): Promise<{
  bestHour: number;
  bestDay: string;
  reasoning: string;
}> {
  try {
    // Filtrar por plataforma
    const platformPosts = contentHistory.filter((p) => p.platform === platform);

    if (platformPosts.length === 0) {
      return {
        bestHour: 10,
        bestDay: "Tuesday",
        reasoning: "Sem dados históricos, usando horário padrão recomendado",
      };
    }

    // Encontrar horário com melhor engajamento
    const hourMap = new Map<number, number>();
    platformPosts.forEach((post) => {
      const hour = post.createdAt.getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + post.performance.engagementRate);
    });

    const bestHour = Array.from(hourMap.entries()).sort(([, a], [, b]) => b - a)[0][0];

    // Encontrar dia com melhor engajamento
    const dayMap = new Map<string, number>();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    platformPosts.forEach((post) => {
      const day = days[post.createdAt.getDay()];
      dayMap.set(day, (dayMap.get(day) || 0) + post.performance.engagementRate);
    });

    const bestDay = Array.from(dayMap.entries()).sort(([, a], [, b]) => b - a)[0][0];

    return {
      bestHour,
      bestDay,
      reasoning: `Baseado no histórico de ${platformPosts.length} posts em ${platform}`,
    };
  } catch (error) {
    console.error("[ContentRecommendation] Erro ao recomendar horário:", error);
    throw new Error("Erro ao recomendar horário de postagem");
  }
}

/**
 * Recomendar variações de conteúdo com melhor performance
 */
export async function recommendContentVariations(
  baseContent: string,
  userProfile: UserProfile
): Promise<Array<{ variation: string; expectedPerformance: string; reasoning: string }>> {
  try {
    const systemPrompt = `Você é um especialista em otimização de conteúdo para redes sociais.
Gere variações do conteúdo fornecido que se alinhem com o perfil do usuário e histórico de performance.
Retorne um JSON com array de variações, cada uma com: variation (texto), expectedPerformance (low/medium/high), reasoning.`;

    const userPrompt = `Conteúdo base:
"${baseContent}"

Perfil do usuário:
- Tons preferidos: ${userProfile.preferredTones.join(", ")}
- Plataformas preferidas: ${userProfile.preferredPlatforms.join(", ")}
- Tópicos principais: ${userProfile.topTopics.join(", ")}
- Engajamento médio: ${userProfile.averageEngagement.toFixed(2)}%

Gere 3 variações otimizadas do conteúdo.
Retorne APENAS um JSON válido com a estrutura: { variations: [...] }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta vazia do modelo");
    }

    const result = JSON.parse(content);
    return result.variations || [];
  } catch (error) {
    console.error("[ContentRecommendation] Erro ao recomendar variações:", error);
    throw new Error("Erro ao recomendar variações de conteúdo");
  }
}

/**
 * Analisar gaps de conteúdo
 */
export async function analyzeContentGaps(
  userProfile: UserProfile,
  contentHistory: ContentHistory[]
): Promise<Array<{ gap: string; opportunity: string; suggestedTopics: string[] }>> {
  try {
    const systemPrompt = `Você é um analista de estratégia de conteúdo.
Identifique gaps e oportunidades no conteúdo do usuário baseado em seu perfil e histórico.
Retorne um JSON com array de gaps, cada um com: gap (descrição), opportunity (oportunidade), suggestedTopics (array).`;

    const userPrompt = `Perfil do usuário:
- Total de posts: ${userProfile.totalPosts}
- Tópicos principais: ${userProfile.topTopics.join(", ")}
- Tons preferidos: ${userProfile.preferredTones.join(", ")}
- Plataformas preferidas: ${userProfile.preferredPlatforms.join(", ")}

Histórico: ${contentHistory.length} posts

Identifique 3 gaps e oportunidades.
Retorne APENAS um JSON válido com a estrutura: { gaps: [...] }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta vazia do modelo");
    }

    const result = JSON.parse(content);
    return result.gaps || [];
  } catch (error) {
    console.error("[ContentRecommendation] Erro ao analisar gaps:", error);
    throw new Error("Erro ao analisar gaps de conteúdo");
  }
}

export default {
  analyzeUserContentHistory,
  generateContentRecommendations,
  recommendBestTimeToPost,
  recommendContentVariations,
  analyzeContentGaps,
};
