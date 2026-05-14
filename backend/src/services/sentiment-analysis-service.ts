import { OpenAI } from "openai";

/**
 * Serviço de Análise de Sentimento
 * Utiliza modelos de linguagem para analisar sentimento de conteúdo gerado
 */

interface SentimentResult {
  score: number; // 0-100
  classification: "positive" | "neutral" | "negative";
  explanation: string;
  keywords: string[];
  confidence: number; // 0-1
}

interface SentimentAnalysisRequest {
  content: string;
  context?: string;
  language?: string;
}

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analisar sentimento de um texto
 */
export async function analyzeSentiment(
  request: SentimentAnalysisRequest
): Promise<SentimentResult> {
  try {
    const systemPrompt = `Você é um especialista em análise de sentimento. Analise o sentimento do texto fornecido e retorne um JSON com os seguintes campos:
- score: número de 0 a 100 (0 = muito negativo, 50 = neutro, 100 = muito positivo)
- classification: "positive", "neutral" ou "negative"
- explanation: breve explicação do sentimento detectado
- keywords: array com 3-5 palavras-chave que indicam o sentimento
- confidence: número de 0 a 1 indicando confiança da análise

Retorne APENAS o JSON válido, sem explicações adicionais.`;

    const userPrompt = `Analise o sentimento do seguinte texto:

${request.content}

${request.context ? `Contexto: ${request.context}` : ""}

Idioma: ${request.language || "português"}`;

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
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta vazia do modelo");
    }

    const result = JSON.parse(content) as SentimentResult;

    // Validar resultado
    if (
      typeof result.score !== "number" ||
      result.score < 0 ||
      result.score > 100
    ) {
      throw new Error("Score inválido");
    }

    if (!["positive", "neutral", "negative"].includes(result.classification)) {
      throw new Error("Classificação inválida");
    }

    return result;
  } catch (error) {
    console.error("[SentimentAnalysis] Erro ao analisar sentimento:", error);
    throw new Error("Erro ao analisar sentimento do conteúdo");
  }
}

/**
 * Analisar sentimento em lote
 */
export async function analyzeSentimentBatch(
  contents: Array<{ id: string; text: string }>
): Promise<Array<{ id: string; sentiment: SentimentResult }>> {
  try {
    const results = [];

    for (const item of contents) {
      const sentiment = await analyzeSentiment({ content: item.text });
      results.push({
        id: item.id,
        sentiment,
      });
    }

    return results;
  } catch (error) {
    console.error("[SentimentAnalysis] Erro ao analisar sentimento em lote:", error);
    throw new Error("Erro ao analisar sentimento em lote");
  }
}

/**
 * Comparar sentimento entre variações de conteúdo
 */
export async function compareSentiments(
  variations: Array<{ id: string; content: string }>
): Promise<{
  results: Array<{ id: string; sentiment: SentimentResult }>;
  bestVariation: { id: string; sentiment: SentimentResult };
  worstVariation: { id: string; sentiment: SentimentResult };
}> {
  try {
    const results = [];
    let bestVariation = null;
    let worstVariation = null;

    for (const variation of variations) {
      const sentiment = await analyzeSentiment({ content: variation.content });
      results.push({
        id: variation.id,
        sentiment,
      });

      // Encontrar melhor e pior
      if (!bestVariation || sentiment.score > bestVariation.sentiment.score) {
        bestVariation = { id: variation.id, sentiment };
      }
      if (!worstVariation || sentiment.score < worstVariation.sentiment.score) {
        worstVariation = { id: variation.id, sentiment };
      }
    }

    return {
      results,
      bestVariation: bestVariation!,
      worstVariation: worstVariation!,
    };
  } catch (error) {
    console.error("[SentimentAnalysis] Erro ao comparar sentimentos:", error);
    throw new Error("Erro ao comparar sentimentos");
  }
}

/**
 * Classificar sentimento simples (sem detalhes)
 */
export async function classifySentimentSimple(
  content: string
): Promise<"positive" | "neutral" | "negative"> {
  try {
    const result = await analyzeSentiment({ content });
    return result.classification;
  } catch (error) {
    console.error("[SentimentAnalysis] Erro ao classificar sentimento:", error);
    throw new Error("Erro ao classificar sentimento");
  }
}

/**
 * Obter score de sentimento (0-100)
 */
export async function getSentimentScore(content: string): Promise<number> {
  try {
    const result = await analyzeSentiment({ content });
    return result.score;
  } catch (error) {
    console.error("[SentimentAnalysis] Erro ao obter score:", error);
    throw new Error("Erro ao obter score de sentimento");
  }
}

/**
 * Filtrar conteúdo por sentimento
 */
export async function filterBysentiment(
  contents: Array<{ id: string; text: string }>,
  minScore?: number,
  maxScore?: number,
  classification?: "positive" | "neutral" | "negative"
): Promise<Array<{ id: string; text: string; sentiment: SentimentResult }>> {
  try {
    const results = [];

    for (const item of contents) {
      const sentiment = await analyzeSentiment({ content: item.text });

      let matches = true;

      if (minScore !== undefined && sentiment.score < minScore) {
        matches = false;
      }
      if (maxScore !== undefined && sentiment.score > maxScore) {
        matches = false;
      }
      if (classification && sentiment.classification !== classification) {
        matches = false;
      }

      if (matches) {
        results.push({
          id: item.id,
          text: item.text,
          sentiment,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("[SentimentAnalysis] Erro ao filtrar por sentimento:", error);
    throw new Error("Erro ao filtrar por sentimento");
  }
}

export default {
  analyzeSentiment,
  analyzeSentimentBatch,
  compareSentiments,
  classifySentimentSimple,
  getSentimentScore,
  filterBysentiment,
};
