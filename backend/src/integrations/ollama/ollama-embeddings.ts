/**
 * Ollama Embeddings Service
 *
 * Implementa geracao de embeddings usando Ollama local
 * para uso em sistemas de busca semantica.
 */

import { OllamaManagerFactory } from './ollama-manager';
import type { OllamaManager } from './ollama-manager';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokens: number;
  latencyMs: number;
}

export interface BatchEmbeddingResult {
  results: EmbeddingResult[];
  totalTokens: number;
  totalLatencyMs: number;
}

/**
 * Servico de embeddings usando Ollama
 */
export class OllamaEmbeddingsService {
  private manager: OllamaManager;
  private model: string;
  private cache: Map<string, number[]> = new Map();
  private cacheEnabled: boolean;
  private cacheMaxSize: number;

  constructor(manager?: OllamaManager, model?: string) {
    this.manager = manager || OllamaManagerFactory.createFromEnv();
    this.model = model || 'nomic-embed-text';
    this.cacheEnabled = true;
    this.cacheMaxSize = 10000;
  }

  /**
   * Gera embedding para um texto
   */
  async embed(text: string): Promise<EmbeddingResult> {
    const cacheKey = this.hashText(text);

    if (this.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return {
          embedding: cached,
          model: this.model,
          tokens: Math.ceil(text.length / 4),
          latencyMs: 0,
        };
      }
    }

    const startTime = Date.now();
    const embedding = await this.manager.generateEmbeddings(text, this.model);
    const latencyMs = Date.now() - startTime;

    if (this.cacheEnabled && this.cache.size < this.cacheMaxSize) {
      this.cache.set(cacheKey, embedding);
    }

    return {
      embedding,
      model: this.model,
      tokens: Math.ceil(text.length / 4),
      latencyMs,
    };
  }

  /**
   * Gera embeddings para multiplos textos em batch
   */
  async embedBatch(texts: string[]): Promise<BatchEmbeddingResult> {
    const startTime = Date.now();
    const results: EmbeddingResult[] = [];
    let totalTokens = 0;

    // Processar em paralelo com limite
    const batchSize = 10;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(text => this.embed(text))
      );
      results.push(...batchResults);
    }

    totalTokens = results.reduce((sum, r) => sum + r.tokens, 0);

    return {
      results,
      totalTokens,
      totalLatencyMs: Date.now() - startTime,
    };
  }

  /**
   * Calcula similaridade cosseno entre dois vetores
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Encontra textos mais similares em uma lista
   */
  async findSimilar(
    query: string,
    documents: Array<{ id: string; text: string; metadata?: Record<string, unknown> }>,
    topK = 5,
    minSimilarity = 0.5
  ): Promise<Array<{ id: string; text: string; similarity: number; metadata?: Record<string, unknown> }>> {
    const queryEmbedding = await this.embed(query);
    const results: Array<{
      id: string;
      text: string;
      similarity: number;
      metadata?: Record<string, unknown>;
    }> = [];

    for (const doc of documents) {
      const docEmbedding = await this.embed(doc.text);
      const similarity = this.cosineSimilarity(queryEmbedding.embedding, docEmbedding.embedding);

      if (similarity >= minSimilarity) {
        results.push({
          id: doc.id,
          text: doc.text,
          similarity,
          metadata: doc.metadata,
        });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Atualiza modelo de embedding
   */
  setModel(model: string): void {
    this.model = model;
    this.cache.clear(); // Clear cache when model changes
  }

  /**
   * Habilita/desabilita cache
   */
  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.cache.clear();
    }
  }

  /**
   * Limpa cache de embeddings
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Retorna tamanho atual do cache
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Hash simples para cache key
   */
  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

/**
 * Document store com embeddings
 */
export class EmbeddedDocumentStore {
  private documents: Map<string, {
    text: string;
    embedding: number[];
    metadata: Record<string, unknown>;
  }> = new Map();
  private embeddingsService: OllamaEmbeddingsService;

  constructor(embeddingsService?: OllamaEmbeddingsService) {
    this.embeddingsService = embeddingsService || new OllamaEmbeddingsService();
  }

  /**
   * Adiciona documento ao store
   */
  async addDocument(
    id: string,
    text: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const result = await this.embeddingsService.embed(text);
    this.documents.set(id, {
      text,
      embedding: result.embedding,
      metadata: metadata || {},
    });
  }

  /**
   * Adiciona multiplos documentos
   */
  async addDocuments(
    documents: Array<{ id: string; text: string; metadata?: Record<string, unknown> }>
  ): Promise<void> {
    for (const doc of documents) {
      await this.addDocument(doc.id, doc.text, doc.metadata);
    }
  }

  /**
   * Busca documentos similares
   */
  async search(
    query: string,
    topK = 5,
    minSimilarity = 0.5
  ): Promise<Array<{
    id: string;
    text: string;
    similarity: number;
    metadata: Record<string, unknown>;
  }>> {
    const queryResult = await this.embeddingsService.embed(query);
    const results: Array<{
      id: string;
      text: string;
      similarity: number;
      metadata: Record<string, unknown>;
    }> = [];

    for (const [id, doc] of this.documents) {
      const similarity = this.embeddingsService.cosineSimilarity(
        queryResult.embedding,
        doc.embedding
      );

      if (similarity >= minSimilarity) {
        results.push({
          id,
          text: doc.text,
          similarity,
          metadata: doc.metadata,
        });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Remove documento
   */
  deleteDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  /**
   * Limpa store
   */
  clear(): void {
    this.documents.clear();
  }

  /**
   * Retorna tamanho do store
   */
  size(): number {
    return this.documents.size;
  }

  /**
   * Verifica existencia de documento
   */
  has(id: string): boolean {
    return this.documents.has(id);
  }

  /**
   * Obtem documento por ID
   */
  get(id: string): { text: string; metadata: Record<string, unknown> } | undefined {
    const doc = this.documents.get(id);
    return doc ? { text: doc.text, metadata: doc.metadata } : undefined;
  }
}

// Singleton instance
export const embeddingsService = new OllamaEmbeddingsService();
