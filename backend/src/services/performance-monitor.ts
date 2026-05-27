/**
 * Performance Monitoring Service for Agentic AI
 *
 * Provides real-time metrics tracking for agent performance,
 * skill usage analytics, and system health monitoring.
 */

import { getDb } from "./db";
import { agentSkills, skillUsageLogs } from "../../../database/schemas/schema-skills";
import { agents } from "../../../database/schemas/schema-final";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface AgentPerformanceMetrics {
  agentId: number;
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  averageResponseTime: number;
  skillsUsage: SkillUsageSummary[];
  uptime: number;
  lastActivity: Date | null;
}

export interface SkillUsageSummary {
  skillId: number;
  skillName: string;
  usageCount: number;
  successRate: number;
  averageDuration: number;
}

export interface SystemHealthMetrics {
  totalAgents: number;
  activeAgents: number;
  totalSkills: number;
  activeSkills: number;
  averagePerformance: number;
  systemUptime: number;
}

/**
 * Get performance metrics for a specific agent
 */
export async function getAgentPerformanceMetrics(agentId: number): Promise<AgentPerformanceMetrics | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get agent info
    const agent = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
    if (!agent || agent.length === 0) return null;

    // Get skill usage stats
    const skillUsage = await db
      .select()
      .from(skillUsageLogs)
      .where(eq(skillUsageLogs.agentId, agentId))
      .orderBy(desc(skillUsageLogs.createdAt))
      .limit(100);

    // Calculate metrics
    const totalActions = skillUsage.length;
    const successfulActions = skillUsage.filter(s => s.success).length;
    const failedActions = totalActions - successfulActions;
    const averageResponseTime = skillUsage.length > 0
      ? skillUsage.reduce((sum, s) => sum + s.duration, 0) / totalActions
      : 0;

    // Get skills summary
    const skillsUsage = await db
      .select({
        skillId: skillUsageLogs.skillId,
        usageCount: sql<number>`COUNT(*)`,
        successRate: sql<number>`AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100`,
        averageDuration: sql<number>`AVG(duration)`,
      })
      .from(skillUsageLogs)
      .where(eq(skillUsageLogs.agentId, agentId))
      .groupBy(skillUsageLogs.skillId);

    const lastActivity = skillUsage.length > 0 ? skillUsage[0].createdAt : null;

    return {
      agentId,
      totalActions,
      successfulActions,
      failedActions,
      averageResponseTime,
      skillsUsage: skillsUsage.map(s => ({
        skillId: s.skillId,
        skillName: `Skill ${s.skillId}`,
        usageCount: Number(s.usageCount) || 0,
        successRate: Number(s.successRate) || 0,
        averageDuration: Number(s.averageDuration) || 0,
      })),
      uptime: Date.now() - agent[0].createdAt.getTime(),
      lastActivity,
    };
  } catch (error) {
    console.error("[PerformanceMonitor] Error getting agent metrics:", error);
    return null;
  }
}

/**
 * Get system-wide health metrics
 */
export async function getSystemHealthMetrics(): Promise<SystemHealthMetrics> {
  const db = await getDb();
  if (!db) {
    return {
      totalAgents: 0,
      activeAgents: 0,
      totalSkills: 0,
      activeSkills: 0,
      averagePerformance: 0,
      systemUptime: 0,
    };
  }

  try {
    // Get agent stats
    const allAgents = await db.select().from(agents);
    const activeAgents = allAgents.filter(a => a.status === "active");

    // Get skill stats
    const allAgentSkills = await db.select().from(agentSkills);
    const activeSkills = allAgentSkills.filter(s => s.status === "active");

    // Calculate average performance
    const averagePerformance = allAgents.length > 0
      ? allAgents.reduce((sum, a) => sum + (a.performanceScore || 0), 0) / allAgents.length
      : 0;

    return {
      totalAgents: allAgents.length,
      activeAgents: activeAgents.length,
      totalSkills: allAgentSkills.length,
      activeSkills: activeSkills.length,
      averagePerformance,
      systemUptime: Date.now(),
    };
  } catch (error) {
    console.error("[PerformanceMonitor] Error getting system metrics:", error);
    return {
      totalAgents: 0,
      activeAgents: 0,
      totalSkills: 0,
      activeSkills: 0,
      averagePerformance: 0,
      systemUptime: 0,
    };
  }
}

/**
 * Log skill usage for analytics
 */
export async function logSkillUsage(
  agentId: number,
  skillId: number,
  action: string,
  duration: number,
  success: boolean,
  errorMessage?: string,
  inputSummary?: string,
  outputSummary?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(skillUsageLogs).values({
      agentId,
      skillId,
      action,
      duration,
      success,
      errorMessage,
      inputSummary,
      outputSummary,
      createdAt: new Date(),
    });

    // Update agent skill usage count
    await db
      .update(agentSkills)
      .set({
        lastUsedAt: new Date(),
        usageCount: sql`usageCount + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(agentSkills.agentId, agentId), eq(agentSkills.skillId, skillId)));
  } catch (error) {
    console.error("[PerformanceMonitor] Error logging skill usage:", error);
  }
}

/**
 * Get recent activity logs for an agent
 */
export async function getRecentActivityLogs(
  agentId: number,
  limit: number = 50
): Promise<typeof skillUsageLogs.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(skillUsageLogs)
      .where(eq(skillUsageLogs.agentId, agentId))
      .orderBy(desc(skillUsageLogs.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[PerformanceMonitor] Error getting recent logs:", error);
    return [];
  }
}