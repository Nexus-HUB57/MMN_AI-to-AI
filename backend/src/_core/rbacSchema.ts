/**
 * Role-Based Access Control (RBAC) System
 *
 * Sistema de permissões granular com roles, permissions e resource-based access.
 */

import { mysqlTable, varchar, boolean, timestamp, text, int } from 'drizzle-orm/mysql-core';

// ============================================
// SCHEMA DO BANCO DE DADOS
// ============================================

/**
 * Roles - Papéis do sistema
 */
export const roles = mysqlTable('roles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  isSystem: boolean('is_system').default(false),  // Roles de sistema não podem ser deletados
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

/**
 * Permissions - Permissões individuais
 */
export const permissions = mysqlTable('permissions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  resource: varchar('resource', { length: 50 }).notNull(),    // Recurso (users, orders, etc)
  action: varchar('action', { length: 50 }).notNull(),       // Ação (create, read, update, delete)
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * RolePermissions - Permissões atribuídas a roles
 */
export const rolePermissions = mysqlTable('role_permissions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  roleId: varchar('role_id', { length: 36 }).notNull().references(() => roles.id),
  permissionId: varchar('permission_id', { length: 36 }).notNull().references(() => permissions.id),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * UserRoles - Roles atribuídas a usuários
 */
export const userRoles = mysqlTable('user_roles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => roles.id), // Refere-se a users.id
  roleId: varchar('role_id', { length: 36 }).notNull().references(() => roles.id),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * UserCustomPermissions - Permissões customizadas por usuário
 */
export const userCustomPermissions = mysqlTable('user_custom_permissions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  permissionId: varchar('permission_id', { length: 36 }).notNull().references(() => permissions.id),
  isGranted: boolean('is_granted').default(true),  // true = granted, false = denied
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * ResourcePolicies - Políticas de recursos específicos
 */
export const resourcePolicies = mysqlTable('resource_policies', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  resource: varchar('resource', { length: 50 }).notNull(),
  resourceId: varchar('resource_id', { length: 36 }),  // ID específico do recurso (opcional)
  action: varchar('action', { length: 50 }).notNull(),
  isGranted: boolean('is_granted').default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// ============================================
// TIPOS E INTERFACES
// ============================================

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

export interface Role {
  id: string;
  name: string;
  slug: RoleSlug;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  description?: string;
  resource: string;
  action: PermissionAction;
  isActive: boolean;
}

export interface UserPermissions {
  directPermissions: Permission[];
  rolePermissions: Permission[];
  customPermissions: Permission[];
  deniedPermissions: Permission[];
  resourcePolicies: ResourcePolicy[];
}

export interface ResourcePolicy {
  resource: string;
  resourceId?: string;
  action: string;
  isGranted: boolean;
  expiresAt?: Date;
}

export interface AccessContext {
  userId: string;
  userRoles: Role[];
  permissions: UserPermissions;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================
// CONSTANTES - ROLES E PERMISSIONS PADRÃO
// ============================================

export const DEFAULT_ROLES: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Super Administrador',
    slug: 'super_admin',
    description: 'Acesso total ao sistema',
    isSystem: true,
    isActive: true
  },
  {
    name: 'Administrador',
    slug: 'admin',
    description: 'Administrador do sistema',
    isSystem: true,
    isActive: true
  },
  {
    name: 'Gerente',
    slug: 'manager',
    description: 'Gerente de operações',
    isSystem: true,
    isActive: true
  },
  {
    name: 'Afiliado',
    slug: 'affiliate',
    description: 'Afiliado padrão',
    isSystem: true,
    isActive: true
  },
  {
    name: 'Afiliado Premium',
    slug: 'affiliate_premium',
    description: 'Afiliado com benefícios extras',
    isSystem: true,
    isActive: true
  },
  {
    name: 'Cliente',
    slug: 'customer',
    description: 'Cliente do marketplace',
    isSystem: true,
    isActive: true
  },
  {
    name: 'Suporte',
    slug: 'support',
    description: 'Equipe de suporte',
    isSystem: true,
    isActive: true
  },
  {
    name: 'Desenvolvedor',
    slug: 'developer',
    description: 'Acesso técnico',
    isSystem: true,
    isActive: true
  }
];

export const DEFAULT_PERMISSIONS: Omit<Permission, 'id' | 'createdAt'>[] = [
  // Users
  { name: 'Criar Usuários', slug: 'users:create', resource: 'users', action: 'create', isActive: true },
  { name: 'Listar Usuários', slug: 'users:read', resource: 'users', action: 'read', isActive: true },
  { name: 'Atualizar Usuários', slug: 'users:update', resource: 'users', action: 'update', isActive: true },
  { name: 'Deletar Usuários', slug: 'users:delete', resource: 'users', action: 'delete', isActive: true },
  { name: 'Gerenciar Usuários', slug: 'users:manage', resource: 'users', action: 'manage', isActive: true },

  // Affiliates
  { name: 'Criar Afiliados', slug: 'affiliates:create', resource: 'affiliates', action: 'create', isActive: true },
  { name: 'Listar Afiliados', slug: 'affiliates:read', resource: 'affiliates', action: 'read', isActive: true },
  { name: 'Atualizar Afiliados', slug: 'affiliates:update', resource: 'affiliates', action: 'update', isActive: true },
  { name: 'Deletar Afiliados', slug: 'affiliates:delete', resource: 'affiliates', action: 'delete', isActive: true },
  { name: 'Gerenciar Afiliados', slug: 'affiliates:manage', resource: 'affiliates', action: 'manage', isActive: true },

  // Products
  { name: 'Criar Produtos', slug: 'products:create', resource: 'products', action: 'create', isActive: true },
  { name: 'Listar Produtos', slug: 'products:read', resource: 'products', action: 'read', isActive: true },
  { name: 'Atualizar Produtos', slug: 'products:update', resource: 'products', action: 'update', isActive: true },
  { name: 'Deletar Produtos', slug: 'products:delete', resource: 'products', action: 'delete', isActive: true },
  { name: 'Gerenciar Produtos', slug: 'products:manage', resource: 'products', action: 'manage', isActive: true },

  // Orders
  { name: 'Criar Pedidos', slug: 'orders:create', resource: 'orders', action: 'create', isActive: true },
  { name: 'Listar Pedidos', slug: 'orders:read', resource: 'orders', action: 'read', isActive: true },
  { name: 'Atualizar Pedidos', slug: 'orders:update', resource: 'orders', action: 'update', isActive: true },
  { name: 'Deletar Pedidos', slug: 'orders:delete', resource: 'orders', action: 'delete', isActive: true },
  { name: 'Gerenciar Pedidos', slug: 'orders:manage', resource: 'orders', action: 'manage', isActive: true },

  // Marketplace
  { name: 'Criar Marketplace', slug: 'marketplace:create', resource: 'marketplace', action: 'create', isActive: true },
  { name: 'Listar Marketplace', slug: 'marketplace:read', resource: 'marketplace', action: 'read', isActive: true },
  { name: 'Atualizar Marketplace', slug: 'marketplace:update', resource: 'marketplace', action: 'update', isActive: true },
  { name: 'Deletar Marketplace', slug: 'marketplace:delete', resource: 'marketplace', action: 'delete', isActive: true },
  { name: 'Gerenciar Marketplace', slug: 'marketplace:manage', resource: 'marketplace', action: 'manage', isActive: true },

  // Financeiro
  { name: 'Ver Comissões', slug: 'commissions:read', resource: 'commissions', action: 'read', isActive: true },
  { name: 'Gerenciar Comissões', slug: 'commissions:manage', resource: 'commissions', action: 'manage', isActive: true },
  { name: 'Ver Saques', slug: 'withdrawals:read', resource: 'withdrawals', action: 'read', isActive: true },
  { name: 'Processar Saques', slug: 'withdrawals:manage', resource: 'withdrawals', action: 'manage', isActive: true },

  // Admin
  { name: 'Ver Dashboard', slug: 'dashboard:read', resource: 'dashboard', action: 'read', isActive: true },
  { name: 'Ver Relatórios', slug: 'reports:read', resource: 'reports', action: 'read', isActive: true },
  { name: 'Gerenciar Sistema', slug: 'system:manage', resource: 'system', action: 'manage', isActive: true },
  { name: 'Gerenciar Roles', slug: 'roles:manage', resource: 'roles', action: 'manage', isActive: true },
  { name: 'Gerenciar Permissões', slug: 'permissions:manage', resource: 'permissions', action: 'manage', isActive: true },

  // IA
  { name: 'Usar IA', slug: 'ai:use', resource: 'ai', action: 'manage', isActive: true },
  { name: 'Gerenciar IA', slug: 'ai:manage', resource: 'ai', action: 'manage', isActive: true },

  // Conteúdo
  { name: 'Gerenciar CMS', slug: 'cms:manage', resource: 'cms', action: 'manage', isActive: true },
  { name: 'Gerenciar Newsletter', slug: 'newsletter:manage', resource: 'newsletter', action: 'manage', isActive: true }
];

// Mapeamento de permissões padrão por role
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleSlug, string[]> = {
  super_admin: DEFAULT_PERMISSIONS.map(p => p.slug),
  admin: [
    // Users
    'users:read', 'users:update', 'users:manage',
    // Affiliates
    'affiliates:read', 'affiliates:update', 'affiliates:manage',
    // Products
    'products:create', 'products:read', 'products:update', 'products:delete', 'products:manage',
    // Orders
    'orders:read', 'orders:update', 'orders:manage',
    // Marketplace
    'marketplace:create', 'marketplace:read', 'marketplace:update', 'marketplace:delete', 'marketplace:manage',
    // Financeiro
    'commissions:read', 'commissions:manage', 'withdrawals:read', 'withdrawals:manage',
    // Admin
    'dashboard:read', 'reports:read',
    // IA
    'ai:use',
    // Conteúdo
    'cms:manage', 'newsletter:manage'
  ],
  manager: [
    'affiliates:read', 'affiliates:update',
    'products:read', 'products:update',
    'orders:read', 'orders:update',
    'marketplace:read', 'marketplace:update',
    'commissions:read', 'withdrawals:read',
    'dashboard:read', 'reports:read',
    'cms:manage'
  ],
  affiliate: [
    'affiliates:read',
    'orders:create', 'orders:read',
    'marketplace:read',
    'commissions:read',
    'ai:use'
  ],
  affiliate_premium: [
    'affiliates:read',
    'products:create', 'products:read',
    'orders:create', 'orders:read',
    'marketplace:read',
    'commissions:read',
    'ai:use', 'ai:manage'
  ],
  customer: [
    'marketplace:read',
    'orders:create', 'orders:read'
  ],
  support: [
    'users:read',
    'affiliates:read',
    'orders:read',
    'marketplace:read',
    'commissions:read'
  ],
  developer: [
    'users:read',
    'affiliates:read',
    'products:read', 'products:create', 'products:update',
    'orders:read',
    'marketplace:read',
    'dashboard:read',
    'ai:use', 'ai:manage',
    'system:manage'
  ]
};

export default {
  roles,
  permissions,
  rolePermissions,
  userRoles,
  userCustomPermissions,
  resourcePolicies,
  DEFAULT_ROLES,
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS
};