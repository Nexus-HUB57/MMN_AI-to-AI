/**
 * LLM Router Extension para Ollama
 *
 * Extensão do router de LLM existente para suportar Ollama
 * como provedor adicional com fallback automático.
 */

import { OllamaManagerFactory, OllamaPool } from './ollama-manager';
import type { OllamaManager, OllamaGenerationOptions } from './ollama-manager';
import { nanoid } from 'nanoid';

/**
 * Tipo de provedor LLM
 */
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'ollama';

/**
 * Configuração de request para LLM
 */
export interface LLMRequest {
  provider: LLMProvider;
  model: string;
  prompt?: string;
  messages?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

/**
 * Resposta de LLM
 */
export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  tokens?: number;
  latencyMs: number;
  cached?: boolean;
}

/**
 * Resultado de geração em batch
 */
export interface LLMBatchResponse {
  results: LLMResponse[];
  totalTokens: number;
  totalLatencyMs: number;
}

/**
 * Router de LLM com suporte multi-provedor
 */
export class LLMMultiProviderRouter {
  private ollamaPool: OllamaPool;
  private activeProvider: LLMProvider = 'ollama';
  private providerFallbackOrder: LLMProvider[] = ['ollama', 'openai', 'google'];
  private ollamaEnabled: boolean;
  private openaiApiKey?: string;
  private anthropicApiKey?: string;
  private googleApiKey?: string;

  constructor() {
    this.ollamaPool = new OllamaPool();
    this.ollamaEnabled = true;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Adicionar Ollama ao pool
    const ollamaManager = OllamaManagerFactory.createFromEnv();
    this.ollamaPool.addManager('ollama-primary', ollamaManager);

    // Configurar chaves de API do ambiente
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.googleApiKey = process.env.GEMINI_API_KEY;
  }

  /**
   * Define ordem de fallback de provedores
   */
  setFallbackOrder(order: LLMProvider[]): void {
    this.providerFallbackOrder = order;
  }

  /**
   * Define provedor ativo
   */
  setActiveProvider(provider: LLMProvider): void {
    this.activeProvider = provider;
  }

  /**
   * Habilita/desabilita Ollama
   */
  setOllamaEnabled(enabled: boolean): void {
    this.ollamaEnabled = enabled;
    if (!enabled && this.activeProvider === 'ollama') {
      this.activeProvider = 'openai';
    }
  }

  /**
   * Executa geração com provedor ativo ou fallback
   */
  async generate(request: Omit<LLMRequest, 'provider'>): Promise<LLMResponse> {
    const errors: Error[] = [];

    for (const provider of this.providerFallbackOrder) {
      if (provider === 'ollama' && !this.ollamaEnabled) continue;

      try {
        return await this.generateWithProvider(
          { ...request, provider } as LLMRequest
        );
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
        console.warn(`[LLMRouter] Provider ${provider} failed:`, error);
      }
    }

    throw new Error(`All providers failed. Last error: ${errors[errors.length - 1]?.message}`);
  }

  /**
   * Gera com provedor específico
   */
  async generateWithProvider(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    switch (request.provider) {
      case 'ollama':
        return this.generateWithOllama(request, startTime);
      case 'openai':
        return this.generateWithOpenAI(request, startTime);
      case 'google':
        return this.generateWithGoogle(request, startTime);
      case 'anthropic':
        return this.generateWithAnthropic(request, startTime);
      default:
        throw new Error(`Unsupported provider: ${request.provider}`);
    }
  }

  private async generateWithOllama(request: Omit<LLMRequest, 'provider'>, startTime: number): Promise<LLMResponse> {
    const options: OllamaGenerationOptions = {
      model: request.model,
      temperature: request.temperature,
      topP: request.topP,
      topK: request.topK,
    };

    const content = await this.ollamaPool.executeWithFailover(async (manager) => {
      if (request.messages) {
        const response = await manager.chat(request.messages, options);
        return response.message.content;
      } else if (request.prompt) {
        return manager.generate(request.prompt, options);
      } else {
        throw new Error('Either prompt or messages must be provided');
      }
    });

    return {
      content,
      provider: 'ollama',
      model: request.model,
      latencyMs: Date.now() - startTime,
    };
  }

  private async generateWithOpenAI(request: Omit<LLMRequest, 'provider'>, startTime: number): Promise<LLMResponse> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const messages = request.messages || [
      { role: 'system' as const, content: 'You are a helpful assistant.' },
      { role: 'user' as const, content: request.prompt || '' },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: request.model || 'gpt-4',
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
        top_p: request.topP,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      provider: 'openai',
      model: request.model || 'gpt-4',
      tokens: data.usage?.total_tokens,
      latencyMs: Date.now() - startTime,
    };
  }

  private async generateWithGoogle(request: Omit<LLMRequest, 'provider'>, startTime: number): Promise<LLMResponse> {
    if (!this.googleApiKey) {
      throw new Error('Google API key not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${request.model || 'gemini-pro'}:generateContent?key=${this.googleApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: request.prompt || '' }] }],
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.maxTokens ?? 2048,
            topP: request.topP,
            topK: request.topK,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      provider: 'google',
      model: request.model || 'gemini-pro',
      latencyMs: Date.now() - startTime,
    };
  }

  private async generateWithAnthropic(request: Omit<LLMRequest, 'provider'>, startTime: number): Promise<LLMResponse> {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const systemPrompt = request.messages?.find(m => m.role === 'system')?.content;
    const userMessages = request.messages?.filter(m => m.role !== 'system') || [];
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || request.prompt || '';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: request.model || 'claude-3-sonnet-20240229',
        system: systemPrompt,
        messages: [{ role: 'user', content: lastUserMessage }],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1024,
        top_p: request.topP,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content?.[0]?.text || '',
      provider: 'anthropic',
      model: request.model || 'claude-3-sonnet',
      tokens: data.usage?.input_tokens + data.usage?.output_tokens,
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Gera múltiplas respostas em paralelo
   */
  async generateBatch(requests: Omit<LLMRequest, 'provider'>[]): Promise<LLMBatchResponse> {
    const startTime = Date.now();
    const results = await Promise.allSettled(
      requests.map(req => this.generate(req))
    );

    const successful = results
      .filter((r): r is PromiseFulfilledResult<LLMResponse> => r.status === 'fulfilled')
      .map(r => r.value);

    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      results: successful,
      totalTokens: successful.reduce((sum, r) => sum + (r.tokens || 0), 0),
      totalLatencyMs: Date.now() - startTime,
      failedCount: failed,
    };
  }

  /**
   * Retorna status de todos os provedores
   */
  async getProvidersStatus(): Promise<Record<LLMProvider, { enabled: boolean; healthy: boolean }>> {
    const ollamaHealth = await this.ollamaPool.executeWithFailover(
      async manager => {
        await manager.healthCheck();
        return manager.getHealth();
      },
      false
    ).catch(() => null);

    return {
      ollama: {
        enabled: this.ollamaEnabled,
        healthy: ollamaHealth?.status === 'connected',
      },
      openai: {
        enabled: !!this.openaiApiKey,
        healthy: !!this.openaiApiKey,
      },
      google: {
        enabled: !!this.googleApiKey,
        healthy: !!this.googleApiKey,
      },
      anthropic: {
        enabled: !!this.anthropicApiKey,
        healthy: !!this.anthropicApiKey,
      },
    };
  }

  /**
   * Retorna provedor ativo
   */
  getActiveProvider(): LLMProvider {
    return this.activeProvider;
  }
}

// Singleton instance
export const llmRouter = new LLMMultiProviderRouter();
