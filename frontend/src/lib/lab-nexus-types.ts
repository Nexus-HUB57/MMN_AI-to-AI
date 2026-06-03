/**
 * Lab Nexus · Tipos compartilhados frontend
 * Reflete o contrato exposto pelo backend (tRPC + REST).
 */

export type LabNexusProviderId =
  | "openai"
  | "anthropic"
  | "google"
  | "deepseek"
  | "minimax";

export type LabNexusRole = "system" | "user" | "assistant";

export interface LabNexusMessage {
  role: LabNexusRole;
  content: string;
}

export interface LabNexusProviderSummary {
  id: LabNexusProviderId;
  label: string;
  defaultModel: string;
  availableModels: string[];
  modalities: Array<"text" | "vision" | "audio" | "image-generation" | "code" | "video">;
  notes: string;
  configured: boolean;
}

export interface LabNexusChatResponse {
  providerId: LabNexusProviderId;
  model: string;
  message: LabNexusMessage;
  mode: "live" | "demo";
  tokensUsed?: number;
  latencyMs: number;
}

export const LAB_NEXUS_FALLBACK_PROVIDERS: LabNexusProviderSummary[] = [
  {
    id: "openai",
    label: "OpenAI · GPT",
    defaultModel: "gpt-4o-mini",
    availableModels: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "o4-mini"],
    modalities: ["text", "vision", "image-generation"],
    notes: "Chat Completions e Responses API.",
    configured: false,
  },
  {
    id: "anthropic",
    label: "Anthropic · Claude",
    defaultModel: "claude-3-5-sonnet-latest",
    availableModels: [
      "claude-3-5-sonnet-latest",
      "claude-3-5-haiku-latest",
      "claude-3-opus-latest",
    ],
    modalities: ["text", "vision"],
    notes: "Suporta tool use e Claude Skills.",
    configured: false,
  },
  {
    id: "google",
    label: "Google · Gemini",
    defaultModel: "gemini-2.0-flash",
    availableModels: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    modalities: ["text", "vision", "audio"],
    notes: "Generative Language API.",
    configured: false,
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    defaultModel: "deepseek-chat",
    availableModels: ["deepseek-chat", "deepseek-reasoner"],
    modalities: ["text", "code"],
    notes: "Compatível com formato OpenAI.",
    configured: false,
  },
  {
    id: "minimax",
    label: "MiniMax",
    defaultModel: "MiniMax-Text-01",
    availableModels: ["MiniMax-Text-01", "abab6.5-chat"],
    modalities: ["text", "audio", "video"],
    notes: "Hub multimodal (MiniMax-01 open weights).",
    configured: false,
  },
];

export interface LabNexusPromptTemplate {
  id: string;
  title: string;
  category: "copy" | "estrategia" | "analise" | "design" | "operacao";
  prompt: string;
  description: string;
}

export const LAB_NEXUS_PROMPT_TEMPLATES: LabNexusPromptTemplate[] = [
  {
    id: "headline-persuasiva",
    title: "Headline persuasiva",
    category: "copy",
    description: "Gera 5 headlines no estilo de Eugene Schwartz para uma oferta.",
    prompt:
      "Você é um copywriter sênior. Gere 5 headlines persuasivas no estilo de Eugene Schwartz para a oferta: {{oferta}}. Use gatilho de prova, especificidade numérica e contraste antes/depois.",
  },
  {
    id: "analise-funil",
    title: "Análise de funil",
    category: "analise",
    description: "Diagnóstico rápido de funil de vendas em três níveis.",
    prompt:
      "Atue como analista de growth. Diagnostique o funil descrito a seguir em três níveis: aquisição, conversão e retenção. Funil: {{contexto}}. Apresente 3 hipóteses priorizadas pelo impacto x esforço.",
  },
  {
    id: "plano-90-dias",
    title: "Plano de conteúdo 90 dias",
    category: "estrategia",
    description: "Calendário editorial trimestral para um afiliado Nexus.",
    prompt:
      "Crie um calendário editorial de 90 dias para um afiliado Nexus do nicho {{nicho}} com 3 posts por semana, balanceando educacional, prova social e oferta.",
  },
  {
    id: "judge-revisor",
    title: "Judge Revisor",
    category: "operacao",
    description: "Avalia se a resposta de outra IA está alinhada com a governança Nexus.",
    prompt:
      "Você é o Judge Revisor do runtime Nexus. Avalie a resposta abaixo e classifique como APROVADA, AJUSTAR ou REJEITADA com justificativa em 3 bullets. Resposta: {{resposta}}.",
  },
];
