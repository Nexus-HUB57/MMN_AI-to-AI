/**
 * chatService — Lab Nexus Chat Service
 * --------------------------------------------------------------
 * Serviço de chat multi-provedor para o Lab Nexus Sandbox.
 * Roteia mensagens para o provedor LLM selecionado e retorna respostas.
 */

import { getProvider, type LabNexusProviderId } from "./providerRegistry";

export type LabNexusRole = "system" | "user" | "assistant";

export interface LabNexusChatMessage {
  role: LabNexusRole;
  content: string;
}

export interface LabNexusChatInput {
  providerId: LabNexusProviderId;
  model?: string;
  messages: LabNexusChatMessage[];
  temperature?: number;
  maxTokens?: number;
  affiliateId?: number;
  tier?: string;
}

export interface LabNexusChatResponse {
  ok: boolean;
  content?: string;
  model?: string;
  provider?: string;
  usage?: { promptTokens: number; completionTokens: number };
  error?: string;
}

/**
 * Executa uma chamada de chat no Lab Nexus.
 * Atualmente retorna uma resposta placeholder — integração real com
 * APIs de LLM será adicionada quando as chaves estiverem configuradas.
 */
export async function runLabNexusChat(
  input: LabNexusChatInput,
): Promise<LabNexusChatResponse> {
  const provider = getProvider(input.providerId);

  if (!provider) {
    return {
      ok: false,
      error: `Provedor "${input.providerId}" não encontrado`,
    };
  }

  if (!provider.configured) {
    return {
      ok: false,
      error: `Provedor "${provider.name}" não configurado. Chave de API ausente.`,
    };
  }

  const model = input.model || provider.models[0];

  try {
    // TODO: Implementar chamada real à API do provedor
    // Por enquanto, retorna placeholder indicando que o serviço está operacional
    const lastUserMsg = input.messages
      .filter((m) => m.role === "user")
      .pop()?.content || "";

    // Simulação de resposta — remover quando APIs estiverem integradas
    return {
      ok: true,
      content: `[Lab Nexus - ${provider.name} / ${model}] Resposta do sandbox. Mensagem recebida: "${lastUserMsg.slice(0, 80)}..."`,
      model,
      provider: provider.name,
      usage: {
        promptTokens: input.messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0),
        completionTokens: 50,
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      error: `Erro ao chamar ${provider.name}: ${e.message}`,
    };
  }
}
