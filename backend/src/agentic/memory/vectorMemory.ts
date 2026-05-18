import { nanoid } from "nanoid";
import type { AgentMemoryRecord } from "../types";

const VECTOR_SIZE = 12;

function tokenize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
}

function hashToken(token: string) {
  let hash = 0;
  for (const char of token) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1000003;
  }
  return hash;
}

function buildVector(text: string): number[] {
  const vector = new Array<number>(VECTOR_SIZE).fill(0);
  for (const token of tokenize(text)) {
    const index = hashToken(token) % VECTOR_SIZE;
    vector[index] += 1;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, item) => sum + item * item, 0)) || 1;
  return vector.map((item) => Number((item / magnitude).toFixed(4)));
}

function cosine(a: number[], b: number[]) {
  return a.reduce((sum, value, index) => sum + value * (b[index] || 0), 0);
}

export class VectorMemoryStore {
  private memories = new Map<string, AgentMemoryRecord>();

  remember(input: {
    sessionId: string;
    memoryType: AgentMemoryRecord["memoryType"];
    content: string;
    tags?: string[];
    importance?: number;
  }): AgentMemoryRecord {
    const now = new Date().toISOString();
    const memory: AgentMemoryRecord = {
      id: nanoid(),
      sessionId: input.sessionId,
      memoryType: input.memoryType,
      content: input.content,
      tags: input.tags || [],
      vector: buildVector(`${input.content} ${(input.tags || []).join(" ")}`),
      importance: input.importance ?? 50,
      createdAt: now,
      updatedAt: now,
    };

    this.memories.set(memory.id, memory);
    return memory;
  }

  listRecent(limit = 20): AgentMemoryRecord[] {
    return Array.from(this.memories.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  listBySession(sessionId: string, limit = 20): AgentMemoryRecord[] {
    return this.listRecent(200).filter((memory) => memory.sessionId === sessionId).slice(0, limit);
  }

  search(sessionId: string | undefined, query: string, limit = 5): Array<AgentMemoryRecord & { similarity: number }> {
    const queryVector = buildVector(query);
    return Array.from(this.memories.values())
      .filter((memory) => !sessionId || memory.sessionId === sessionId)
      .map((memory) => ({
        ...memory,
        similarity: Number(cosine(memory.vector, queryVector).toFixed(4)),
      }))
      .sort((a, b) => {
        if (b.similarity === a.similarity) return b.importance - a.importance;
        return b.similarity - a.similarity;
      })
      .slice(0, limit);
  }
}

export const vectorMemory = new VectorMemoryStore();
