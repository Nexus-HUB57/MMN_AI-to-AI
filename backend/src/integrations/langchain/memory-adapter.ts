/**
 * Adaptador de Memory LangChain para Nexus
 *
 * Implementa gerenciamento de contexto e histórico de interações
 * usando abstrações LangChain Memory.
 */

import type { AgentSessionContext } from '../../agentic/types';
import type { MemoryConfig } from './types';

/**
 * Interface base para stores de memória
 */
export interface MemoryStore {
  add(key: string, value: unknown): void;
  get(key: string): unknown | undefined;
  getHistory(key: string, limit?: number): unknown[];
  clear(key?: string): void;
}

/**
 * Buffer de memória simples em memória
 */
export class SimpleMemoryBuffer implements MemoryStore {
  private buffer: Map<string, unknown[]> = new Map();

  add(key: string, value: unknown): void {
    const history = this.buffer.get(key) || [];
    history.push(value);
    this.buffer.set(key, history);
  }

  get(key: string): unknown | undefined {
    const history = this.buffer.get(key);
    return history ? history[history.length - 1] : undefined;
  }

  getHistory(key: string, limit = 10): unknown[] {
    const history = this.buffer.get(key) || [];
    return history.slice(-limit);
  }

  clear(key?: string): void {
    if (key) {
      this.buffer.delete(key);
    } else {
      this.buffer.clear();
    }
  }
}

/**
 * Configuração de conversation memory
 */
export interface ConversationMemoryConfig extends MemoryConfig {
  sessionKey: string;
  maxHistory: number;
  summaryEnabled: boolean;
}

/**
 * Memory de conversa com suporte a summary
 */
export class ConversationMemory {
  private config: ConversationMemoryConfig;
  private store: MemoryStore;
  private summary?: string;

  constructor(config: ConversationMemoryConfig, store?: MemoryStore) {
    this.config = config;
    this.store = store || new SimpleMemoryBuffer();
  }

  addMessage(role: 'user' | 'assistant', content: string): void {
    this.store.add(this.config.sessionKey, { role, content, timestamp: Date.now() });
    if (this.config.summaryEnabled) {
      this.updateSummary();
    }
  }

  getMessages(limit?: number): Array<{ role: 'user' | 'assistant'; content: string }> {
    const history = this.store.getHistory(this.config.sessionKey, limit);
    return history as Array<{ role: 'user' | 'assistant'; content: string }>;
  }

  getContext(): string {
    if (this.summary) {
      return `Summary: ${this.summary}\n\nRecent messages:\n${this.getMessages(5).map(m => `${m.role}: ${m.content}`).join('\n')}`;
    }
    return this.getMessages(10).map(m => `${m.role}: ${m.content}`).join('\n');
  }

  private updateSummary(): void {
    const recentMessages = this.getMessages(this.config.maxHistory);
    if (recentMessages.length > 5) {
      this.summary = `[Summary of ${recentMessages.length} messages in session]`;
    }
  }

  clear(): void {
    this.store.clear(this.config.sessionKey);
    this.summary = undefined;
  }
}

/**
 * Memory para contexto agentico
 */
export class AgenticContextMemory {
  private contexts: Map<string, AgentSessionContext> = new Map();
  private recentAccess: Map<string, number> = new Map();

  saveContext(context: AgentSessionContext): void {
    const key = context.session.id;
    this.contexts.set(key, context);
    this.recentAccess.set(key, Date.now());
  }

  getContext(sessionId: string): AgentSessionContext | undefined {
    const context = this.contexts.get(sessionId);
    if (context) {
      this.recentAccess.set(sessionId, Date.now());
    }
    return context;
  }

  getRecentContext(limit = 5): AgentSessionContext[] {
    const sorted = Array.from(this.recentAccess.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    return sorted
      .map(([sessionId]) => this.contexts.get(sessionId))
      .filter((ctx): ctx is AgentSessionContext => ctx !== undefined);
  }

  clearContext(sessionId?: string): void {
    if (sessionId) {
      this.contexts.delete(sessionId);
      this.recentAccess.delete(sessionId);
    }
  }
}

/**
 * Memory para estratégia de agents
 */
export class StrategyMemory {
  private strategies: Map<string, {
    content: string;
    success: number;
    usage: number;
    lastUsed: number;
  }> = new Map();

  saveStrategy(key: string, content: string): void {
    const existing = this.strategies.get(key);
    this.strategies.set(key, {
      content,
      success: existing?.success || 0,
      usage: existing?.usage || 0,
      lastUsed: Date.now(),
    });
  }

  recordSuccess(key: string): void {
    const strategy = this.strategies.get(key);
    if (strategy) {
      strategy.success += 1;
      strategy.usage += 1;
      strategy.lastUsed = Date.now();
    }
  }

  recordFailure(key: string): void {
    const strategy = this.strategies.get(key);
    if (strategy) {
      strategy.usage += 1;
      strategy.lastUsed = Date.now();
    }
  }

  getBestStrategies(limit = 3): Array<{ key: string; content: string; score: number }> {
    return Array.from(this.strategies.entries())
      .map(([key, data]) => ({
        key,
        content: data.content,
        score: data.usage > 0 ? data.success / data.usage : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getStrategy(key: string): string | undefined {
    const strategy = this.strategies.get(key);
    return strategy?.content;
  }
}

/**
 * Memory pool manager
 */
export class MemoryPool {
  private sessionMemories: Map<string, ConversationMemory> = new Map();
  private agenticMemory: AgenticContextMemory;
  private strategyMemory: StrategyMemory;
  private defaultConfig: ConversationMemoryConfig;

  constructor(defaultConfig: ConversationMemoryConfig) {
    this.defaultConfig = defaultConfig;
    this.agenticMemory = new AgenticContextMemory();
    this.strategyMemory = new StrategyMemory();
  }

  getSessionMemory(sessionId: string): ConversationMemory {
    let memory = this.sessionMemories.get(sessionId);
    if (!memory) {
      memory = new ConversationMemory({
        ...this.defaultConfig,
        sessionKey: sessionId,
      });
      this.sessionMemories.set(sessionId, memory);
    }
    return memory;
  }

  getAgenticMemory(): AgenticContextMemory {
    return this.agenticMemory;
  }

  getStrategyMemory(): StrategyMemory {
    return this.strategyMemory;
  }

  clearSession(sessionId: string): void {
    const memory = this.sessionMemories.get(sessionId);
    if (memory) {
      memory.clear();
      this.sessionMemories.delete(sessionId);
    }
  }

  clearAll(): void {
    this.sessionMemories.clear();
    this.agenticMemory = new AgenticContextMemory();
    this.strategyMemory = new StrategyMemory();
  }

  cleanupOldSessions(maxAgeMs: number): void {
    const now = Date.now();
    for (const [sessionId, memory] of this.sessionMemories) {
      // Check last access time and cleanup if too old
      const lastAccess = this.agenticMemory.getRecentContext()[0]?.session.updatedAt;
      if (lastAccess && (now - new Date(lastAccess).getTime()) > maxAgeMs) {
        memory.clear();
        this.sessionMemories.delete(sessionId);
      }
    }
  }
}

// Singleton instance
export const memoryPool = new MemoryPool({
  sessionKey: 'default',
  maxHistory: 50,
  summaryEnabled: true,
  type: 'conversation',
});
