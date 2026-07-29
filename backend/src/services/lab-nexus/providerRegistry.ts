/**
 * providerRegistry — Lab Nexus Provider Registry
 * --------------------------------------------------------------
 * Registro de provedores de LLM disponíveis no Lab Nexus Sandbox.
 * Mantém configurações de modelos, quotas e chaves de API no servidor.
 */

export type LabNexusProviderId = "openai" | "anthropic" | "google" | "meta" | "xai";

export interface LabNexusProvider {
  id: LabNexusProviderId;
  name: string;
  models: string[];
  maxTokens: number;
  configured: boolean;
  /** Quota diária por tier (estrategista / elite) */
  dailyQuota: { estrategista: number; elite: number };
}

export const LAB_NEXUS_PROVIDERS: Record<LabNexusProviderId, LabNexusProvider> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "o1-preview", "o1-mini"],
    maxTokens: 128000,
    configured: !!process.env.OPENAI_API_KEY,
    dailyQuota: { estrategista: 50, elite: 200 },
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    models: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
    maxTokens: 200000,
    configured: !!process.env.ANTHROPIC_API_KEY,
    dailyQuota: { estrategista: 50, elite: 200 },
  },
  google: {
    id: "google",
    name: "Google DeepMind",
    models: ["gemini-2.5-pro", "gemini-2.5-flash"],
    maxTokens: 1000000,
    configured: !!process.env.GOOGLE_AI_API_KEY,
    dailyQuota: { estrategista: 30, elite: 150 },
  },
  meta: {
    id: "meta",
    name: "Meta AI",
    models: ["llama-3.1-405b", "llama-3.1-70b"],
    maxTokens: 128000,
    configured: !!process.env.META_AI_API_KEY,
    dailyQuota: { estrategista: 20, elite: 100 },
  },
  xai: {
    id: "xai",
    name: "xAI",
    models: ["grok-3", "grok-3-mini"],
    maxTokens: 131072,
    configured: !!process.env.XAI_API_KEY,
    dailyQuota: { estrategista: 20, elite: 100 },
  },
};

/** Summary público sem expor chaves */
export function getProviderPublicSummary() {
  return Object.values(LAB_NEXUS_PROVIDERS).map((p) => ({
    id: p.id,
    name: p.name,
    models: p.models,
    maxTokens: p.maxTokens,
    configured: p.configured,
    dailyQuota: p.dailyQuota,
  }));
}

/** Retorna um provedor por ID */
export function getProvider(id: LabNexusProviderId): LabNexusProvider | undefined {
  return LAB_NEXUS_PROVIDERS[id];
}
