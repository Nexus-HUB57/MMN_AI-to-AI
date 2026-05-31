/**
 * Schema de extensões do Agente AI
 * Tabelas usadas pelos painéis: ImageGenerator, SkillsUpgrades,
 * RecommendedProducts, ContentGenerator e PostScheduler.
 */
import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";

/** Imagens geradas por agentes */
export const generatedImages = pgTable(
  "generated_images",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agentId").notNull(),
    prompt: text("prompt").notNull(),
    imageUrl: text("imageUrl").notNull(),
    storageKey: varchar("storageKey", { length: 255 }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    agentIdx: index("generated_images_agent_idx").on(table.agentId),
    createdIdx: index("generated_images_created_idx").on(table.createdAt),
  }),
);

/** Produtos recomendados pelo agente para a vitrine do afiliado */
export const recommendedProducts = pgTable(
  "recommended_products",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agentId").notNull(),
    productName: varchar("productName", { length: 255 }).notNull(),
    description: text("description"),
    marketplace: varchar("marketplace", { length: 50 }).notNull(),
    relevanceScore: integer("relevanceScore").notNull().default(50),
    affiliateLink: text("affiliateLink").notNull(),
    productUrl: text("productUrl"),
    price: numeric("price", { precision: 12, scale: 2 }),
    commission: numeric("commission", { precision: 5, scale: 2 }),
    imageUrl: text("imageUrl"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    agentIdx: index("recommended_products_agent_idx").on(table.agentId),
    marketplaceIdx: index("recommended_products_marketplace_idx").on(table.marketplace),
  }),
);

/** Skills adquiridas por agente (runtime, separado do catálogo /skills) */
export const agentSkillsRuntime = pgTable(
  "agent_skills_runtime",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agentId").notNull(),
    skillName: varchar("skillName", { length: 150 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 20 }).notNull().default("locked"),
    proficiency: integer("proficiency").notNull().default(0),
    cost: integer("cost").notNull().default(0),
    acquiredAt: timestamp("acquiredAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    agentIdx: index("agent_skills_runtime_agent_idx").on(table.agentId),
    statusIdx: index("agent_skills_runtime_status_idx").on(table.status),
  }),
);

/** Histórico evolutivo do agente */
export const agentEvolutionHistory = pgTable(
  "agent_evolution_history",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agentId").notNull(),
    eventType: varchar("eventType", { length: 80 }).notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    agentIdx: index("agent_evolution_history_agent_idx").on(table.agentId),
    createdIdx: index("agent_evolution_history_created_idx").on(table.createdAt),
  }),
);

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = typeof generatedImages.$inferInsert;
export type RecommendedProduct = typeof recommendedProducts.$inferSelect;
export type InsertRecommendedProduct = typeof recommendedProducts.$inferInsert;
export type AgentSkillRuntime = typeof agentSkillsRuntime.$inferSelect;
export type InsertAgentSkillRuntime = typeof agentSkillsRuntime.$inferInsert;
export type AgentEvolutionHistory = typeof agentEvolutionHistory.$inferSelect;
export type InsertAgentEvolutionHistory = typeof agentEvolutionHistory.$inferInsert;
