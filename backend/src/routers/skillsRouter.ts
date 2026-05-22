import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { skills, agentSkills, InsertAgentSkill } from "../../../database/schemas/schema-skills";
import { getAgentByUserId } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const skillsRouter = router({
  // ============================================================================
  // SKILLS CATALOG (PÚBLICO)
  // ============================================================================

  /**
   * Lista todas as skills disponíveis no catálogo
   */
  listAvailable: publicProcedure
    .input(
      z.object({
        level: z.enum(["basic", "intermediate", "advanced"]).optional(),
        category: z.string().optional(),
        targetAudience: z.enum(["all", "beginners", "intermediates", "advanced", "enterprise"]).optional(),
        limit: z.number().min(1).max(100).default(30),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { skills: [], total: 0 };

      const { level, category, targetAudience, limit = 30, offset = 0 } = input || {};

      let query = db.select().from(skills).where(eq(skills.status, "active"));

      // Aplicar filtros
      const conditions = [eq(skills.status, "active")];
      if (level) conditions.push(eq(skills.level, level));
      if (category) conditions.push(eq(skills.category, category));
      if (targetAudience) conditions.push(eq(skills.targetAudience, targetAudience));

      const result = await db
        .select()
        .from(skills)
        .where(and(...conditions))
        .orderBy(skills.sortOrder, skills.id)
        .limit(limit)
        .offset(offset);

      const totalResult = await db.select().from(skills).where(and(...conditions));
      const total = totalResult.length;

      return { skills: result, total, limit, offset };
    }),

  /**
   * Busca detalhes de uma skill específica
   */
  getSkillDetails: publicProcedure
    .input(z.object({ skillId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(skills)
        .where(eq(skills.id, input.skillId))
        .limit(1);
      return result[0] ?? null;
    }),

  /**
   * Lista categorias de skills
   */
  listCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(skills)
      .where(eq(skills.status, "active"))
      .groupBy(skills.category);
  }),

  // ============================================================================
  // SKILLS DO AGENTE (PROTEGIDO)
  // ============================================================================

  /**
   * Lista as skills ativas do agente do usuário logado
   */
  listMySkills: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) return [];

    return await db
      .select({
        id: agentSkills.id,
        skillId: agentSkills.skillId,
        proficiency: agentSkills.proficiency,
        status: agentSkills.status,
        activatedAt: agentSkills.activatedAt,
        expiresAt: agentSkills.expiresAt,
        lastUsedAt: agentSkills.lastUsedAt,
        usageCount: agentSkills.usageCount,
        skill: {
          id: skills.id,
          name: skills.name,
          slug: skills.slug,
          description: skills.description,
          shortDescription: skills.shortDescription,
          level: skills.level,
          category: skills.category,
          iconEmoji: skills.iconEmoji,
          features: skills.features,
        },
      })
      .from(agentSkills)
      .innerJoin(skills, eq(agentSkills.skillId, skills.id))
      .where(and(eq(agentSkills.agentId, agent.id), eq(agentSkills.status, "active")));
  }),

  /**
   * Adquire uma skill para o agente
   */
  acquireSkill: protectedProcedure
    .input(z.object({ skillId: z.number(), proficiency: z.enum(["basic", "intermediate", "advanced", "expert"]).default("intermediate") }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const agent = await getAgentByUserId(ctx.user.id);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agente não encontrado",
        });
      }

      // Verificar se a skill existe
      const skill = await db
        .select()
        .from(skills)
        .where(eq(skills.id, input.skillId))
        .limit(1);

      if (!skill || skill.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Skill não encontrada",
        });
      }

      // Verificar se já possui a skill
      const existing = await db
        .select()
        .from(agentSkills)
        .where(
          and(
            eq(agentSkills.agentId, agent.id),
            eq(agentSkills.skillId, input.skillId),
            eq(agentSkills.status, "active")
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Skill já está ativa para este agente",
        });
      }

      // Calcular data de expiração (30 dias)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const newAgentSkill: InsertAgentSkill = {
        agentId: agent.id,
        skillId: input.skillId,
        proficiency: input.proficiency,
        status: "active",
        activatedAt: new Date(),
        expiresAt,
        usageCount: 0,
      };

      await db.insert(agentSkills).values(newAgentSkill);

      return { success: true, skill: skill[0] };
    }),

  /**
   * Renovar uma skill existente
   */
  renewSkill: protectedProcedure
    .input(z.object({ agentSkillId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const agent = await getAgentByUserId(ctx.user.id);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agente não encontrado",
        });
      }

      // Verificar se a skill pertence ao agente
      const existingSkill = await db
        .select()
        .from(agentSkills)
        .where(
          and(
            eq(agentSkills.id, input.agentSkillId),
            eq(agentSkills.agentId, agent.id)
          )
        )
        .limit(1);

      if (!existingSkill || existingSkill.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Skill do agente não encontrada",
        });
      }

      // Calcular nova data de expiração (30 dias)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db
        .update(agentSkills)
        .set({
          status: "active",
          expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(agentSkills.id, input.agentSkillId));

      return { success: true };
    }),

  /**
   * Desativar uma skill do agente
   */
  deactivateSkill: protectedProcedure
    .input(z.object({ agentSkillId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const agent = await getAgentByUserId(ctx.user.id);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agente não encontrado",
        });
      }

      await db
        .update(agentSkills)
        .set({ status: "inactive", updatedAt: new Date() })
        .where(
          and(
            eq(agentSkills.id, input.agentSkillId),
            eq(agentSkills.agentId, agent.id)
          )
        );

      return { success: true };
    }),

  /**
   * Registrar uso de uma skill (para analytics)
   */
  logSkillUsage: protectedProcedure
    .input(
      z.object({
        agentSkillId: z.number(),
        action: z.string(),
        duration: z.number(),
        success: z.boolean().default(true),
        errorMessage: z.string().optional(),
        inputSummary: z.string().optional(),
        outputSummary: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return;

      const agent = await getAgentByUserId(ctx.user.id);
      if (!agent) return;

      // Atualizar contador de uso e última utilização
      await db
        .update(agentSkills)
        .set({
          lastUsedAt: new Date(),
          usageCount: (await db
            .select()
            .from(agentSkills)
            .where(eq(agentSkills.id, input.agentSkillId))
            .limit(1))[0]?.usageCount || 0 + 1,
          updatedAt: new Date(),
        })
        .where(eq(agentSkills.id, input.agentSkillId));
    }),

  // ============================================================================
  // ADMIN SKILLS (PROTEGIDO - ADMIN)
  // ============================================================================

  /**
   * Lista todas as skills (admin) com filtros
   */
  listAll: protectedProcedure
    .input(
      z.object({
        level: z.enum(["basic", "intermediate", "advanced"]).optional(),
        category: z.string().optional(),
        status: z.enum(["active", "inactive", "coming_soon"]).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(30),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { skills: [], total: 0, page: 1, totalPages: 0 };

      const { level, category, status, page = 1, limit = 30 } = input || {};
      const offset = (page - 1) * limit;

      const conditions = [];
      if (level) conditions.push(eq(skills.level, level));
      if (category) conditions.push(eq(skills.category, category));
      if (status) conditions.push(eq(skills.status, status));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await db
        .select()
        .from(skills)
        .where(whereClause)
        .orderBy(desc(skills.sortOrder), desc(skills.id))
        .limit(limit)
        .offset(offset);

      const totalResult = await db.select().from(skills).where(whereClause);
      const total = totalResult.length;
      const totalPages = Math.ceil(total / limit);

      return { skills: result, total, page, totalPages };
    }),

  /**
   * Criar nova skill (admin)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(128),
        slug: z.string().min(1).max(128),
        description: z.string(),
        shortDescription: z.string().max(256),
        level: z.enum(["basic", "intermediate", "advanced"]),
        category: z.string(),
        subcategory: z.string().optional(),
        price: z.number().min(0),
        originalPrice: z.number().optional(),
        iconEmoji: z.string().optional(),
        badge: z.string().optional(),
        features: z.string().optional(),
        requirements: z.string().optional(),
        integrations: z.string().optional(),
        useCases: z.string().optional(),
        targetAudience: z.enum(["all", "beginners", "intermediates", "advanced", "enterprise"]).default("all"),
        status: z.enum(["active", "inactive", "coming_soon"]).default("active"),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      // Verificar se o slug já existe
      const existing = await db
        .select()
        .from(skills)
        .where(eq(skills.slug, input.slug))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Slug já existe para outra skill",
        });
      }

      await db.insert(skills).values({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const created = await db.select().from(skills).where(eq(skills.slug, input.slug)).limit(1);
      return created[0];
    }),

  /**
   * Atualizar skill (admin)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(128).optional(),
        slug: z.string().min(1).max(128).optional(),
        description: z.string().optional(),
        shortDescription: z.string().max(256).optional(),
        level: z.enum(["basic", "intermediate", "advanced"]).optional(),
        category: z.string().optional(),
        subcategory: z.string().optional(),
        price: z.number().min(0).optional(),
        originalPrice: z.number().optional(),
        iconEmoji: z.string().optional(),
        badge: z.string().optional(),
        features: z.string().optional(),
        requirements: z.string().optional(),
        integrations: z.string().optional(),
        useCases: z.string().optional(),
        targetAudience: z.enum(["all", "beginners", "intermediates", "advanced", "enterprise"]).optional(),
        status: z.enum(["active", "inactive", "coming_soon"]).optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const { id, ...updateData } = input;

      await db
        .update(skills)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(skills.id, id));

      const updated = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
      return updated[0];
    }),

  /**
   * Deletar skill (admin)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      await db.delete(skills).where(eq(skills.id, input.id));
      return { success: true };
    }),

  /**
   * Estatísticas de uso de skills (admin)
   */
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalSkills: 0,
        byLevel: { basic: 0, intermediate: 0, advanced: 0 },
        byCategory: {},
        activeAgents: 0,
      };
    }

    const allSkills = await db.select().from(skills);

    const byLevel = {
      basic: allSkills.filter(s => s.level === "basic").length,
      intermediate: allSkills.filter(s => s.level === "intermediate").length,
      advanced: allSkills.filter(s => s.level === "advanced").length,
    };

    const byCategory: Record<string, number> = {};
    allSkills.forEach(s => {
      byCategory[s.category] = (byCategory[s.category] || 0) + 1;
    });

    const activeAgentSkills = await db
      .select()
      .from(agentSkills)
      .where(eq(agentSkills.status, "active"));

    return {
      totalSkills: allSkills.length,
      byLevel,
      byCategory,
      activeAgents: new Set(activeAgentSkills.map(s => s.agentId)).size,
    };
  }),
});