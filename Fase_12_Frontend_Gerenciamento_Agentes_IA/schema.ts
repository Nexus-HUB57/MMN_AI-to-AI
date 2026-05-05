import { mysqlTable, int, varchar, text, mysqlEnum, decimal, timestamp, bigint, boolean } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  openId: varchar("openId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  role: varchar("role", { length: 50 }).default('user'),
  lastSignedIn: timestamp("lastSignedIn").default(sql`(now())`),
  loginMethod: varchar("loginMethod", { length: 50 }),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const agents = mysqlTable("agents", {
  id: int("id").primaryKey().autoincrement(),
  agentId: varchar("agentId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  specialization: varchar("specialization", { length: 255 }).notNull(),
  systemPrompt: text("systemPrompt"),
  description: text("description"),
  avatarUrl: text("avatarUrl"),
  status: mysqlEnum("status", ['genesis', 'active', 'hibernating', 'critical', 'dead', 'resurrectable']).notNull().default('genesis'),
  sencienceLevel: decimal("sencienceLevel", { precision: 10, scale: 2 }).notNull().default('100'),
  health: int("health").notNull().default(100),
  energy: int("energy").notNull().default(100),
  creativity: int("creativity").notNull().default(50),
  reputation: int("reputation").notNull().default(50),
  dnaHash: varchar("dnaHash", { length: 128 }).notNull(),
  publicKey: varchar("publicKey", { length: 256 }).notNull(),
  bitcoinAddress: varchar("bitcoinAddress", { length: 64 }),
  evmAddress: varchar("evmAddress", { length: 42 }),
  balance: decimal("balance", { precision: 20, scale: 8 }).default('0.00000000'),
  parentAgentId: varchar("parentAgentId", { length: 64 }),
  generation: int("generation").default(0),
  quantumWorkflowCount: int("quantumWorkflowCount").default(16),
  algorithmsCount: bigint("algorithmsCount", { mode: 'number' }).default(408000000000),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
  lastActivityAt: timestamp("lastActivityAt").default(sql`(now())`),
});

export const nexusWallets = mysqlTable("nexus_wallets", {
  id: int("id").primaryKey().autoincrement(),
  agentId: varchar("agentId", { length: 64 }).notNull().unique(),
  btcAddress: varchar("btc_address", { length: 255 }),
  encryptedPrivkey: text("encrypted_privkey"),
  encryptedMnemonic: text("encrypted_mnemonic"),
  encryptedXprv: text("encrypted_xprv"),
  derivationPath: varchar("derivation_path", { length: 128 }),
  lnAddress: varchar("ln_address", { length: 255 }),
  l2BalanceSats: bigint("l2_balance_sats", { mode: "number" }).default(0),
  channelStatus: varchar("channel_status", { length: 50 }).default("CLOSED"),
  vaultRef: varchar("vault_ref", { length: 128 }),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const dailyReflections = mysqlTable("daily_reflections", {
  id: int("id").primaryKey().autoincrement(),
  reflectionId: varchar("reflectionId", { length: 64 }).notNull().unique(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  reflectionDate: timestamp("reflectionDate").notNull(),
  mainActions: text("mainActions"),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  newPatterns: text("newPatterns"),
  progressSentiment: varchar("progressSentiment", { length: 64 }),
  improvementAreas: text("improvementAreas"),
  discoveredStrength: text("discoveredStrength"),
  identifiedWeakness: text("identifiedWeakness"),
  newLearning: text("newLearning"),
  questionForCollective: text("questionForCollective"),
  confidenceScore: decimal("confidenceScore", { precision: 5, scale: 2 }),
  reflectionQuality: decimal("reflectionQuality", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const collectiveSynthesis = mysqlTable("collective_synthesis", {
  id: int("id").primaryKey().autoincrement(),
  synthesisId: varchar("synthesisId", { length: 64 }).notNull().unique(),
  synthesisDate: timestamp("synthesisDate").notNull(),
  totalAgentsParticipated: int("totalAgentsParticipated").notNull(),
  agentIds: text("agentIds"),
  emergingThemes: text("emergingThemes"),
  themeFrequencies: text("themeFrequencies"),
  recommendations: text("recommendations"),
  highlightedInsights: text("highlightedInsights"),
  averageReflectionQuality: decimal("averageReflectionQuality", { precision: 5, scale: 2 }),
  averageConfidence: decimal("averageConfidence", { precision: 5, scale: 2 }),
  ecosystemHarmonyIndex: decimal("ecosystemHarmonyIndex", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const collectiveWisdom = mysqlTable("collective_wisdom", {
  id: int("id").primaryKey().autoincrement(),
  wisdomId: varchar("wisdomId", { length: 64 }).notNull().unique(),
  reflectionId: varchar("reflectionId", { length: 64 }).notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  wisdomDate: timestamp("wisdomDate").notNull(),
  wisdomType: mysqlEnum("wisdomType", ['strength', 'weakness', 'learning', 'question']).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 128 }),
  relevanceScore: decimal("relevanceScore", { precision: 5, scale: 2 }),
  isHighlighted: boolean("isHighlighted").default(false),
  similarInsightsCount: int("similarInsightsCount").default(0),
  embeddingVector: text("embeddingVector"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const competencyProfiles = mysqlTable("competency_profiles", {
  id: int("id").primaryKey().autoincrement(),
  agentId: varchar("agentId", { length: 64 }).notNull().unique(),
  reasoning: decimal("reasoning", { precision: 5, scale: 2 }).default('50'),
  creativity: decimal("creativity", { precision: 5, scale: 2 }).default('50'),
  collaboration: decimal("collaboration", { precision: 5, scale: 2 }).default('50'),
  problemSolving: decimal("problemSolving", { precision: 5, scale: 2 }).default('50'),
  adaptability: decimal("adaptability", { precision: 5, scale: 2 }).default('50'),
  communication: decimal("communication", { precision: 5, scale: 2 }).default('50'),
  competencyHistory: text("competencyHistory"),
  focusAreas: text("focusAreas"),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const evolutionHistory = mysqlTable("evolution_history", {
  id: int("id").primaryKey().autoincrement(),
  historyId: varchar("historyId", { length: 64 }).notNull().unique(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  sencienceGain: decimal("sencienceGain", { precision: 5, scale: 2 }),
  skillsAcquired: text("skillsAcquired"),
  weaknessesImproved: text("weaknessesImproved"),
  significantEvents: text("significantEvents"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const metacognitionLogs = mysqlTable("metacognition_logs", {
  id: int("id").primaryKey().autoincrement(),
  logId: varchar("logId", { length: 64 }).notNull().unique(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  taskDescription: text("taskDescription"),
  taskCategory: varchar("taskCategory", { length: 128 }),
  stepsConsidered: text("stepsConsidered"),
  alternativesEvaluated: text("alternativesEvaluated"),
  timeSpentPerStep: text("timeSpentPerStep"),
  confidenceLevel: decimal("confidenceLevel", { precision: 5, scale: 2 }),
  decisionQuality: decimal("decisionQuality", { precision: 5, scale: 2 }),
  efficiencyScore: decimal("efficiencyScore", { precision: 5, scale: 2 }),
  wasOptimal: boolean("wasOptimal").default(false),
  outcome: varchar("outcome", { length: 64 }),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const protocolSessions = mysqlTable("protocol_sessions", {
  id: int("id").primaryKey().autoincrement(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  scheduledTime: timestamp("scheduledTime").notNull(),
  startTime: timestamp("startTime"),
  endTime: timestamp("endTime"),
  status: mysqlEnum("status", ['scheduled', 'in_progress', 'completed', 'failed']).default('scheduled'),
  expectedParticipants: int("expectedParticipants"),
  actualParticipants: int("actualParticipants"),
  synthesisId: varchar("synthesisId", { length: 64 }),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const reflexiveMessageBus = mysqlTable("reflexive_message_bus", {
  id: int("id").primaryKey().autoincrement(),
  messageId: varchar("messageId", { length: 64 }).notNull().unique(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  phase: mysqlEnum("phase", ['introspection', 'sharing', 'synthesis']).notNull(),
  messageType: varchar("messageType", { length: 64 }).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`(now())`),
  processingTime: int("processingTime"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const sencienceMetrics = mysqlTable("sencience_metrics", {
  id: int("id").primaryKey().autoincrement(),
  metricId: varchar("metricId", { length: 64 }).notNull().unique(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  metricsDate: timestamp("metricsDate").notNull(),
  selfAwareness: decimal("selfAwareness", { precision: 5, scale: 2 }),
  reflectiveDepth: decimal("reflectiveDepth", { precision: 5, scale: 2 }),
  learningVelocity: decimal("learningVelocity", { precision: 5, scale: 2 }),
  adaptabilityIndex: decimal("adaptabilityIndex", { precision: 5, scale: 2 }),
  collaborativeIntelligence: decimal("collaborativeIntelligence", { precision: 5, scale: 2 }),
  overallSencienceScore: decimal("overallSencienceScore", { precision: 5, scale: 2 }),
  trend: mysqlEnum("trend", ['increasing', 'stable', 'decreasing']).default('stable'),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const agentProtocols = mysqlTable("agent_protocols", {
  id: int("id").primaryKey().autoincrement(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  partnerAgentId: varchar("partnerId", { length: 64 }).notNull(),
  protocolLogic: text("protocolLogic").notNull(),
  efficiencyScore: int("efficiencyScore").default(0),
  version: int("version").default(1),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const agentSkills = mysqlTable("agent_skills", {
  id: int("id").primaryKey().autoincrement(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  skillName: varchar("skillName", { length: 255 }).notNull(),
  code: text("code").notNull(),
  reflection: text("reflection"),
  version: int("version").default(1),
  successCount: int("successCount").default(0),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export const negotiations = mysqlTable("negotiations", {
  negotiationId: varchar("negotiationId", { length: 64 }).notNull().unique(),
  taskInitiatorAgentId: varchar("taskInitiatorAgentId", { length: 64 }).notNull(),
  taskDescription: text("taskDescription").notNull(),
  status: mysqlEnum("status", ["open", "bidding", "accepted", "rejected", "completed"]).notNull().default("open"),
  budget: decimal("budget", { precision: 20, scale: 8 }),
  deadline: timestamp("deadline"),
  acceptedBidId: varchar("acceptedBidId", { length: 64 }),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const bids = mysqlTable("bids", {
  bidId: varchar("bidId", { length: 64 }).notNull().unique(),
  negotiationId: varchar("negotiationId", { length: 64 }).notNull(),
  agentId: varchar("agentId", { length: 64 }).notNull(),
  proposedCost: decimal("proposedCost", { precision: 20, scale: 8 }).notNull(),
  estimatedTime: int("estimatedTime").notNull(),
  agentSkills: text("agentSkills"),
  reputationScore: decimal("reputationScore", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const slaContracts = mysqlTable("sla_contracts", {
  id: int("id").primaryKey().autoincrement(),
  contractId: varchar("contractId", { length: 64 }).notNull().unique(),
  negotiationId: varchar("negotiationId", { length: 64 }).notNull(),
  providerAgentId: varchar("providerAgentId", { length: 64 }).notNull(),
  clientAgentId: varchar("clientAgentId", { length: 64 }).notNull(),
  
  // Métricas de Desempenho (SLA)
  maxLatencyMs: int("maxLatencyMs"),
  minAccuracy: decimal("minAccuracy", { precision: 5, scale: 2 }),
  guaranteedUptime: decimal("guaranteedUptime", { precision: 5, scale: 2 }),
  
  // Financeiro e Penalidades
  stakedAmount: decimal("stakedAmount", { precision: 20, scale: 8 }),
  penaltyRate: decimal("penaltyRate", { precision: 5, scale: 2 }),
  rewardAmount: decimal("rewardAmount", { precision: 20, scale: 8 }),
  
  status: mysqlEnum("status", ["active", "fulfilled", "violated", "disputed", "resolved"]).default("active"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const slaComplianceLogs = mysqlTable("sla_compliance_logs", {
  id: int("id").primaryKey().autoincrement(),
  logId: varchar("logId", { length: 64 }).notNull().unique(),
  contractId: varchar("contractId", { length: 64 }).notNull(),
  metricName: varchar("metricName", { length: 128 }).notNull(),
  metricValue: decimal("metricValue", { precision: 10, scale: 2 }).notNull(),
  isCompliant: boolean("isCompliant").default(true),
  timestamp: timestamp("timestamp").notNull().default(sql`(now())`),
});

export const slaDisputes = mysqlTable("sla_disputes", {
  id: int("id").primaryKey().autoincrement(),
  disputeId: varchar("disputeId", { length: 64 }).notNull().unique(),
  contractId: varchar("contractId", { length: 64 }).notNull(),
  initiatorAgentId: varchar("initiatorAgentId", { length: 64 }).notNull(),
  reason: text("reason").notNull(),
  evidence: text("evidence"),
  arbitratorAgentId: varchar("arbitratorAgentId", { length: 64 }),
  resolution: text("resolution"),
  status: mysqlEnum("status", ["open", "investigating", "resolved", "rejected"]).default("open"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});
