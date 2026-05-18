export type AgenticChannel = "instagram" | "whatsapp";
export type AgenticSessionStatus = "planned" | "queued" | "running" | "completed" | "failed";
export type AgenticActionStatus = "queued" | "running" | "completed" | "failed" | "skipped";
export type AgenticJudgeVerdict = "pass" | "revise" | "fail";

export interface MarketingDraft {
  headline: string;
  body: string;
  cta: string;
  hashtags: string[];
  tone: string;
  channel: AgenticChannel;
}

export interface ToolExecutionInput {
  sessionId: string;
  goal: string;
  audience: string;
  offer: string;
  brandVoice?: string;
  constraints?: string[];
  cta?: string;
}

export interface ToolExecutionOutput {
  success: boolean;
  toolName: string;
  draft: MarketingDraft;
  previewUrl: string;
  warnings: string[];
  metadata?: Record<string, unknown>;
}

export interface AgenticSession {
  id: string;
  userId?: number;
  goal: string;
  audience: string;
  offer: string;
  channel: AgenticChannel;
  status: AgenticSessionStatus;
  plan: string[];
  summary?: string;
  qualityScore: number;
  latestDraft?: MarketingDraft;
  lastActionId?: string;
  checkpoints: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentActionAudit {
  id: string;
  sessionId: string;
  actionKey: string;
  toolName: string;
  status: AgenticActionStatus;
  judgeVerdict?: AgenticJudgeVerdict;
  score?: number;
  inputSummary: string;
  outputSummary?: string;
  reasoning?: string;
  latencyMs?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentMemoryRecord {
  id: string;
  sessionId: string;
  memoryType: "brief" | "strategy" | "creative" | "judge" | "learning";
  content: string;
  tags: string[];
  vector: number[];
  importance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCheckpoint {
  id: string;
  sessionId: string;
  reason: string;
  snapshot: Record<string, unknown>;
  createdAt: string;
}

export interface JudgeResult {
  score: number;
  verdict: AgenticJudgeVerdict;
  reasoning: string;
  rubric: Record<string, number>;
}

export interface AgentQueueJob {
  id: string;
  sessionId: string;
  type: string;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
}

export interface AgenticSessionDetail extends AgenticSession {
  actions: AgentActionAudit[];
  memories: AgentMemoryRecord[];
  checkpointsList: AgentCheckpoint[];
  queueJobs: AgentQueueJob[];
}
