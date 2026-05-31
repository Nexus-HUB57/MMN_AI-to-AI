/**
 * Tipos e interfaces para integração Ollama
 */

export interface OllamaConfig {
  baseUrl: string;
  timeout: number;
  models: OllamaModelConfig[];
}

export interface OllamaModelConfig {
  name: string;
  displayName: string;
  type: 'chat' | 'embedding' | 'vision';
  parameters: OllamaModelParameters;
  maxRetries: number;
  retryDelay: number;
}

export interface OllamaModelParameters {
  temperature?: number;
  top_p?: number;
  top_k?: number;
  num_ctx?: number;
  repeat_penalty?: number;
  stop?: string[];
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: OllamaModelParameters;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export interface OllamaEmbeddingRequest {
  model: string;
  prompt: string;
}

export interface OllamaEmbeddingResponse {
  model: string;
  embeddings: number[][];
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export interface OllamaListModelsResponse {
  models: OllamaModel[];
}

export interface OllamaPullRequest {
  name: string;
  stream?: boolean;
}

export type OllamaStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface OllamaHealth {
  status: OllamaStatus;
  latencyMs: number;
  modelsLoaded: number;
  lastCheck: string;
  error?: string;
}

export interface OllamaGenerationOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  numCtx?: number;
  repeatPenalty?: number;
  stop?: string[];
  stream?: boolean;
}
