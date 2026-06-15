import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Video Projects Table
export const videoProjects = mysqlTable("video_projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  persona: mysqlEnum("persona", ["Ive", "Alencar", "dupla"]).notNull(),
  level: mysqlEnum("level", ["Fundamental", "Agente", "Master", "Elite"]).notNull(),
  module: varchar("module", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["draft", "script_generated", "script_edited", "image_generated", "completed"]).default("draft").notNull(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoProject = typeof videoProjects.$inferSelect;
export type InsertVideoProject = typeof videoProjects.$inferInsert;

// Scripts Table
export const scripts = mysqlTable("scripts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  content: text("content").notNull(),
  isEdited: mysqlEnum("isEdited", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Script = typeof scripts.$inferSelect;
export type InsertScript = typeof scripts.$inferInsert;

// Generation History Table
export const generationHistory = mysqlTable("generation_history", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: mysqlEnum("type", ["script", "image"]).notNull(),
  status: mysqlEnum("status", ["pending", "success", "failed"]).notNull(),
  result: json("result"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GenerationHistory = typeof generationHistory.$inferSelect;
export type InsertGenerationHistory = typeof generationHistory.$inferInsert;

// Relations
export const userRelations = relations(users, ({ many }) => ({
  videoProjects: many(videoProjects),
}));

export const videoProjectRelations = relations(videoProjects, ({ one, many }) => ({
  user: one(users, {
    fields: [videoProjects.userId],
    references: [users.id],
  }),
  scripts: many(scripts),
  generationHistory: many(generationHistory),
}));

export const scriptRelations = relations(scripts, ({ one }) => ({
  project: one(videoProjects, {
    fields: [scripts.projectId],
    references: [videoProjects.id],
  }),
}));

export const generationHistoryRelations = relations(generationHistory, ({ one }) => ({
  project: one(videoProjects, {
    fields: [generationHistory.projectId],
    references: [videoProjects.id],
  }),
}));