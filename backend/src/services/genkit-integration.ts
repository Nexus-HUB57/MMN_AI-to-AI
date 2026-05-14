import { generate, defineModel, defineFlow } from "@genkit-ai/ai";
import { googleAI } from "@genkit-ai/google-ai";
import { OpenAI } from "openai";

/**
 * Integração com Google Genkit para suporte a múltiplos modelos de IA
 * Suporta: Google Gemini, OpenAI GPT, e modelos proprietários MMN
 */

// Configuração de modelos disponíveis
export interface AIModelConfig {
  id: string;
  name: string;
  provider: "google" | "openai" | "proprietary";
  modelId: string;
  description: string;
  capabilities: string[];
  costPerRequest: number;
  responseTime: string;
  isActive: boolean;
  maxTokens: number;
  temperature: number;
}

// Registro de modelos disponíveis
export const aiModels: AIModelConfig[] = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    modelId: "gemini-2.0-flash",
    description: "Modelo rápido e eficiente do Google para geração de conteúdo",
    capabilities: ["text", "image", "video", "multimodal"],
    costPerRequest: 0.0001,
    responseTime: "< 500ms",
    isActive: true,
    maxTokens: 8192,
    temperature: 0.7,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    modelId: "gemini-1.5-pro",
    description: "Modelo avançado do Google com suporte a contexto longo",
    capabilities: ["text", "image", "video", "multimodal", "code"],
    costPerRequest: 0.0005,
    responseTime: "< 1s",
    isActive: true,
    maxTokens: 100000,
    temperature: 0.7,
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4 Mini",
    provider: "openai",
    modelId: "gpt-4.1-mini",
    description: "Modelo compacto da OpenAI para tarefas rápidas",
    capabilities: ["text", "code", "analysis"],
    costPerRequest: 0.00015,
    responseTime: "< 800ms",
    isActive: true,
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    id: "mmn-copywriting-v1",
    name: "MMN Copywriting V1",
    provider: "proprietary",
    modelId: "mmn-copywriting-v1",
    description: "Modelo fine-tuned para copywriting de marketing multinível",
    capabilities: ["text", "marketing", "copywriting"],
    costPerRequest: 0.0002,
    responseTime: "< 600ms",
    isActive: false,
    maxTokens: 2048,
    temperature: 0.8,
  },
  {
    id: "mmn-strategy-v1",
    name: "MMN Strategy V1",
    provider: "proprietary",
    modelId: "mmn-strategy-v1",
    description: "Modelo para análise estratégica de campanhas de afiliados",
    capabilities: ["analysis", "strategy", "planning"],
    costPerRequest: 0.0003,
    responseTime: "< 1s",
    isActive: false,
    maxTokens: 3000,
    temperature: 0.6,
  },
];

// Cliente OpenAI
const openaiClient = new OpenAI();

/**
 * Interface para requisições de geração de conteúdo
 */
export interface ContentGenerationRequest {
  prompt: string;
  modelId: string;
  platform?: "instagram" | "tiktok" | "twitter" | "linkedin" | "blog" | "whatsapp";
  tone?: "professional" | "casual" | "persuasive" | "humorous";
  maxLength?: number;
  temperature?: number;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
}

/**
 * Interface para resposta de geração de conteúdo
 */
export interface ContentGenerationResponse {
  success: boolean;
  content: string;
  modelUsed: string;
  provider: string;
  tokensUsed: number;
  generatedAt: Date;
  platform?: string;
  tone?: string;
}

/**
 * Gera conteúdo usando o modelo especificado
 */
export async function generateContent(
  request: ContentGenerationRequest
): Promise<ContentGenerationResponse> {
  const model = aiModels.find((m) => m.id === request.modelId);

  if (!model) {
    throw new Error(`Modelo ${request.modelId} não encontrado`);
  }

  if (!model.isActive) {
    throw new Error(`Modelo ${request.modelId} não está ativo`);
  }

  try {
    let response: ContentGenerationResponse;

    switch (model.provider) {
      case "google":
        response = await generateWithGoogle(request, model);
        break;
      case "openai":
        response = await generateWithOpenAI(request, model);
        break;
      case "proprietary":
        response = await generateWithProprietary(request, model);
        break;
      default:
        throw new Error(`Provedor desconhecido: ${model.provider}`);
    }

    return response;
  } catch (error) {
    console.error("[Genkit] Erro ao gerar conteúdo:", error);
    throw error;
  }
}

/**
 * Gera conteúdo usando Google Gemini
 */
async function generateWithGoogle(
  request: ContentGenerationRequest,
  model: AIModelConfig
): Promise<ContentGenerationResponse> {
  try {
    const systemPrompt = buildSystemPrompt(request);
    const userPrompt = buildUserPrompt(request);

    // Simulação de chamada ao Google Genkit
    // Em produção, usar: const response = await generate({ model: model.modelId, prompt: userPrompt });
    const response = {
      text: `Conteúdo gerado para ${request.platform || "geral"} com tom ${request.tone || "profissional"}: ${request.prompt}`,
      usage: {
        input_tokens: 50,
        output_tokens: 150,
      },
    };

    return {
      success: true,
      content: response.text,
      modelUsed: model.name,
      provider: "google",
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      generatedAt: new Date(),
      platform: request.platform,
      tone: request.tone,
    };
  } catch (error) {
    console.error("[Genkit] Erro ao gerar com Google:", error);
    throw error;
  }
}

/**
 * Gera conteúdo usando OpenAI GPT
 */
async function generateWithOpenAI(
  request: ContentGenerationRequest,
  model: AIModelConfig
): Promise<ContentGenerationResponse> {
  try {
    const systemPrompt = buildSystemPrompt(request);
    const userPrompt = buildUserPrompt(request);

    const response = await openaiClient.chat.completions.create({
      model: model.modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: request.temperature || model.temperature,
      max_tokens: request.maxLength || model.maxTokens,
    });

    const content = response.choices[0]?.message?.content || "";
    const tokensUsed = response.usage?.total_tokens || 0;

    return {
      success: true,
      content,
      modelUsed: model.name,
      provider: "openai",
      tokensUsed,
      generatedAt: new Date(),
      platform: request.platform,
      tone: request.tone,
    };
  } catch (error) {
    console.error("[Genkit] Erro ao gerar com OpenAI:", error);
    throw error;
  }
}

/**
 * Gera conteúdo usando modelos proprietários MMN
 */
async function generateWithProprietary(
  request: ContentGenerationRequest,
  model: AIModelConfig
): Promise<ContentGenerationResponse> {
  // Placeholder para modelos proprietários
  throw new Error(
    `Modelo proprietário ${model.id} ainda não está disponível. Aguardando conclusão do fine-tuning.`
  );
}

/**
 * Constrói o prompt do sistema baseado na requisição
 */
function buildSystemPrompt(request: ContentGenerationRequest): string {
  let prompt = "Você é um especialista em geração de conteúdo de marketing.";

  if (request.platform) {
    prompt += ` Gere conteúdo otimizado para ${request.platform}.`;
  }

  if (request.tone) {
    prompt += ` Use um tom ${request.tone}.`;
  }

  if (request.includeHashtags) {
    prompt += " Inclua hashtags relevantes.";
  }

  if (request.includeEmojis) {
    prompt += " Inclua emojis apropriados.";
  }

  if (request.maxLength) {
    prompt += ` Limite a resposta a ${request.maxLength} caracteres.`;
  }

  return prompt;
}

/**
 * Constrói o prompt do usuário
 */
function buildUserPrompt(request: ContentGenerationRequest): string {
  return request.prompt;
}

/**
 * Retorna lista de modelos disponíveis
 */
export function getAvailableModels(): AIModelConfig[] {
  return aiModels.filter((m) => m.isActive);
}

/**
 * Retorna informações de um modelo específico
 */
export function getModelInfo(modelId: string): AIModelConfig | undefined {
  return aiModels.find((m) => m.id === modelId);
}

/**
 * Ativa um modelo (útil para modelos proprietários após fine-tuning)
 */
export function activateModel(modelId: string): boolean {
  const model = aiModels.find((m) => m.id === modelId);
  if (model) {
    model.isActive = true;
    console.log(`[Genkit] Modelo ativado: ${modelId}`);
    return true;
  }
  return false;
}

/**
 * Desativa um modelo (útil para manutenção)
 */
export function deactivateModel(modelId: string): boolean {
  const model = aiModels.find((m) => m.id === modelId);
  if (model) {
    model.isActive = false;
    console.log(`[Genkit] Modelo desativado: ${modelId}`);
    return true;
  }
  return false;
}

/**
 * Retorna estatísticas de uso de modelos
 */
export function getModelStats() {
  return {
    totalModels: aiModels.length,
    activeModels: aiModels.filter((m) => m.isActive).length,
    providers: {
      google: aiModels.filter((m) => m.provider === "google").length,
      openai: aiModels.filter((m) => m.provider === "openai").length,
      proprietary: aiModels.filter((m) => m.provider === "proprietary").length,
    },
    models: aiModels.map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      isActive: m.isActive,
    })),
  };
}
