/**
 * Serviço de Análise de Sentimento
 *
 * Em bootstrap/fusão, o cliente OpenAI é opcional. Quando a dependência ou a
 * chave não estiverem disponíveis, o serviço usa uma heurística local para não
 * quebrar o carregamento dos routers.
 */

interface SentimentResult {
  score: number;
  classification: "positive" | "neutral" | "negative";
  explanation: string;
  keywords: string[];
  confidence: number;
}

interface SentimentAnalysisRequest {
  content: string;
  context?: string;
  language?: string;
}

let openaiClientPromise: Promise<any | null> | null = null;

async function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openaiClientPromise) {
    openaiClientPromise = import("openai")
      .then((mod) => new mod.OpenAI({ apiKey: process.env.OPENAI_API_KEY }))
      .catch(() => null);
  }

  return openaiClientPromise;
}

function heuristicSentiment(content: string): SentimentResult {
  const normalized = content.toLowerCase();
  const positiveWords = [
    "excelente",
    "ótimo",
    "otimo",
    "incrível",
    "incrivel",
    "bom",
    "positiv",
    "sucesso",
    "crescimento",
    "amazing",
    "great",
    "good",
    "love",
    "happy",
  ];
  const negativeWords = [
    "ruim",
    "péssimo",
    "pessimo",
    "erro",
    "falha",
    "crise",
    "negativ",
    "problema",
    "bad",
    "terrible",
    "hate",
    "angry",
    "loss",
  ];

  const positiveHits = positiveWords.filter((word) => normalized.includes(word));
  const negativeHits = negativeWords.filter((word) => normalized.includes(word));

  const delta = positiveHits.length - negativeHits.length;
  const rawScore = 50 + delta * 12;
  const score = Math.max(0, Math.min(100, rawScore));

  let classification: SentimentResult["classification"] = "neutral";
  if (score > 60) classification = "positive";
  if (score < 40) classification = "negative";

  const keywords = Array.from(new Set([...positiveHits, ...negativeHits])).slice(0, 5);

  return {
    score,
    classification,
    explanation:
      classification === "positive"
        ? "Análise heurística indica predominância de sinais positivos."
        : classification === "negative"
          ? "Análise heurística indica predominância de sinais negativos."
          : "Análise heurística indica equilíbrio ou neutralidade no texto.",
    keywords,
    confidence: keywords.length > 0 ? 0.62 : 0.45,
  };
}

export async function analyzeSentiment(
  request: SentimentAnalysisRequest
): Promise<SentimentResult> {
  const fallback = heuristicSentiment(request.content);

  try {
    const openai = await getOpenAIClient();
    if (!openai) {
      return fallback;
    }

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
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return fallback;
    }

    const result = JSON.parse(content) as SentimentResult;

    if (
      typeof result.score !== "number" ||
      result.score < 0 ||
      result.score > 100 ||
      !["positive", "neutral", "negative"].includes(result.classification)
    ) {
      return fallback;
    }

    return {
      ...result,
      keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 5) : fallback.keywords,
      confidence:
        typeof result.confidence === "number" ? Math.max(0, Math.min(1, result.confidence)) : fallback.confidence,
    };
  } catch (error) {
    console.error("[SentimentAnalysis] Falha na análise remota; usando fallback:", error);
    return fallback;
  }
}

export async function analyzeSentimentBatch(
  contents: Array<{ id: string; text: string }>
): Promise<Array<{ id: string; sentiment: SentimentResult }>> {
  const results: Array<{ id: string; sentiment: SentimentResult }> = [];

  for (const item of contents) {
    const sentiment = await analyzeSentiment({ content: item.text });
    results.push({ id: item.id, sentiment });
  }

  return results;
}

export async function compareSentiments(
  variations: Array<{ id: string; content: string }>
): Promise<{
  results: Array<{ id: string; sentiment: SentimentResult }>;
  bestVariation: { id: string; sentiment: SentimentResult };
  worstVariation: { id: string; sentiment: SentimentResult };
}> {
  const results: Array<{ id: string; sentiment: SentimentResult }> = [];

  for (const variation of variations) {
    const sentiment = await analyzeSentiment({ content: variation.content });
    results.push({ id: variation.id, sentiment });
  }

  const sorted = [...results].sort((a, b) => b.sentiment.score - a.sentiment.score);
  const bestVariation = sorted[0] || {
    id: "n/a",
    sentiment: heuristicSentiment(""),
  };
  const worstVariation = sorted[sorted.length - 1] || bestVariation;

  return {
    results,
    bestVariation,
    worstVariation,
  };
}

export async function classifySentimentSimple(
  content: string
): Promise<"positive" | "neutral" | "negative"> {
  const result = await analyzeSentiment({ content });
  return result.classification;
}

export async function getSentimentScore(content: string): Promise<number> {
  const result = await analyzeSentiment({ content });
  return result.score;
}

export async function filterBysentiment(
  contents: Array<{ id: string; text: string }>,
  minScore?: number,
  maxScore?: number,
  classification?: "positive" | "neutral" | "negative"
): Promise<Array<{ id: string; text: string; sentiment: SentimentResult }>> {
  const results: Array<{ id: string; text: string; sentiment: SentimentResult }> = [];

  for (const item of contents) {
    const sentiment = await analyzeSentiment({ content: item.text });

    let matches = true;
    if (minScore !== undefined && sentiment.score < minScore) matches = false;
    if (maxScore !== undefined && sentiment.score > maxScore) matches = false;
    if (classification && sentiment.classification !== classification) matches = false;

    if (matches) {
      results.push({
        id: item.id,
        text: item.text,
        sentiment,
      });
    }
  }

  return results;
}

export default {
  analyzeSentiment,
  analyzeSentimentBatch,
  compareSentiments,
  classifySentimentSimple,
  getSentimentScore,
  filterBysentiment,
};
