/**
 * Ollama Manager - Gerenciamento de conexão e modelos Ollama
 *
 * Implementa pool de conexao, health checks e failover
 * para operacao resiliente de LLMs locally.
 */

import { nanoid } from 'nanoid';
import type {
  OllamaConfig,
  OllamaModelConfig,
  OllamaChatRequest,
  OllamaChatResponse,
  OllamaEmbeddingRequest,
  OllamaEmbeddingResponse,
  OllamaHealth,
  OllamaStatus,
  OllamaGenerationOptions,
} from './types';

/**
 * Manager principal de conexao Ollama
 */
export class OllamaManager {
  private config: OllamaConfig;
  private status: OllamaStatus = 'disconnected';
  private health: OllamaHealth;
  private loadedModels: Set<string> = new Set();
  private connectionRetries: Map<string, number> = new Map();

  constructor(config: OllamaConfig) {
    this.config = config;
    this.health = {
      status: 'disconnected',
      latencyMs: 0,
      modelsLoaded: 0,
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Verifica conectividade com servidor Ollama
   */
  async healthCheck(): Promise<OllamaHealth> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (response.ok) {
        const data = await response.json();
        this.status = 'connected';
        this.loadedModels = new Set(data.models?.map((m: { name: string }) => m.name) || []);
        this.health = {
          status: 'connected',
          latencyMs: Date.now() - startTime,
          modelsLoaded: this.loadedModels.size,
          lastCheck: new Date().toISOString(),
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.status = 'error';
      this.health = {
        status: 'error',
        latencyMs: Date.now() - startTime,
        modelsLoaded: this.loadedModels.size,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    return this.health;
  }

  /**
   * Executa chat com modelo Ollama
   */
  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: OllamaGenerationOptions
  ): Promise<OllamaChatResponse> {
    const model = options?.model || this.config.models[0]?.name || 'llama3';

    const request: OllamaChatRequest = {
      model,
      messages,
      stream: options?.stream || false,
      options: {
        temperature: options?.temperature ?? 0.7,
        top_p: options?.topP,
        top_k: options?.topK,
        num_ctx: options?.numCtx,
        repeat_penalty: options?.repeatPenalty,
        stop: options?.stop,
      },
    };

    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Ollama chat failed: HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Gera embeddings usando modelo Ollama
   */
  async generateEmbeddings(text: string, model?: string): Promise<number[]> {
    const embeddingModel = model || this.getEmbeddingModel();

    const request: OllamaEmbeddingRequest = {
      model: embeddingModel,
      prompt: text,
    };

    const response = await fetch(`${this.config.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Ollama embeddings failed: HTTP ${response.status}`);
    }

    const data: OllamaEmbeddingResponse = await response.json();
    return data.embeddings[0] || [];
  }

  /**
   * Gera texto livre
   */
  async generate(prompt: string, options?: OllamaGenerationOptions): Promise<string> {
    const model = options?.model || this.config.models[0]?.name || 'llama3';

    const request = {
      model,
      prompt,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.7,
        top_p: options?.topP,
        top_k: options?.topK,
        num_ctx: options?.numCtx,
        repeat_penalty: options?.repeatPenalty,
        stop: options?.stop,
      },
    };

    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Ollama generate failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  /**
   * Lista modelos disponiveis no servidor
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.models?.map((m: { name: string }) => m.name) || [];
    } catch {
      return [];
    }
  }

  /**
   * Inicia download de modelo
   */
  async pullModel(modelName: string, onProgress?: (progress: number) => void): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true }),
      signal: AbortSignal.timeout(3600000), // 1 hour timeout for large models
    });

    if (!response.ok) {
      throw new Error(`Ollama pull failed: HTTP ${response.status}`);
    }

    if (onProgress) {
      const reader = response.body?.getReader();
      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += new TextDecoder().decode(value);
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.status === 'success') {
                  this.loadedModels.add(modelName);
                }
                if (data.total && data.completed) {
                  onProgress(data.completed / data.total);
                }
              } catch {
                // Ignore parse errors for progress updates
              }
            }
          }
        }
      }
    }
  }

  /**
   * Descarrega modelo da memoria
   */
  async unloadModel(modelName: string): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        keep_alive: 0,
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (response.ok) {
      this.loadedModels.delete(modelName);
    }
  }

  /**
   * Retorna modelo de embedding configurado
   */
  private getEmbeddingModel(): string {
    const embeddingModel = this.config.models.find(m => m.type === 'embedding');
    return embeddingModel?.name || 'nomic-embed-text';
  }

  /**
   * Retorna status atual
   */
  getStatus(): OllamaStatus {
    return this.status;
  }

  /**
   * Retorna health atual
   */
  getHealth(): OllamaHealth {
    return { ...this.health };
  }

  /**
   * Retorna modelos carregados
   */
  getLoadedModels(): string[] {
    return Array.from(this.loadedModels);
  }

  /**
   * Atualiza configuracao
   */
  updateConfig(newConfig: Partial<OllamaConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Pool de managers Ollama para failover
 */
export class OllamaPool {
  private managers: Map<string, OllamaManager> = new Map();
  private activeManager?: OllamaManager;
  private fallbackOrder: string[] = [];

  addManager(name: string, manager: OllamaManager): void {
    this.managers.set(name, manager);
    this.fallbackOrder.push(name);
    if (!this.activeManager) {
      this.activeManager = manager;
    }
  }

  async executeWithFailover<T>(
    executor: (manager: OllamaManager) => Promise<T>,
    fallbackEnabled = true
  ): Promise<T> {
    const tried: Set<string> = new Set();
    let lastError: Error | undefined;

    const tryManager = async (managerName: string): Promise<T> => {
      const manager = this.managers.get(managerName);
      if (!manager) {
        throw new Error(`Manager ${managerName} not found`);
      }

      await manager.healthCheck();
      if (manager.getStatus() !== 'connected') {
        throw new Error(`Manager ${managerName} not connected`);
      }

      return executor(manager);
    };

    // Try active manager first
    if (this.activeManager) {
      const activeName = this.fallbackOrder.find(name => this.managers.get(name) === this.activeManager);
      if (activeName) {
        tried.add(activeName);
        try {
          return await tryManager(activeName);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
        }
      }
    }

    // Try fallback managers
    if (fallbackEnabled) {
      for (const name of this.fallbackOrder) {
        if (tried.has(name)) continue;

        try {
          return await tryManager(name);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
        }
      }
    }

    throw lastError || new Error('All Ollama managers failed');
  }

  getActiveManager(): OllamaManager | undefined {
    return this.activeManager;
  }

  getAllManagers(): Map<string, OllamaManager> {
    return new Map(this.managers);
  }
}

/**
 * Factory para criacao de managers
 */
export class OllamaManagerFactory {
  static create(config: OllamaConfig): OllamaManager {
    return new OllamaManager(config);
  }

  static createFromEnv(): OllamaManager {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const timeout = parseInt(process.env.OLLAMA_TIMEOUT || '120000', 10);

    const config: OllamaConfig = {
      baseUrl,
      timeout,
      models: [
        {
          name: process.env.OLLAMA_CHAT_MODEL || 'llama3',
          displayName: 'Llama 3',
          type: 'chat',
          parameters: {
            temperature: 0.7,
            top_p: 0.9,
            num_ctx: 4096,
          },
          maxRetries: 3,
          retryDelay: 1000,
        },
        {
          name: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
          displayName: 'Nomic Embed Text',
          type: 'embedding',
          parameters: {},
          maxRetries: 3,
          retryDelay: 1000,
        },
      ],
    };

    return new OllamaManager(config);
  }
}
