import { 
  MemoryManager, 
  Reflector, 
  MetricsTracker, 
  ReasoningStep, 
  ReflectionEntry 
} from "./agenticCore";

export interface SkillExecutionContext {
  memory: MemoryManager;
  reflector?: Reflector;
  metrics: MetricsTracker;
  autonomyAllowed: boolean;
  [key: string]: any;
}

export interface SkillExecutionResult<T = any> {
  executionId: string;
  skill: string;
  success: boolean;
  decision: "auto" | "needs_review";
  latencyMs: number;
  output: T;
  warnings?: string[];
  message: string;
}

export interface SkillHandler<I = any, O = any> {
  slug: string;
  title: string;
  category: string;
  version: string;
  supportsAutonomous: boolean;
  parseInput: (raw: unknown) => I;
  execute: (input: I, context: SkillExecutionContext) => Promise<SkillExecutionResult<O>>;
}
