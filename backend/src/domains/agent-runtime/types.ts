export const AGENT_RUNTIME_PLATFORMS = [
  "whatsapp",
  "instagram",
  "facebook",
] as const;

export const AGENT_RUNTIME_TONES = [
  "professional",
  "casual",
  "persuasive",
  "humorous",
] as const;

export type AgentRuntimePlatform = (typeof AGENT_RUNTIME_PLATFORMS)[number];
export type StrategyTone = (typeof AGENT_RUNTIME_TONES)[number];

export interface ContentStrategy {
  platforms?: string[];
  postingFrequency?: string;
  tone?: StrategyTone | string;
  targetAudience?: string;
}

export interface AgentRuntimeAgentRecord {
  id: number;
  userId: number;
  name: string;
  status: string;
  performanceScore: number | null;
  contentStrategy: string | ContentStrategy | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRuntimeUpgradeRecord {
  id: number;
  upgradeId: number;
  status: string;
  activatedAt: Date | null;
  expiresAt: Date | null;
  upgrade: Record<string, unknown>;
}

export interface AgentRuntimeProfileView {
  agent: {
    id: number;
    userId: number;
    name: string;
    status: string;
    performanceScore: number | null;
    contentStrategy: ContentStrategy;
    createdAt: Date;
    updatedAt: Date;
  };
  activeUpgrades: AgentRuntimeUpgradeRecord[];
  skillsCount: number;
}

export interface GenerateAgentContentInput {
  topic: string;
  platform?: AgentRuntimePlatform;
  toneOverride?: StrategyTone;
  maxLength?: number;
  includeHashtags?: boolean;
}

export interface GenerateBatchInput {
  topic: string;
  platform?: AgentRuntimePlatform;
  count: number;
}

export interface AgentRuntimeBatchVariation {
  index: number;
  tone: StrategyTone;
  content: string;
}

export interface AgentRuntimeLlmResponse {
  content?: string | null;
  modelUsed?: string;
  tokensUsed?: number;
}

export interface AgentRuntimeAuditInput {
  id: string;
  userId: number;
  sessionId: string;
  action: string;
  metadata: Record<string, unknown>;
}

export interface RegisterAgentRuntimeActionInput {
  action: string;
  metadata?: Record<string, unknown>;
}
