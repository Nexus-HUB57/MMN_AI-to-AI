/**
 * Lab Nexus · Chat Service
 * --------------------------------------------------------------
 * Serviço unificado que encaminha mensagens do Chat Bot Lab Nexus
 * para a API oficial do provedor selecionado (OpenAI, Anthropic,
 * Google, DeepSeek, MiniMax). Mantém formato comum de entrada/saída,
 * fallback de modo demo quando nenhuma chave está configurada,
 * governança por tier e ledger diário de uso.
 */

import {
  LAB_NEXUS_PROVIDERS,
  type LabNexusProvider,
  type LabNexusProviderId,
  isProviderConfigured,
} from "./providerRegistry";
import {
  assertLabNexusUsageAvailable,
  estimateLabNexusInputTokens,
  recordLabNexusUsage,
  type LabNexusTier,
  type LabNexusUsageSnapshot,
} from "./usageLedger";

export type LabNexusRole = "system" | "user" | "assistant";

export interface LabNexusMessage {
  role: LabNexusRole;
  content: string;
}

export interface LabNexusChatRequest {
  providerId: LabNexusProviderId;
  model?: string;
  messages: LabNexusMessage[];
  temperature?: number;
  maxTokens?: number;
  affiliateId?: number | string;
  tier?: LabNexusTier;
}

export interface LabNexusChatResponse {
  providerId: LabNexusProviderId;
  model: string;
  message: LabNexusMessage;
  mode: "live" | "demo";
  tokensUsed?: number;
  latencyMs: number;
  trace?: {
    affiliateId: number | string | null;
    tier: LabNexusTier;
    ceilingTokens: number;
    usageBefore: LabNexusUsageSnapshot;
    usageAfter: LabNexusUsageSnapshot;
  };
}

const TIER_LIMITS: Record<LabNexusTier, { maxTokens: number; perDay: number }> = {
  iniciante: { maxTokens: 0, perDay: 0 },
  operador: { maxTokens: 2000, perDay: 50 },
  estrategista: { maxTokens: 8000, perDay: 500 },
  elite: { maxTokens: 32000, perDay: 5000 },
};

function resolveTierLimit(tier: LabNexusTier) {
  return TIER_LIMITS[tier] ?? TIER_LIMITS.operador;
}

function clampMaxTokens(requested: number | undefined, ceiling: number) {
  const fallback = Math.min(1024, ceiling);
  if (!requested || requested <= 0) return fallback;
  return Math.min(requested, ceiling);
}

async function callOpenAILike(
  provider: LabNexusProvider,
  apiKey: string,
  request: LabNexusChatRequest,
  ceiling: number,
): Promise<{ content: string; tokens?: number; raw: unknown }> {
  const body = {
    model: request.model ?? provider.defaultModel,
    messages: request.messages,
    temperature: request.temperature ?? 0.4,
    max_tokens: clampMaxTokens(request.maxTokens, ceiling),
  };

  const response = await fetch(provider.restEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${provider.label} respondeu ${response.status}: ${text.slice(0, 240)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { total_tokens?: number };
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  return { content, tokens: data.usage?.total_tokens, raw: data };
}

async function callAnthropic(
  provider: LabNexusProvider,
  apiKey: string,
  request: LabNexusChatRequest,
  ceiling: number,
): Promise<{ content: string; tokens?: number; raw: unknown }> {
  const system = request.messages.find((m) => m.role === "system")?.content;
  const messages = request.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

  const response = await fetch(provider.restEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: request.model ?? provider.defaultModel,
      max_tokens: clampMaxTokens(request.maxTokens, ceiling),
      temperature: request.temperature ?? 0.4,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${provider.label} respondeu ${response.status}: ${text.slice(0, 240)}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  const content = (data.content ?? [])
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
  const tokens = (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0);
  return { content, tokens, raw: data };
}

async function callGemini(
  provider: LabNexusProvider,
  apiKey: string,
  request: LabNexusChatRequest,
  ceiling: number,
): Promise<{ content: string; tokens?: number; raw: unknown }> {
  const model = request.model ?? provider.defaultModel;
  const systemInstruction = request.messages.find((m) => m.role === "system")?.content;
  const contents = request.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const url = `${provider.restEndpoint}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      generationConfig: {
        temperature: request.temperature ?? 0.4,
        maxOutputTokens: clampMaxTokens(request.maxTokens, ceiling),
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${provider.label} respondeu ${response.status}: ${text.slice(0, 240)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: { totalTokenCount?: number };
  };
  const content = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("");
  return { content, tokens: data.usageMetadata?.totalTokenCount, raw: data };
}

type ProviderCredential = {
  source: "primary" | "fallback";
  envKey: string;
  value: string;
};

function readProviderCredentials(provider: LabNexusProvider): ProviderCredential[] {
  const credentials: ProviderCredential[] = [];
  const primary = process.env[provider.envKey]?.trim();
  if (primary) {
    credentials.push({ source: "primary", envKey: provider.envKey, value: primary });
  }

  if (provider.envKeyFallback) {
    const fallback = process.env[provider.envKeyFallback]?.trim();
    if (fallback) {
      credentials.push({ source: "fallback", envKey: provider.envKeyFallback, value: fallback });
    }
  }

  return credentials;
}

function describeProviderCredentialKeys(provider: LabNexusProvider) {
  return [provider.envKey, provider.envKeyFallback].filter(Boolean).join(" ou ");
}

async function executeProviderCall(
  provider: LabNexusProvider,
  apiKey: string,
  request: LabNexusChatRequest,
  ceiling: number,
) {
  if (provider.id === "openai" || provider.id === "deepseek" || provider.id === "minimax") {
    return callOpenAILike(provider, apiKey, request, ceiling);
  }
  if (provider.id === "anthropic") {
    return callAnthropic(provider, apiKey, request, ceiling);
  }
  if (provider.id === "google") {
    return callGemini(provider, apiKey, request, ceiling);
  }
  throw new Error(`Provedor Lab Nexus ainda não suportado: ${provider.id}`);
}

function buildDemoMessage(provider: LabNexusProvider, request: LabNexusChatRequest) {
  const lastUser = [...request.messages].reverse().find((m) => m.role === "user");
  const echo = lastUser?.content?.slice(0, 280) ?? "(sem mensagem)";
  return {
    role: "assistant" as const,
    content: [
      `[Modo demo · ${provider.label}]`,
      `Chave de API ainda não configurada no servidor (${describeProviderCredentialKeys(provider)}).`,
      "Sua mensagem foi recebida com sucesso e seria encaminhada à API oficial assim que a credencial estiver disponível.",
      `Eco da última mensagem: \"${echo}\"`,
    ].join("\n\n"),
  };
}

function finalizeResponse(input: {
  provider: LabNexusProvider;
  request: LabNexusChatRequest;
  tier: LabNexusTier;
  ceiling: number;
  usageBefore: LabNexusUsageSnapshot;
  estimatedInputTokens: number;
  startedAt: number;
  mode: "live" | "demo";
  message: LabNexusMessage;
  tokensUsed?: number;
}): LabNexusChatResponse {
  const estimatedOutputTokens = input.tokensUsed
    ? Math.max(0, input.tokensUsed - input.estimatedInputTokens)
    : Math.max(1, Math.ceil((input.message.content?.length ?? 0) / 4));

  const usageAfter = recordLabNexusUsage({
    affiliateId: input.request.affiliateId,
    tier: input.tier,
    estimatedInputTokens: input.estimatedInputTokens,
    tokensOut: estimatedOutputTokens,
  });

  return {
    providerId: input.provider.id,
    model: input.request.model ?? input.provider.defaultModel,
    mode: input.mode,
    latencyMs: Date.now() - input.startedAt,
    tokensUsed: input.tokensUsed,
    message: input.message,
    trace: {
      affiliateId: input.request.affiliateId ?? null,
      tier: input.tier,
      ceilingTokens: input.ceiling,
      usageBefore: input.usageBefore,
      usageAfter,
    },
  };
}

export async function runLabNexusChat(request: LabNexusChatRequest): Promise<LabNexusChatResponse> {
  const provider = LAB_NEXUS_PROVIDERS[request.providerId];
  if (!provider) {
    throw new Error(`Provedor Lab Nexus desconhecido: ${request.providerId}`);
  }

  const tier: LabNexusTier = request.tier ?? "operador";
  if (tier === "iniciante") {
    throw new Error("Acesso negado: o Chat Bot Lab Nexus requer tier Operador ou superior (PD/SCC).");
  }

  const limit = resolveTierLimit(tier);
  const ceiling = Math.max(256, limit.maxTokens || 2000);
  const startedAt = Date.now();
  const estimatedInputTokens = estimateLabNexusInputTokens(request.messages);
  const usageBefore = assertLabNexusUsageAvailable({
    affiliateId: request.affiliateId,
    tier,
  });
  const credentials = readProviderCredentials(provider);

  if (!credentials.length || !isProviderConfigured(provider.id)) {
    return finalizeResponse({
      provider,
      request,
      tier,
      ceiling,
      usageBefore,
      estimatedInputTokens,
      startedAt,
      mode: "demo",
      message: buildDemoMessage(provider, request),
    });
  }

  const errors: string[] = [];

  for (const credential of credentials) {
    try {
      const result = await executeProviderCall(provider, credential.value, request, ceiling);
      return finalizeResponse({
        provider,
        request,
        tier,
        ceiling,
        usageBefore,
        estimatedInputTokens,
        startedAt,
        mode: "live",
        tokensUsed: result.tokens,
        message: { role: "assistant", content: result.content || "(resposta vazia)" },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${credential.source}:${credential.envKey} → ${message}`);
    }
  }

  return finalizeResponse({
    provider,
    request,
    tier,
    ceiling,
    usageBefore,
    estimatedInputTokens,
    startedAt,
    mode: "demo",
    message: {
      role: "assistant",
      content: [
        `[Falha ao contatar ${provider.label}]`,
        ...errors,
        "Retornando em modo seguro · sua sessão permanece ativa.",
      ].join("\n\n"),
    },
  });
}
