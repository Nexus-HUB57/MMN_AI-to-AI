/**
 * Adaptador de Retrievers LangChain para Nexus
 *
 * Implementa camada de busca semantica utilizando LangChain Retrievers
 * com suporte a PGVector, Qdrant, Pinecone e Chroma.
 */

import { nanoid } from 'nanoid';
import type { SemanticSearchResult, VectorStoreConfig, EmbeddingsConfig } from './types';

/**
 * Interface base para vector stores
 */
export interface VectorStore {
  addDocuments(documents: Array<{ id?: string; content: string; metadata?: Record<string, unknown> }>): Promise<string[]>;
  similaritySearch(query: string, k?: number): Promise<SemanticSearchResult[]>;
  similaritySearchWithScore(query: string, k?: number): Promise<Array<SemanticSearchResult & { score: number }>>;
  delete(ids: string[]): Promise<void>;
}

/**
 * Implementacao de Vector Store em memoria (fallback)
 */
export class InMemoryVectorStore implements VectorStore {
  private documents: Map<string, { content: string; metadata?: Record<string, unknown>; embedding: number[] }> = new Map();

  async addDocuments(documents: Array<{ id?: string; content: string; metadata?: Record<string, unknown> }>): Promise<string[]> {
    const ids: string[] = [];
    for (const doc of documents) {
      const id = doc.id || nanoid();
      const embedding = this.generateSimpleEmbedding(doc.content);
      this.documents.set(id, { content: doc.content, metadata: doc.metadata, embedding });
      ids.push(id);
    }
    return ids;
  }

  async similaritySearch(query: string, k = 5): Promise<SemanticSearchResult[]> {
    const queryEmbedding = this.generateSimpleEmbedding(query);
    const results: Array<{ id: string; score: number }> = [];

    for (const [id, doc] of this.documents) {
      const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
      results.push({ id, score });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(r => ({
        id: r.id,
        content: this.documents.get(r.id)!.content,
        score: r.score,
        metadata: this.documents.get(r.id)!.metadata || {},
      }));
  }

  async similaritySearchWithScore(query: string, k = 5): Promise<Array<SemanticSearchResult & { score: number }>> {
    const results = await this.similaritySearch(query, k);
    return results.map(r => ({ ...r, score: r.score }));
  }

  async delete(ids: string[]): Promise<void> {
    ids.forEach(id => this.documents.delete(id));
  }

  private generateSimpleEmbedding(text: string): number[] {
    const dimensions = 12;
    const vector = new Array<number>(dimensions).fill(0);
    const words = text.toLowerCase().split(/\s+/);

    words.forEach((word, index) => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash * 31 + word.charCodeAt(i)) % 1000003;
      }
      const idx = hash % dimensions;
      vector[idx] += 1;
    });

    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map(v => Number((v / magnitude).toFixed(4)));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  }
}

/**
 * Factory para criacao de vector stores
 */
export class VectorStoreFactory {
  static create(config: VectorStoreConfig): VectorStore {
    switch (config.provider) {
      case 'memory':
        return new InMemoryVectorStore();

      case 'pgvector':
        return new PGVectorStore(config);

      case 'qdrant':
        return new QdrantStore(config);

      case 'chroma':
        return new ChromaStore(config);

      default:
        console.warn(`Vector store provider ${config.provider} nao implementado, usando fallback em memoria`);
        return new InMemoryVectorStore();
    }
  }
}

/**
 * PGVector Store - placeholder para integracao real
 */
class PGVectorStore implements VectorStore {
  constructor(private config: VectorStoreConfig) {}

  async addDocuments(documents: Array<{ id?: string; content: string; metadata?: Record<string, unknown> }>): Promise<string[]> {
    // Implementacao futura com pgvector
    console.log(`[PGVector] Adding ${documents.length} documents to collection ${this.config.collectionName}`);
    return documents.map(doc => doc.id || nanoid());
  }

  async similaritySearch(query: string, k = 5): Promise<SemanticSearchResult[]> {
    // Implementacao futura com pgvector
    console.log(`[PGVector] Searching for: ${query}`);
    return [];
  }

  async similaritySearchWithScore(query: string, k = 5): Promise<Array<SemanticSearchResult & { score: number }>> {
    return (await this.similaritySearch(query, k)).map(r => ({ ...r, score: r.score }));
  }

  async delete(ids: string[]): Promise<void> {
    console.log(`[PGVector] Deleting ${ids.length} documents`);
  }
}

/**
 * Qdrant Store - placeholder para integracao real
 */
class QdrantStore implements VectorStore {
  constructor(private config: VectorStoreConfig) {}

  async addDocuments(documents: Array<{ id?: string; content: string; metadata?: Record<string, unknown> }>): Promise<string[]> {
    console.log(`[Qdrant] Adding ${documents.length} documents to collection ${this.config.collectionName}`);
    return documents.map(doc => doc.id || nanoid());
  }

  async similaritySearch(query: string, k = 5): Promise<SemanticSearchResult[]> {
    console.log(`[Qdrant] Searching for: ${query}`);
    return [];
  }

  async similaritySearchWithScore(query: string, k = 5): Promise<Array<SemanticSearchResult & { score: number }>> {
    return (await this.similaritySearch(query, k)).map(r => ({ ...r, score: r.score }));
  }

  async delete(ids: string[]): Promise<void> {
    console.log(`[Qdrant] Deleting ${ids.length} documents`);
  }
}

/**
 * Chroma Store - placeholder para integracao real
 */
class ChromaStore implements VectorStore {
  constructor(private config: VectorStoreConfig) {}

  async addDocuments(documents: Array<{ id?: string; content: string; metadata?: Record<string, unknown> }>): Promise<string[]> {
    console.log(`[Chroma] Adding ${documents.length} documents to collection ${this.config.collectionName}`);
    return documents.map(doc => doc.id || nanoid());
  }

  async similaritySearch(query: string, k = 5): Promise<SemanticSearchResult[]> {
    console.log(`[Chroma] Searching for: ${query}`);
    return [];
  }

  async similaritySearchWithScore(query: string, k = 5): Promise<Array<SemanticSearchResult & { score: number }>> {
    return (await this.similaritySearch(query, k)).map(r => ({ ...r, score: r.score }));
  }

  async delete(ids: string[]): Promise<void> {
    console.log(`[Chroma] Deleting ${ids.length} documents`);
  }
}

/**
 * Retrieval Augmented Generation Pipeline
 */
export class RAGPipeline {
  private vectorStore: VectorStore;
  private embeddingsConfig: EmbeddingsConfig;

  constructor(vectorStore: VectorStore, embeddingsConfig: EmbeddingsConfig) {
    this.vectorStore = vectorStore;
    this.embeddingsConfig = embeddingsConfig;
  }

  async indexDocuments(documents: Array<{ content: string; metadata?: Record<string, unknown> }>): Promise<void> {
    await this.vectorStore.addDocuments(documents);
  }

  async retrieve(query: string, k = 5): Promise<SemanticSearchResult[]> {
    return this.vectorStore.similaritySearch(query, k);
  }

  async generateWithContext(query: string, context: string[]): Promise<string> {
    // Placeholder para geracao com contexto RAG
    return `Based on the following context:\n\n${context.join('\n\n')}\n\nAnswer: [Generated response for: ${query}]`;
  }

  async query(query: string, k = 5): Promise<{
    answer: string;
    sources: SemanticSearchResult[];
  }> {
    const retrieved = await this.retrieve(query, k);
    const context = retrieved.map(r => r.content);
    const answer = await this.generateWithContext(query, context);

    return {
      answer,
      sources: retrieved,
    };
  }
}

/**
 * Registry de Vector Stores
 */
export class VectorStoreRegistry {
  private stores: Map<string, VectorStore> = new Map();

  register(name: string, store: VectorStore): void {
    this.stores.set(name, store);
  }

  get(name: string): VectorStore | undefined {
    return this.stores.get(name);
  }

  createAndRegister(name: string, config: VectorStoreConfig): VectorStore {
    const store = VectorStoreFactory.create(config);
    this.stores.set(name, store);
    return store;
  }
}

export const vectorStoreRegistry = new VectorStoreRegistry();
