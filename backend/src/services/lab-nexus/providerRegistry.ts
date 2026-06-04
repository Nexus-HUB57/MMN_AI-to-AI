/**
 * Lab Nexus · Provider Registry
 * --------------------------------------------------------------
 * Catálogo de provedores de IA conectados ao Chat Bot do Lab Nexus.
 * Mantém as URLs oficiais e o nome da variável de ambiente que
 * carrega a API key (que NUNCA é exposta ao navegador).
 */

export type LabNexusProviderId =
  | "openai"
  | "anthropic"
  | "google"
  | "deepseek"
  | "minimax";

export interface LabNexusProvider {
  id: LabNexusProviderId;
  label: string;
  defaultModel: string;
  availableModels: string[];
  envKey: string;
  envKeyFallback?: string;
  restEndpoint: string;
  modalities: Array<"text" | "vision" | "audio" | "image-generation" | "code" | "video">;
  notes: string;
}

export const LAB_NEXUS_PROVIDERS: Record<LabNexusProviderId, LabNexusProvider> = {
  openai: {
    id: "openai",
    label: "OpenAI · GPT",
    defaultModel: "gpt-4o-mini",
    availableModels: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "o4-mini"],
    envKey: "OPENAI_API_KEY",
    envKeyFallback: "OPENAI_API_KEY_FALLBACK",
    restEndpoint: "https://api.openai.com/v1/chat/completions",
    modalities: ["text", "vision", "image-generation"],
    notes: "Compatível com Chat Completions e Responses API.",
  },
  anthropic: {
    id: "anthropic",
    label: "Anthropic · Claude",
    defaultModel: "claude-3-5-sonnet-latest",
    availableModels: [
      "claude-3-5-sonnet-latest",
      "claude-3-5-haiku-latest",
      "claude-3-opus-latest",
    ],
    envKey: "ANTHROPIC_API_KEY",
    envKeyFallback: "ANTHROPIC_API_KEY_FALLBACK",
    restEndpoint: "https://api.anthropic.com/v1/messages",
    modalities: ["text", "vision"],
    notes: "Suporta tool use e Claude Skills.",
  },
  google: {
    id: "google",
    label: "Google · Gemini",
    defaultModel: "gemini-2.0-flash",
    availableModels: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    envKey: "GOOGLE_GEMINI_API_KEY",
    envKeyFallback: "GOOGLE_GEMINI_API_KEY_FALLBACK",
    restEndpoint: "https://generativelanguage.googleapis.com/v1beta",
    modalities: ["text", "vision", "audio"],
    notes: "Integração via Generative Language API.",
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    defaultModel: "deepseek-chat",
    availableModels: ["deepseek-chat", "deepseek-reasoner"],
    envKey: "DEEPSEEK_API_KEY",
    envKeyFallback: "DEEPSEEK_API_KEY_FALLBACK",
    restEndpoint: "https://api.deepseek.com/v1/chat/completions",
    modalities: ["text", "code"],
    notes: "API compatível com formato OpenAI Chat Completions.",
  },
  minimax: {
    id: "minimax",
    label: "MiniMax",
    defaultModel: "MiniMax-M2",
    availableModels: ["MiniMax-M2", "MiniMax-M1", "MiniMax-Text-01"],
    envKey: "MINIMAX_API_KEY",
    envKeyFallback: "MINIMAX_API_KEY_FALLBACK",
    restEndpoint: "https://api.minimaxi.chat/v1/text/chatcompletion_v2",
    modalities: ["text", "audio", "video"],
    notes: "Hub multimodal com pesos abertos (MiniMax-M1/M2).",
  },
};

export function listLabNexusProviders(): LabNexusProvider[] {
  return Object.values(LAB_NEXUS_PROVIDERS);
}

export function isProviderConfigured(id: LabNexusProviderId): boolean {
  const provider = LAB_NEXUS_PROVIDERS[id];
  if (!provider) return false;
  return Boolean(
    process.env[provider.envKey]?.trim() ||
      (provider.envKeyFallback ? process.env[provider.envKeyFallback]?.trim() : ""),
  );
}

export function getProviderPublicSummary() {
  return listLabNexusProviders().map((provider) => ({
    id: provider.id,
    label: provider.label,
    defaultModel: provider.defaultModel,
    availableModels: provider.availableModels,
    modalities: provider.modalities,
    notes: provider.notes,
    configured: isProviderConfigured(provider.id),
  }));
}
