/**
 * Role-Based Access Control (RBAC) System
 *
 * Sistema de permissões granular com roles, permissions e resource-based access.
 */

import { pgTable, varchar, boolean, timestamp, text } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  isSystem: boolean('is_system').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const permissions = pgTable('permissions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  resource: varchar('resource', { length: 50 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const rolePermissions = pgTable('role_permissions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  roleId: varchar('role_id', { length: 36 }).notNull().references(() => roles.id),
  permissionId: varchar('permission_id', { length: 36 }).notNull().references(() => permissions.id),
  createdAt: timestamp('created_at').defaultNow()
});

export const userRoles = pgTable('user_roles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  roleId: varchar('role_id', { length: 36 }).notNull().references(() => roles.id),
  createdAt: timestamp('created_at').defaultNow()
});

export const userCustomPermissions = pgTable('user_custom_permissions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  permissionId: varchar('permission_id', { length: 36 }).notNull().references(() => permissions.id),
  isGranted: boolean('is_granted').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const resourcePolicies = pgTable('resource_policies', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  resource: varchar('resource', { length: 50 }).notNull(),
  resourceId: varchar('resource_id', { length: 36 }),
  action: varchar('action', { length: 50 }).notNull(),
  isGranted: boolean('is_granted').default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export type RoleSlug =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'affiliate'
  | 'affiliate_premium'
  | 'customer'
  | 'support'
  | 'developer';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

export type PermissionResource =
  | 'users'
  | 'affiliates'
  | 'orders'
  | 'products'
  | 'commissions'
  | 'payments'
  | 'reports'
  | 'settings'
  | 'agents'
  | 'content'
  | 'marketplace';

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type UserCustomPermission = typeof userCustomPermissions.$inferSelect;
export type ResourcePolicy = typeof resourcePolicies.$inferSelect;
