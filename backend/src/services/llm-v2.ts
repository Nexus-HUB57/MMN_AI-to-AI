import { OpenAI } from "openai";

// Tipos de modelos suportados
export type ModelProvider = "openai" | "proprietary" | "fallback";
export type ModelType = "gpt-4.1-mini" | "mmn-copywriting-v1" | "mmn-strategy-v1" | "llama-2" | "mistral";

interface ModelConfig {
  provider: ModelProvider;
  modelId: string;
  maxTokens?: number;
  temperature?: number;
  isAvailable: boolean;
}

interface LLMInvokeOptions {
  messages: any[];
  response_format?: any;
  modelType?: ModelType;
  fallbackToGeneric?: boolean;
}

interface LLMResponse {
  content: string;
  modelUsed: string;
  provider: ModelProvider;
  tokensUsed: number;
}

// Configuração de modelos disponíveis
const modelRegistry: Record<ModelType, ModelConfig> = {
  "gpt-4.1-mini": {
    provider: "openai",
    modelId: "gpt-4.1-mini",
    maxTokens: 4096,
    temperature: 0.7,
    isAvailable: true,
  },
  "mmn-copywriting-v1": {
    provider: "proprietary",
    modelId: "mmn-copywriting-v1",
    maxTokens: 2048,
    temperature: 0.8,
    isAvailable: false, // Será ativado após fine-tuning
  },
  "mmn-strategy-v1": {
    provider: "proprietary",
    modelId: "mmn-strategy-v1",
    maxTokens: 3000,
    temperature: 0.6,
    isAvailable: false, // Será ativado após fine-tuning
  },
  "llama-2": {
    provider: "proprietary",
    modelId: "llama-2-70b",
    maxTokens: 4096,
    temperature: 0.7,
    isAvailable: false, // Requer hospedagem própria
  },
  "mistral": {
    provider: "proprietary",
    modelId: "mistral-7b",
    maxTokens: 4096,
    temperature: 0.7,
    isAvailable: false, // Requer hospedagem própria
  },
};

// Cliente OpenAI
const openaiClient = new OpenAI();

/**
 * Invoca um modelo de LLM com suporte a roteamento dinâmico
 * @param options - Opções de invocação incluindo mensagens e tipo de modelo
 * @returns Resposta estruturada com conteúdo, modelo usado e tokens consumidos
 */
export async function invokeLLM(options: LLMInvokeOptions): Promise<LLMResponse> {
  const {
    messages,
    response_format,
    modelType = "gpt-4.1-mini",
    fallbackToGeneric = true,
  } = options;

  try {
    // Determinar qual modelo usar
    const selectedModel = modelRegistry[modelType];

    if (!selectedModel) {
      console.warn(`[LLM] Modelo desconhecido: ${modelType}. Usando fallback.`);
      return invokeOpenAI(messages, response_format, "gpt-4.1-mini");
    }

    // Se o modelo proprietário não está disponível, usar fallback
    if (!selectedModel.isAvailable && fallbackToGeneric) {
      console.warn(
        `[LLM] Modelo ${modelType} não disponível. Usando fallback genérico.`
      );
      return invokeOpenAI(messages, response_format, "gpt-4.1-mini");
    }

    // Rotear para o provedor apropriado
    switch (selectedModel.provider) {
      case "openai":
        return invokeOpenAI(messages, response_format, selectedModel.modelId);
      case "proprietary":
        return invokeProprietaryModel(messages, response_format, selectedModel);
      case "fallback":
      default:
        return invokeOpenAI(messages, response_format, "gpt-4.1-mini");
    }
  } catch (error) {
    console.error("[LLM] Erro ao invocar LLM:", error);
    throw error;
  }
}

/**
 * Invoca um modelo da OpenAI
 */
async function invokeOpenAI(
  messages: any[],
  response_format: any,
  model: string
): Promise<LLMResponse> {
  try {
    const response = await openaiClient.chat.completions.create({
      model,
      messages,
      response_format,
      temperature: 0.7,
    });

    const content =
      response.choices[0]?.message?.content || "Sem resposta";
    const tokensUsed = response.usage?.total_tokens || 0;

    return {
      content,
      modelUsed: model,
      provider: "openai",
      tokensUsed,
    };
  } catch (error) {
    console.error("[LLM] Erro ao invocar OpenAI:", error);
    throw error;
  }
}

/**
 * Invoca um modelo proprietário (placeholder para integração futura)
 * Este método será expandido para suportar:
 * - Modelos fine-tuned hospedados na OpenAI
 * - Modelos open-source hospedados localmente (Llama, Mistral)
 * - APIs de terceiros (Replicate, Together AI, etc.)
 */
async function invokeProprietaryModel(
  messages: any[],
  response_format: any,
  modelConfig: ModelConfig
): Promise<LLMResponse> {
  console.log(
    `[LLM] Invocando modelo proprietário: ${modelConfig.modelId}`
  );

  // Placeholder: Por enquanto, retorna um erro indicando que o modelo não está pronto
  throw new Error(
    `Modelo proprietário ${modelConfig.modelId} ainda não está disponível. ` +
      `Aguardando conclusão do fine-tuning.`
  );

  // Implementação futura:
  // switch (modelConfig.modelId) {
  //   case "mmn-copywriting-v1":
  //     return invokeFineTunedOpenAI(messages, response_format, modelConfig);
  //   case "llama-2-70b":
  //     return invokeLlamaViaReplicate(messages, response_format, modelConfig);
  //   case "mistral-7b":
  //     return invokeMistralViaTogether(messages, response_format, modelConfig);
  //   default:
  //     throw new Error(`Modelo proprietário desconhecido: ${modelConfig.modelId}`);
  // }
}

/**
 * Retorna o status de disponibilidade de todos os modelos
 */
export function getModelStatus(): Record<ModelType, boolean> {
  const status: Record<ModelType, boolean> = {} as Record<ModelType, boolean>;
  for (const [key, config] of Object.entries(modelRegistry)) {
    status[key as ModelType] = config.isAvailable;
  }
  return status;
}

/**
 * Ativa um modelo proprietário (chamado após conclusão do fine-tuning)
 */
export function activateProprietaryModel(modelType: ModelType): void {
  const model = modelRegistry[modelType];
  if (model && model.provider === "proprietary") {
    model.isAvailable = true;
    console.log(`[LLM] Modelo proprietário ativado: ${modelType}`);
  } else {
    console.warn(`[LLM] Não foi possível ativar o modelo: ${modelType}`);
  }
}

/**
 * Desativa um modelo (útil para manutenção ou rollback)
 */
export function deactivateModel(modelType: ModelType): void {
  const model = modelRegistry[modelType];
  if (model) {
    model.isAvailable = false;
    console.log(`[LLM] Modelo desativado: ${modelType}`);
  }
}

// Manter compatibilidade com a versão anterior
export async function invokeLLMLegacy(options: {
  messages: any[];
  response_format?: any;
}) {
  const response = await invokeLLM({
    messages: options.messages,
    response_format: options.response_format,
    modelType: "gpt-4.1-mini",
  });
  return response;
}
