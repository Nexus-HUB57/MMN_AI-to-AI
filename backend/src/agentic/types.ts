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

// ============================================================================
// FASE BETA - TIPOS EXPANDIDOS
// ============================================================================

// Multi-Agent Coordination Types
export type AgentRole = "supervisor" | "worker" | "validator" | "specialist";
export type ConsensusStatus = "pending" | "approved" | "rejected" | "requires_revision";

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  category: "marketing" | "sales" | "content" | "analytics" | "automation";
  enabled: boolean;
  version: string;
  capabilities: string[];
}

export interface AgentContext {
  sessionId: string;
  agentId: string;
  role: AgentRole;
  skills: AgentSkill[];
  memory: AgentMemoryRecord[];
  goals: string[];
  constraints: string[];
}

export interface ExecutionNode {
  id: string;
  type: "planning" | "decision" | "action" | "validation" | "retry" | "audit";
  status: "pending" | "running" | "completed" | "failed";
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  timestamp: number;
  latencyMs?: number;
}

export interface ExecutionChain {
  id: string;
  sessionId: string;
  nodes: ExecutionNode[];
  currentNodeIndex: number;
  status: "active" | "completed" | "failed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface ConsensusDecision {
  id: string;
  sessionId: string;
  proposal: string;
  votes: Array<{ agentId: string; decision: "approve" | "reject" | "abstain" }>;
  status: ConsensusStatus;
  reasoning?: string;
  timestamp: string;
}

// Vector Memory Types
export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface VectorMemoryConfig {
  provider: "pgvector" | "qdrant" | "pinecone" | "local";
  dimensions: number;
  similarityThreshold: number;
  maxResults: number;
}

// Tool Registry Types
export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: Record<string, unknown>;
  returns: Record<string, unknown>;
  sandboxed: boolean;
  rateLimit?: { maxCalls: number; windowMs: number };
}

export interface ToolExecutionContext {
  toolId: string;
  sessionId: string;
  userId?: string;
  parameters: Record<string, unknown>;
  timeout: number;
  retryCount: number;
}

// Agentic Event Types
export interface AgenticEvent {
  type:
    | "session_started"
    | "session_completed"
    | "session_failed"
    | "action_executed"
    | "skill_activated"
    | "checkpoint_created"
    | "consensus_reached"
    | "chain_completed";
  sessionId: string;
  agentId?: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// Observability Types
export interface AgenticMetrics {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  failedSessions: number;
  averageExecutionTime: number;
  successRate: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface AgenticTrace {
  traceId: string;
  sessionId: string;
  spans: Array<{
    name: string;
    startTime: number;
    endTime: number;
    attributes: Record<string, unknown>;
  }>;
}
