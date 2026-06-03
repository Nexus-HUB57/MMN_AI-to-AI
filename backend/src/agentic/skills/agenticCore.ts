/**
 * Core da infraestrutura Agentic.
 * Define interfaces para Reasoning, Memory, Planning, Tools, Reflection e Metrics.
 */

// 1. Reasoning (Raciocínio)
export interface ReasoningStep {
  thought: string;
  action?: string;
  observation?: string;
  result?: string;
}

export interface ReasoningEngine {
  process(input: any, context: any): Promise<ReasoningStep[]>;
}

// 2. Memory (Memória)
export interface MemoryEntry {
  timestamp: Date;
  content: string;
  type: 'short-term' | 'long-term' | 'episodic' | 'declarative';
  relatedSkills?: string[];
}

export interface MemoryManager {
  retrieve(query: string, limit?: number): Promise<MemoryEntry[]>;
  store(entry: MemoryEntry): Promise<void>;
  update(id: string, updates: Partial<MemoryEntry>): Promise<void>;
}

// 3. Planning (Planejamento)
export interface PlanStep {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  toolUsed?: string;
  expectedOutput?: any;
  actualOutput?: any;
}

export interface Planner {
  createPlan(goal: string, context: any): Promise<PlanStep[]>;
  updatePlan(planId: string, updates: Partial<PlanStep>): Promise<void>;
  getPlan(planId: string): Promise<PlanStep[]>;
}

// 4. Tools (Ferramentas)
// SkillHandler já atua como uma ferramenta, mas podemos ter um wrapper mais genérico
export interface AgentTool {
  name: string;
  description: string;
  execute(input: any, context: any): Promise<any>;
}

// 5. Reflection (Reflexão)
export interface ReflectionEntry {
  timestamp: Date;
  observation: string;
  analysis: string;
  insights: string[];
  actionableImprovements: string[];
}

export interface Reflector {
  reflect(context: any, recentActions: ReasoningStep[]): Promise<ReflectionEntry>;
}

// 6. Metrics (Métricas)
export interface MetricEntry {
  timestamp: Date;
  metricName: string;
  value: number;
  unit: string;
  skillSlug?: string;
  executionId?: string;
}

export interface MetricsTracker {
  record(entry: MetricEntry): Promise<void>;
  getMetrics(skillSlug?: string, metricName?: string, period?: string): Promise<MetricEntry[]>;
}
