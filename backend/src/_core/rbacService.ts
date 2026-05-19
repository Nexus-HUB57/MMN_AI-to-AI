/**
 * RBAC - Role-Based Access Control Service
 *
 * Lógica de negócio para verificação e gerenciamento de permissões.
 */

import { TRPCError } from '@trpc/server';
import {
  Role,
  Permission,
  UserPermissions,
  ResourcePolicy,
  AccessContext,
  RoleSlug,
  DEFAULT_ROLE_PERMISSIONS
} from './rbacSchema';

export interface PermissionCheckOptions {
  userId: string;
  resource: string;
  action: string;
  resourceId?: string;
  throwOnDenied?: boolean;
}

export interface AuthUser {
  id: string;
  roles: Role[];
  permissions: UserPermissions;
}

export class RBACService {
  /**
   * Verifica se usuário tem permissão para ação
   */
  static hasPermission(
    user: AuthUser,
    resource: string,
    action: string,
    options?: { resourceId?: string }
  ): boolean {
    const { resourceId } = options || {};

    // 1. Verificar políticas de recurso específicas primeiro
    if (resourceId && user.permissions.resourcePolicies.length > 0) {
      const policy = user.permissions.resourcePolicies.find(
        p => p.resource === resource &&
             p.action === action &&
             (!p.resourceId || p.resourceId === resourceId)
      );
      if (policy) {
        // Política explícita found - verificar expiração
        if (policy.expiresAt && new Date(policy.expiresAt) < new Date()) {
          return false;
        }
        return policy.isGranted;
      }
    }

    // 2. Verificar permissões negadas customizadas
    const deniedPermission = user.permissions.deniedPermissions.find(
      p => p.resource === resource && (p.action === action || p.action === 'manage')
    );
    if (deniedPermission) {
      return false;
    }

    // 3. Verificar permissões customizadas concedidas
    const customPermission = user.permissions.customPermissions.find(
      p => p.resource === resource && (p.action === action || p.action === 'manage')
    );
    if (customPermission) {
      return true;
    }

    // 4. Verificar permissões de role
    const rolePermission = user.permissions.rolePermissions.find(
      p => p.resource === resource && (p.action === action || p.action === 'manage')
    );
    if (rolePermission) {
      return true;
    }

    // 5. Verificar super_admin (tem tudo)
    const isSuperAdmin = user.roles.some(r => r.slug === 'super_admin');
    if (isSuperAdmin) {
      return true;
    }

    return false;
  }

  /**
   * Verifica e lança erro se não tiver permissão
   */
  static requirePermission(
    user: AuthUser,
    resource: string,
    action: string,
    options?: { resourceId?: string; message?: string }
  ): void {
    const { resourceId, message } = options || {};

    if (!this.hasPermission(user, resource, action, { resourceId })) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: message || `Permission denied: ${action} on ${resource}`
      });
    }
  }

  /**
   * Verifica se usuário tem uma das roles especificadas
   */
  static hasRole(user: AuthUser, roles: RoleSlug | RoleSlug[]): boolean {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return user.roles.some(r => roleArray.includes(r.slug as RoleSlug));
  }

  /**
   * Verifica e lança erro se não tiver role
   */
  static requireRole(
    user: AuthUser,
    roles: RoleSlug | RoleSlug[],
    message?: string
  ): void {
    if (!this.hasRole(user, roles)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: message || `Required role not found`
      });
    }
  }

  /**
   * Filtra lista baseada em permissões
   */
  static filterByPermission<T>(
    user: AuthUser,
    items: T[],
    resource: string,
    action: string,
    getResourceId: (item: T) => string,
    filterFn?: (item: T, hasAccess: boolean) => boolean
  ): T[] {
    return items.filter(item => {
      const resourceId = getResourceId(item);
      const hasAccess = this.hasPermission(user, resource, action, { resourceId });
      return filterFn ? filterFn(item, hasAccess) : hasAccess;
    });
  }

  /**
   * Verifica acesso a múltiplas permissões (OR)
   */
  static hasAnyPermission(
    user: AuthUser,
    permissions: Array<{ resource: string; action: string }>
  ): boolean {
    return permissions.some(p =>
      this.hasPermission(user, p.resource, p.action)
    );
  }

  /**
   * Verifica acesso a todas as permissões (AND)
   */
  static hasAllPermissions(
    user: AuthUser,
    permissions: Array<{ resource: string; action: string }>
  ): boolean {
    return permissions.every(p =>
      this.hasPermission(user, p.resource, p.action)
    );
  }

  /**
   * Obtém permissões efetivas do usuário
   */
  static getEffectivePermissions(user: AuthUser): string[] {
    const perms = new Set<string>();

    // Adicionar permissões de roles
    user.permissions.rolePermissions.forEach(p => {
      perms.add(p.slug);
    });

    // Adicionar permissões customizadas
    user.permissions.customPermissions.forEach(p => {
      perms.add(p.slug);
    });

    // Remover negações
    user.permissions.deniedPermissions.forEach(p => {
      perms.delete(p.slug);
    });

    // Super admin tem todas
    if (this.hasRole(user, 'super_admin')) {
      DEFAULT_ROLE_PERMISSIONS.super_admin.forEach(p => perms.add(p));
    }

    return Array.from(perms);
  }

  /**
   * Verifica se pode criar/atualizar based em ownership
   */
  static canAccessResource(
    user: AuthUser,
    resource: string,
    action: string,
    ownerId: string,
    options?: { allowSuperAdmin?: boolean }
  ): boolean {
    const { allowSuperAdmin = true } = options || {};

    // Proprietário sempre pode acessar seus próprios recursos
    if (user.id === ownerId && (action === 'read' || action === 'update')) {
      return true;
    }

    // Super admin ignora ownership
    if (allowSuperAdmin && this.hasRole(user, 'super_admin')) {
      return true;
    }

    // Verificar permissão normal
    return this.hasPermission(user, resource, action);
  }
}

/**
 * Decorator para proteger procedures tRPC
 */
export function requirePermission(
  resource: string,
  action: string,
  options?: { resourceIdParam?: string }
) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: T,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      // ctx é primeiro argumento em procedures tRPC
      const ctx = args[0];

      if (!ctx?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated'
        });
      }

      // Verificar permission
      RBACService.requirePermission(
        { id: ctx.user.id, roles: ctx.user.roles, permissions: ctx.user.permissions },
        resource,
        action
      );

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Decorator para proteger por role
 */
export function requireRole(...roles: RoleSlug[]) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: T,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      const ctx = args[0];

      if (!ctx?.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated'
        });
      }

      RBACService.requireRole(
        { id: ctx.user.id, roles: ctx.user.roles, permissions: ctx.user.permissions },
        roles as RoleSlug[]
      );

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Middleware tRPC para RBAC
 */
export function rbacMiddleware() {
  return async ({ ctx, next }: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated'
      });
    }

    // Adicionar helpers de permissão no contexto
    ctx.permissions = {
      has: (resource: string, action: string, resourceId?: string) =>
        RBACService.hasPermission(ctx.user, resource, action, { resourceId }),
      require: (resource: string, action: string) =>
        RBACService.requirePermission(ctx.user, resource, action),
      hasRole: (roles: RoleSlug | RoleSlug[]) =>
        RBACService.hasRole(ctx.user, roles),
      requireRole: (roles: RoleSlug | RoleSlug[]) =>
        RBACService.requireRole(ctx.user, roles),
      canAccess: (resource: string, action: string, ownerId: string) =>
        RBACService.canAccessResource(ctx.user, resource, action, ownerId)
    };

    return next();
  };
}

export default RBACService;