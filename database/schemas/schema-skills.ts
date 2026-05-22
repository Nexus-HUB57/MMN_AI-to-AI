import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Skills Catalog - Catálogo completo de skills para Agentes IA
 * Organizado em 3 níveis: Basic (10), Intermediate (10), Advanced (10)
 * Foco em: Vendas diretas, Marketing Digital, Gestão de Mídias Sociais,
 *          Marketplace, Dropshipping, Processos Operacionais Comerciais
 */
export const skills = mysqlTable(
  "skills",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    slug: varchar("slug", { length: 128 }).notNull().unique(),
    description: text("description").notNull(),
    shortDescription: varchar("shortDescription", { length: 256 }).notNull(),
    level: mysqlEnum("level", ["basic", "intermediate", "advanced"]).notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    subcategory: varchar("subcategory", { length: 64 }),
    price: int("price").notNull(), // Preço em centavos
    originalPrice: int("originalPrice"),
    iconEmoji: varchar("iconEmoji", { length: 8 }),
    badge: varchar("badge", { length: 64 }),
    features: text("features"), // JSON array de features
    requirements: text("requirements"), // Requisitos mínimos
    integrations: text("integrations"), // JSON array de integrações
    useCases: text("useCases"), // JSON array de casos de uso
    targetAudience: mysqlEnum("targetAudience", [
      "all",
      "beginners",
      "intermediates",
      "advanced",
      "enterprise",
    ]).default("all").notNull(),
    status: mysqlEnum("status", ["active", "inactive", "coming_soon"]).default("active").notNull(),
    sortOrder: int("sortOrder").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    levelIdx: index("skills_level_idx").on(table.level),
    categoryIdx: index("skills_category_idx").on(table.category),
    statusIdx: index("skills_status_idx").on(table.status),
    sortOrderIdx: index("skills_sortOrder_idx").on(table.sortOrder),
  })
);

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

/**
 * Agent Skills - Relação many-to-many entre agentes e skills
 */
export const agentSkills = mysqlTable(
  "agent_skills",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(),
    skillId: int("skillId").notNull(),
    proficiency: mysqlEnum("proficiency", [
      "none",
      "basic",
      "intermediate",
      "advanced",
      "expert",
    ]).default("basic").notNull(),
    status: mysqlEnum("status", ["active", "inactive", "expired"]).default("active").notNull(),
    activatedAt: timestamp("activatedAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt"),
    lastUsedAt: timestamp("lastUsedAt"),
    usageCount: int("usageCount").default(0).notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("agent_skills_agentId_idx").on(table.agentId),
    skillIdIdx: index("agent_skills_skillId_idx").on(table.skillId),
    statusIdx: index("agent_skills_status_idx").on(table.status),
    uniqueAgentSkill: index("unique_agent_skill_idx").on(table.agentId, table.skillId),
  })
);

export type AgentSkill = typeof agentSkills.$inferSelect;
export type InsertAgentSkill = typeof agentSkills.$inferInsert;

/**
 * Skill Usage Logs - Logs de uso de skills para analytics
 */
export const skillUsageLogs = mysqlTable(
  "skill_usage_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(),
    skillId: int("skillId").notNull(),
    action: varchar("action", { length: 128 }).notNull(),
    duration: int("duration").notNull(), // Duração em ms
    success: boolean("success").default(true).notNull(),
    errorMessage: text("errorMessage"),
    inputSummary: text("inputSummary"),
    outputSummary: text("outputSummary"),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("skill_usage_logs_agentId_idx").on(table.agentId),
    skillIdIdx: index("skill_usage_logs_skillId_idx").on(table.skillId),
    createdAtIdx: index("skill_usage_logs_createdAt_idx").on(table.createdAt),
  })
);

export type SkillUsageLog = typeof skillUsageLogs.$inferSelect;
export type InsertSkillUsageLog = typeof skillUsageLogs.$inferInsert;

/**
 * Skill Reviews - Avaliações e feedbacks de skills
 */
export const skillReviews = mysqlTable(
  "skill_reviews",
  {
    id: int("id").autoincrement().primaryKey(),
    skillId: int("skillId").notNull(),
    userId: int("userId").notNull(),
    rating: int("rating").notNull(), // 1-5
    title: varchar("title", { length: 128 }),
    comment: text("comment"),
    helpful: int("helpful").default(0).notNull(),
    verified: boolean("verified").default(false).notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    skillIdIdx: index("skill_reviews_skillId_idx").on(table.skillId),
    userIdIdx: index("skill_reviews_userId_idx").on(table.userId),
    ratingIdx: index("skill_reviews_rating_idx").on(table.rating),
    statusIdx: index("skill_reviews_status_idx").on(table.status),
  })
);

export type SkillReview = typeof skillReviews.$inferSelect;
export type InsertSkillReview = typeof skillReviews.$inferInsert;

/**
 * Skill Categories - Categorias para organização das skills
 */
export const skillCategories = mysqlTable(
  "skill_categories",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 64 }).notNull(),
    slug: varchar("slug", { length: 64 }).notNull().unique(),
    description: text("description"),
    iconEmoji: varchar("iconEmoji", { length: 8 }),
    color: varchar("color", { length: 16 }),
    sortOrder: int("sortOrder").default(0),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("skill_categories_slug_idx").on(table.slug),
    sortOrderIdx: index("skill_categories_sortOrder_idx").on(table.sortOrder),
  })
);

export type SkillCategory = typeof skillCategories.$inferSelect;
export type InsertSkillCategory = typeof skillCategories.$inferInsert;