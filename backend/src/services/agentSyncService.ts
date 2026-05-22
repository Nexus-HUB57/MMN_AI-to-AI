/**
 * AI Agents Sync Service
 *
 * Serviço de sincronização entre Agentes IA, Skills e Models de IA.
 * Implementa a camada de integração entre o sistema de agentes e os modelos LLM.
 *
 * Features:
 * - Sincronização bidirecional entre agente ↔ skills
 * - Configuração de modelos IA por skill
 * - Monitoramento de performance de agentes
 * - Integração com Genkit (Gemini/OpenAI)
 */

import { getDb } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { agents } from "../../database/schemas/schema";
import { skills, agentSkills } from "../../database/schemas/schema-skills";

export interface AgentSyncResult {
  success: boolean;
  agentId: number;
  skillsSynced: number;
  modelsConfigured: number;
  errors: string[];
}

export interface SkillConfig {
  skillId: number;
  skillName: string;
  level: "basic" | "intermediate" | "advanced";
  category: string;
  recommendedModels: string[];
  capabilities: string[];
}

export interface AgentSyncProfile {
  agentId: number;
  userId: number;
  currentSkills: SkillConfig[];
  availableModels: string[];
  recommendedActions: string[];
}

// Configuração de modelos por categoria de skill
const MODEL_RECOMMENDATIONS: Record<string, string[]> = {
  copywriting: ["gemini-2.0-flash", "gpt-4o-mini"],
  social_media: ["gemini-2.0-flash", "gpt-4o-mini"],
  analytics: ["gemini-pro", "gpt-4o"],
  ads: ["gemini-2.0-flash", "gpt-4o"],
  ecommerce: ["gemini-2.0-flash", "gpt-4o-mini"],
  automation: ["gemini-pro", "gpt-4o"],
  sales: ["gemini-pro", "gpt-4o"],
  seo: ["gemini-2.0-flash", "gpt-4o-mini"],
  crm: ["gemini-2.0-flash", "gpt-4o-mini"],
  mmn: ["gemini-pro", "gpt-4o"],
};

// Mapeamento de capabilities por nível de skill
const LEVEL_CAPABILITIES: Record<string, string[]> = {
  basic: ["text_generation", "basic_analytics", "scheduling"],
  intermediate: ["text_generation", "image_generation", "analytics", "automation", "scheduling"],
  advanced: ["text_generation", "image_generation", "video_generation", "analytics", "automation", "scheduling", "advanced_seo", "multi_channel"],
};

export class AgentSyncService {
  /**
   * Sincroniza as skills de um agente com base nas suas necessidades
   */
  async syncAgentSkills(agentId: number): Promise<AgentSyncResult> {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        agentId,
        skillsSynced: 0,
        modelsConfigured: 0,
        errors: ["Database not available"],
      };
    }

    const errors: string[] = [];
    let skillsSynced = 0;
    let modelsConfigured = 0;

    try {
      // Busca o agente
      const agent = await db
        .select()
        .from(agents)
        .where(eq(agents.id, agentId))
        .limit(1);

      if (!agent || agent.length === 0) {
        return {
          success: false,
          agentId,
          skillsSynced: 0,
          modelsConfigured: 0,
          errors: ["Agent not found"],
        };
      }

      // Busca as skills ativas do agente
      const agentActiveSkills = await db
        .select({
          skillId: agentSkills.skillId,
          status: agentSkills.status,
        })
        .from(agentSkills)
        .where(
          and(
            eq(agentSkills.agentId, agentId),
            eq(agentSkills.status, "active")
          )
        );

      // Para cada skill ativa, configura o modelo recomendado
      for (const agentSkill of agentActiveSkills) {
        const skill = await db
          .select()
          .from(skills)
          .where(eq(skills.id, agentSkill.skillId))
          .limit(1);

        if (skill && skill.length > 0) {
          const category = skill[0].category;
          const models = MODEL_RECOMMENDATIONS[category] || MODEL_RECOMMENDATIONS.copywriting;

          // Aqui você pode adicionar lógica para atualizar a configuração do agente
          // com os modelos recomendados para cada skill
          modelsConfigured += models.length;
          skillsSynced++;
        }
      }

      return {
        success: true,
        agentId,
        skillsSynced,
        modelsConfigured,
        errors,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(message);
      return {
        success: false,
        agentId,
        skillsSynced,
        modelsConfigured,
        errors,
      };
    }
  }

  /**
   * Obtém o perfil de sincronização de um agente
   */
  async getAgentSyncProfile(agentId: number): Promise<AgentSyncProfile | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      // Busca o agente
      const agent = await db
        .select()
        .from(agents)
        .where(eq(agents.id, agentId))
        .limit(1);

      if (!agent || agent.length === 0) return null;

      // Busca as skills ativas com detalhes
      const agentActiveSkills = await db
        .select({
          skillId: agentSkills.skillId,
        })
        .from(agentSkills)
        .innerJoin(skills, eq(agentSkills.skillId, skills.id))
        .where(
          and(
            eq(agentSkills.agentId, agentId),
            eq(agentSkills.status, "active")
          )
        );

      const currentSkills: SkillConfig[] = agentActiveSkills.map((as) => ({
        skillId: as.skills.id,
        skillName: as.skills.name,
        level: as.skills.level as "basic" | "intermediate" | "advanced",
        category: as.skills.category,
        recommendedModels: MODEL_RECOMMENDATIONS[as.skills.category] || ["gemini-2.0-flash"],
        capabilities: LEVEL_CAPABILITIES[as.skills.level] || LEVEL_CAPABILITIES.basic,
      }));

      // Coleta todos os modelos únicos recomendados
      const modelSet = new Set<string>();
      currentSkills.forEach((skill) => {
        skill.recommendedModels.forEach((model) => modelSet.add(model));
      });

      // Gera ações recomendadas baseadas nas skills
      const recommendedActions = this.generateRecommendedActions(currentSkills);

      return {
        agentId,
        userId: agent[0].userId,
        currentSkills,
        availableModels: Array.from(modelSet),
        recommendedActions,
      };
    } catch (error) {
      console.error("[AgentSyncService] Failed to get sync profile:", error);
      return null;
    }
  }

  /**
   * Gera ações recomendadas baseadas nas skills atuais do agente
   */
  private generateRecommendedActions(skills: SkillConfig[]): string[] {
    const actions: string[] = [];
    const categories = new Set(skills.map((s) => s.category));

    if (categories.has("copywriting") && categories.has("social_media")) {
      actions.push("Habilitar geração de conteúdo automático");
    }

    if (categories.has("ads")) {
      actions.push("Configurar campañas de publicidad");
    }

    if (categories.has("analytics")) {
      actions.push("Ativar dashboard de métricas");
    }

    if (categories.has("automation")) {
      actions.push("Configurar automações de follow-up");
    }

    if (skills.filter((s) => s.level === "basic").length >= 3) {
      actions.push("Considerar upgrade para skills intermediárias");
    }

    if (skills.filter((s) => s.level === "intermediate").length >= 3) {
      actions.push("Explorar skills avançadas para diferenciação");
    }

    return actions;
  }

  /**
   * Sincroniza todos os agentes ativos (para uso em cron jobs)
   */
  async syncAllAgents(): Promise<{ synced: number; errors: number }> {
    const db = await getDb();
    if (!db) return { synced: 0, errors: 0 };

    let synced = 0;
    let errors = 0;

    try {
      const activeAgents = await db
        .select({ id: agents.id })
        .from(agents)
        .where(eq(agents.status, "active"));

      for (const agent of activeAgents) {
        const result = await this.syncAgentSkills(agent.id);
        if (result.success) {
          synced++;
        } else {
          errors++;
        }
      }
    } catch (error) {
      console.error("[AgentSyncService] Batch sync failed:", error);
      errors++;
    }

    return { synced, errors };
  }

  /**
   * Verifica e atualiza status de skills expiradas
   */
  async checkExpiredSkills(): Promise<number> {
    const db = await getDb();
    if (!db) return 0;

    try {
      const now = new Date();
      const expiredSkills = await db
        .select()
        .from(agentSkills)
        .where(
          and(
            eq(agentSkills.status, "active"),
          )
        );

      let expired = 0;
      for (const agentSkill of expiredSkills) {
        if (agentSkill.expiresAt && agentSkill.expiresAt < now) {
          await db
            .update(agentSkills)
            .set({ status: "expired", updatedAt: now })
            .where(eq(agentSkills.id, agentSkill.id));
          expired++;
        }
      }

      return expired;
    } catch (error) {
      console.error("[AgentSyncService] Check expired skills failed:", error);
      return 0;
    }
  }
}

export const agentSyncService = new AgentSyncService();