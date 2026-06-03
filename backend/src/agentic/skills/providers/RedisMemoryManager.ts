import { MemoryManager, MemoryEntry } from "../agenticCore";

export class RedisMemoryManager implements MemoryManager {
  private entries: Map<string, MemoryEntry> = new Map();

  async retrieve(query: string, limit: number = 5): Promise<MemoryEntry[]> {
    // Simulação de busca semântica/texto no Redis
    return Array.from(this.entries.values())
      .filter(entry => entry.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
  }

  async store(entry: MemoryEntry): Promise<void> {
    const id = Math.random().toString(36).substring(7);
    this.entries.set(id, entry);
    console.log(`[RedisMemoryManager] Stored entry: ${id}`);
  }

  async update(id: string, updates: Partial<MemoryEntry>): Promise<void> {
    const existing = this.entries.get(id);
    if (existing) {
      this.entries.set(id, { ...existing, ...updates });
    }
  }
}
