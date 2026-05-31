/**
 * Tipos e interfaces para integração LangChain
 * Define contratos entre o sistema Nexus e componentes LangChain
 */

import type { AgenticChannel, AgenticSession, AgenticActionAudit } from '../../agentic/types';

/**
 * Configuração do provedor de embeddings
 */
export interface EmbeddingsConfig {
  provider: 'openai' | 'ollama' | 'huggingface';
  model: string;
  dimensions?: number;
  apiKey?: string;
  baseUrl?: string;
}

/**
 * Configuração do vector store
 */
export interface VectorStoreConfig {
  provider: 'pgvector' | 'qdrant' | 'pinecone' | 'chroma' | 'memory';
  connectionString?: string;
  collectionName: string;
  dimensions: number;
}

/**
 * Definição de tool LangChain compatibilidade
 */
export interface LangChainToolDefinition {
  name: string;
  description: string;
  schema: Record<string, unknown>;
  handler: (input: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Configuração de chain de reflexão
 */
export interface ReflectionChainConfig {
  maxIterations: number;
  confidenceThreshold: number;
  reflectionPrompt: string;
}

/**
 * Resultado de execução de chain
 */
export interface ChainExecutionResult {
  success: boolean;
  output: unknown;
  steps: Array<{
    step: number;
    action: string;
    input: unknown;
    output: unknown;
    latencyMs: number;
  }>;
  totalLatencyMs: number;
}

/**
 * Resultado de busca semântica
 */
export interface SemanticSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

/**
 * Configuração do agente ReAct
 */
export interface ReActAgentConfig {
  tools: LangChainToolDefinition[];
  maxIterations: number;
  returnIntermediateSteps: boolean;
  systemMessage?: string;
}

/**
 * Pipeline RAG configuration
 */
export interface RAGPipelineConfig {
  embeddings: EmbeddingsConfig;
  vectorStore: VectorStoreConfig;
  llmConfig: LLMConfig;
  chunkSize: number;
  chunkOverlap: number;
}

/**
 * Configuração de LLM para chains
 */
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'ollama';
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseUrl?: string;
}

/**
 * Session context para agentes
 */
export interface AgentSessionContext {
  session: AgenticSession;
  actions: AgentActionAudit[];
  memory: Array<{
    type: 'brief' | 'strategy' | 'creative' | 'judge' | 'learning';
    content: string;
    importance: number;
  }>;
  channel: AgenticChannel;
}

/**
 * Resultado de geração com chain
 */
export interface ChainGenerationResult {
  content: string;
  confidence: number;
  reasoning?: string;
  toolsUsed: string[];
  metadata: Record<string, unknown>;
}
