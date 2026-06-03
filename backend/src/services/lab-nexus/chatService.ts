/**
 * Lab Nexus · Chat Service
 * --------------------------------------------------------------
 * Serviço unificado que encaminha mensagens do Chat Bot Lab Nexus
 * para a API oficial do provedor selecionado (OpenAI, Anthropic,
 * Google, DeepSeek, MiniMax). Mantém formato comum de entrada/saída,
 * fallback de modo demo quando nenhuma chave está configurada, e
 * registro estruturado para auditoria.
 */

import {
  LAB_NEXUS_PROVIDERS,
  type LabNexusProvider,
  type LabNexusProviderId,
  isProviderConfigured,
} from "./providerRegistry";

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
  tier?: "iniciante" | "operador" | "estrategista" | "elite";
}

export interface LabNexusChatResponse {
  providerId: LabNexusProviderId;
  model: string;
  message: LabNexusMessage;
  mode: "live" | "demo";
  tokensUsed?: number;
  latencyMs: number;
  trace?: Record<string, unknown>;
}

const TIER_LIMITS: Record<NonNullable<LabNexusChatRequest["tier"]>, { maxTokens: number; perDay: number }> = {
  iniciante: { maxTokens: 0, perDay: 0 },
  operador: { maxTokens: 2000, perDay: 50 },
  estrategista: { maxTokens: 8000, perDay: 500 },
  elite: { maxTokens: 32000, perDay: 5000 },
};

function resolveTierLimit(tier: LabNexusChatRequest["tier"]) {
  if (!tier) return TIER_LIMITS.operador;
  return TIER_LIMITS[tier] ?? TIER_LIMITS.operador;
}

function clampMaxTokens(requested: number | undefined, ceiling: number) {
  const fallback = Math.min(1024, ceiling);
  if (!requested || requested <= 0) return fallback;
  return Math.min(requested, ceiling);
}

function asDemoResponse(provider: LabNexusProvider, request: LabNexusChatRequest, startedAt: number): LabNexusChatResponse {
  const lastUser = [...request.messages].reverse().find((m) => m.role === "user");
  const echo = lastUser?.content?.slice(0, 280) ?? "(sem mensagem)";
  return {
    providerId: provider.id,
    model: request.model ?? provider.defaultModel,
    mode: "demo",
    latencyMs: Date.now() - startedAt,
    message: {
      role: "assistant",
      content: [
        `[Modo demo · ${provider.label}]`,
        `Chave de API ainda não configurada no servidor (${provider.envKey}).`,
        "Sua mensagem foi recebida com sucesso e seria encaminhada à API oficial assim que a credencial estiver disponível.",
        `Eco da última mensagem: "${echo}"`,
      ].join("\n\n"),
    },
  };
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

export async function runLabNexusChat(request: LabNexusChatRequest): Promise<LabNexusChatResponse> {
  const provider = LAB_NEXUS_PROVIDERS[request.providerId];
  if (!provider) {
    throw new Error(`Provedor Lab Nexus desconhecido: ${request.providerId}`);
  }

  if (request.tier === "iniciante") {
    throw new Error("Acesso negado: o Chat Bot Lab Nexus requer tier Operador ou superior (PD/SCC).");
  }

  const limit = resolveTierLimit(request.tier);
  const ceiling = Math.max(256, limit.maxTokens || 2000);
  const startedAt = Date.now();
  const apiKey = process.env[provider.envKey]?.trim();

  if (!apiKey || !isProviderConfigured(provider.id)) {
    return asDemoResponse(provider, request, startedAt);
  }

  try {
    let result: { content: string; tokens?: number; raw: unknown };
    if (provider.id === "openai" || provider.id === "deepseek" || provider.id === "minimax") {
      result = await callOpenAILike(provider, apiKey, request, ceiling);
    } else if (provider.id === "anthropic") {
      result = await callAnthropic(provider, apiKey, request, ceiling);
    } else if (provider.id === "google") {
      result = await callGemini(provider, apiKey, request, ceiling);
    } else {
      return asDemoResponse(provider, request, startedAt);
    }

    return {
      providerId: provider.id,
      model: request.model ?? provider.defaultModel,
      mode: "live",
      latencyMs: Date.now() - startedAt,
      tokensUsed: result.tokens,
      message: { role: "assistant", content: result.content || "(resposta vazia)" },
      trace: {
        affiliateId: request.affiliateId ?? null,
        tier: request.tier ?? "operador",
        ceilingTokens: ceiling,
      },
    };
  } catch (error) {
    return {
      providerId: provider.id,
      model: request.model ?? provider.defaultModel,
      mode: "demo",
      latencyMs: Date.now() - startedAt,
      message: {
        role: "assistant",
        content: [
          `[Falha ao contatar ${provider.label}]`,
          error instanceof Error ? error.message : String(error),
          "Retornando em modo seguro · sua sessão permanece ativa.",
        ].join("\n\n"),
      },
    };
  }
}
