/**
 * Serviço de Integração com LTX-2
 * Gerencia geração de vídeos usando pipelines da Lightricks LTX-2
 */

import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";

export type LTX2Pipeline =
  | "TI2VidTwoStagesPipeline"
  | "TI2VidTwoStagesHQPipeline"
  | "TI2VidOneStagePipeline"
  | "DistilledPipeline"
  | "ICLoraPipeline"
  | "KeyframeInterpolationPipeline"
  | "A2VidPipelineTwoStage"
  | "RetakePipeline"
  | "HDRICLoraPipeline"
  | "LipDubPipeline";

export type QuantizationPolicy = "fp8-cast" | "fp8-scaled-mm" | "none";

export interface LTX2GenerationConfig {
  pipeline: LTX2Pipeline;
  prompt: string;
  duration?: number; // em segundos
  width?: number;
  height?: number;
  fps?: number;
  steps?: number;
  quantization?: QuantizationPolicy;
  enhancePrompt?: boolean;
  skipMemoryCleanup?: boolean;
}

export interface LTX2GenerationResult {
  videoPath: string;
  duration: number;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  fileSize: number;
  generatedAt: Date;
}

/**
 * Configurações de pipeline recomendadas
 */
export const PIPELINE_CONFIGS: Record<LTX2Pipeline, Partial<LTX2GenerationConfig>> = {
  TI2VidTwoStagesPipeline: {
    duration: 10,
    width: 1280,
    height: 720,
    fps: 24,
    steps: 40,
    quantization: "none",
  },
  TI2VidTwoStagesHQPipeline: {
    duration: 10,
    width: 1280,
    height: 720,
    fps: 24,
    steps: 30, // Fewer steps, better quality with HQ sampler
    quantization: "none",
  },
  TI2VidOneStagePipeline: {
    duration: 8,
    width: 768,
    height: 432,
    fps: 24,
    steps: 20,
    quantization: "fp8-cast",
  },
  DistilledPipeline: {
    duration: 8,
    width: 768,
    height: 432,
    fps: 24,
    steps: 8, // Predefined sigmas: 8 steps stage 1, 4 steps stage 2
    quantization: "fp8-cast",
  },
  ICLoraPipeline: {
    duration: 8,
    width: 768,
    height: 432,
    fps: 24,
    steps: 20,
    quantization: "fp8-cast",
  },
  KeyframeInterpolationPipeline: {
    duration: 5,
    width: 1024,
    height: 576,
    fps: 24,
    steps: 15,
    quantization: "none",
  },
  A2VidPipelineTwoStage: {
    duration: 10,
    width: 1280,
    height: 720,
    fps: 24,
    steps: 40,
    quantization: "none",
  },
  RetakePipeline: {
    duration: 10,
    width: 1280,
    height: 720,
    fps: 24,
    steps: 30,
    quantization: "none",
  },
  HDRICLoraPipeline: {
    duration: 8,
    width: 1024,
    height: 576,
    fps: 24,
    steps: 25,
    quantization: "none",
  },
  LipDubPipeline: {
    duration: 10,
    width: 1024,
    height: 576,
    fps: 24,
    steps: 20,
    quantization: "fp8-cast",
  },
};

/**
 * Diretrizes de prompt cinematográfico para LTX-2
 */
export const PROMPT_GUIDELINES = {
  structure: [
    "Comece com a ação principal em uma única frase",
    "Adicione detalhes específicos sobre movimentos e gestos",
    "Descreva aparências de personagens/objetos com precisão",
    "Inclua detalhes de fundo e ambiente",
    "Especifique ângulos de câmera e movimentos",
    "Descreva iluminação e cores",
    "Anote mudanças ou eventos repentinos",
  ],
  maxWords: 200,
  tone: "Pense como um cinematógrafo descrevendo uma lista de planos",
  format: "Descrição única e fluida em um parágrafo",
};

/**
 * Otimizações de performance recomendadas
 */
export const PERFORMANCE_OPTIMIZATIONS = {
  fp8Quantization: {
    enabled: true,
    description: "Reduz footprint de memória em ~50%",
    compatible: ["TI2VidOneStagePipeline", "DistilledPipeline", "ICLoraPipeline", "LipDubPipeline"],
  },
  flashAttention: {
    enabled: false,
    description: "Acelera atenção em GPUs Hopper/Blackwell",
    requires: "GPU CUDA com suporte a FlashAttention",
  },
  gradientEstimation: {
    enabled: true,
    description: "Reduz steps de 40 para 20-30 mantendo qualidade",
    impact: "Reduz tempo de geração em ~50%",
  },
  skipMemoryCleanup: {
    enabled: false,
    description: "Desativa limpeza automática entre estágios",
    requires: "VRAM suficiente (24GB+ recomendado)",
  },
};

/**
 * Classe para gerenciar geração de vídeos com LTX-2
 */
export class LTX2VideoGenerator {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey?: string, apiUrl?: string) {
    this.apiKey = apiKey || process.env.LTX2_API_KEY || "";
    this.apiUrl = apiUrl || process.env.LTX2_API_URL || "https://api.ltx.video/v1";
  }

  /**
   * Gera um vídeo usando LTX-2
   */
  async generateVideo(config: LTX2GenerationConfig): Promise<LTX2GenerationResult> {
    try {
      // Validar configuração
      this.validateConfig(config);

      // Aprimorar prompt se solicitado
      let enhancedPrompt = config.prompt;
      if (config.enhancePrompt) {
        enhancedPrompt = await this.enhancePrompt(config.prompt);
      }

      // Chamar API LTX-2
      const result = await this.callLTX2API({
        ...config,
        prompt: enhancedPrompt,
      });

      return result;
    } catch (error) {
      console.error("[LTX2 Service] Error generating video:", error);
      throw new Error(`Failed to generate video: ${(error as Error).message}`);
    }
  }

  /**
   * Valida configuração de geração
   */
  private validateConfig(config: LTX2GenerationConfig): void {
    if (!config.prompt || config.prompt.trim().length === 0) {
      throw new Error("Prompt cannot be empty");
    }

    if (config.prompt.split(" ").length > PROMPT_GUIDELINES.maxWords) {
      throw new Error(`Prompt exceeds maximum of ${PROMPT_GUIDELINES.maxWords} words`);
    }

    if (!PIPELINE_CONFIGS[config.pipeline]) {
      throw new Error(`Unknown pipeline: ${config.pipeline}`);
    }

    if (config.duration && (config.duration < 1 || config.duration > 60)) {
      throw new Error("Duration must be between 1 and 60 seconds");
    }
  }

  /**
   * Aprimora prompt usando LLM
   */
  private async enhancePrompt(scriptContent: string): Promise<string> {
    const systemPrompt = `Você é um especialista em cinematografia e um roteirista de prompts para modelos de geração de vídeo como o LTX-2. Sua tarefa é transformar um roteiro de vídeo-aula em um prompt cinematográfico detalhado, seguindo as diretrizes de prompt para LTX-2.

DIRETRIZES DE PROMPT CINEMATOGRÁFICO:
- Estrutura: ${PROMPT_GUIDELINES.structure.join("; ")}
- Tom: ${PROMPT_GUIDELINES.tone}
- Formato: ${PROMPT_GUIDELINES.format}
- Limite de Palavras: Máximo de ${PROMPT_GUIDELINES.maxWords} palavras.

Transforme o roteiro fornecido em um prompt cinematográfico único e fluido, focado em descrições visuais, movimentos de câmera, iluminação, ambiente e ações dos personagens.`;

    const userPrompt = `Roteiro da vídeo-aula:
${scriptContent}`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      if (response.choices && response.choices[0] && response.choices[0].message) {
        const content = response.choices[0].message.content;
        if (typeof content === "string") {
          return content;
        } else if (Array.isArray(content)) {
          return content.map((c: any) => c.text || "").join("");
        }
      }
      throw new Error("Invalid LLM response format");
    } catch (error) {
      console.error("[LTX2 Service] Error enhancing prompt:", error);
      throw new Error(`Failed to enhance prompt: ${(error as Error).message}`);
    }
  }

  /**
   * Chama API LTX-2 para gerar vídeo
   */
  private async callLTX2API(config: LTX2GenerationConfig): Promise<LTX2GenerationResult> {
    // TODO: Implementar chamada real à API LTX-2
    // Por enquanto, retorna resultado mockado
    return {
      videoPath: `/videos/generated/${Date.now()}.mp4`,
      duration: config.duration || 10,
      resolution: {
        width: config.width || 1280,
        height: config.height || 720,
      },
      fps: config.fps || 24,
      fileSize: 1024 * 1024 * 50, // 50MB mockado
      generatedAt: new Date(),
    };
  }

  /**
   * Obtém configuração recomendada para um pipeline
   */
  getRecommendedConfig(pipeline: LTX2Pipeline): Partial<LTX2GenerationConfig> {
    return PIPELINE_CONFIGS[pipeline] || {};
  }

  /**
   * Lista pipelines disponíveis
   */
  getAvailablePipelines(): LTX2Pipeline[] {
    return Object.keys(PIPELINE_CONFIGS) as LTX2Pipeline[];
  }

  /**
   * Obtém otimizações recomendadas
   */
  getOptimizations(): typeof PERFORMANCE_OPTIMIZATIONS {
    return PERFORMANCE_OPTIMIZATIONS;
  }
}

/**
 * Instância global do gerador LTX-2
 */
export const ltx2Generator = new LTX2VideoGenerator();
