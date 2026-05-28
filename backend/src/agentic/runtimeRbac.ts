/**
 * RBAC granular para o runtime de skills.
 * -----------------------------------------------------------------------------
 * Define escopos finos que admins podem ter no runtime operacional, sem
 * exigir o sistema RBAC completo (que depende de DB e tabelas dedicadas).
 *
 * Os escopos são derivados do usuário autenticado:
 *  - `ctx.user.runtimeScopes` (se presente) tem precedência.
 *  - Caso contrário, mapeia por `ctx.user.role`:
 *      admin  → todos os escopos
 *      user/affiliate → apenas `runtime:read`
 *
 * Quando o backend de admin server-side estiver com sessão real,
 * `runtimeScopes` virá do token assinado.
 */

export const RUNTIME_SCOPES = [
  "runtime:read",
  "runtime:execute",
  "runtime:approve",
  "runtime:reject",
  "runtime:rerun",
] as const;
export type RuntimeScope = (typeof RUNTIME_SCOPES)[number];

export interface RuntimeAuthContext {
  user?: {
    id: number | string;
    role?: string;
    runtimeScopes?: string[];
  };
}

const DEFAULT_ADMIN_SCOPES: RuntimeScope[] = [
  "runtime:read",
  "runtime:execute",
  "runtime:approve",
  "runtime:reject",
  "runtime:rerun",
];

const DEFAULT_USER_SCOPES: RuntimeScope[] = ["runtime:read"];

export function deriveRuntimeScopes(ctx: RuntimeAuthContext): RuntimeScope[] {
  const declared = ctx.user?.runtimeScopes ?? [];
  if (declared.length > 0) {
    return declared.filter((scope): scope is RuntimeScope =>
      (RUNTIME_SCOPES as readonly string[]).includes(scope),
    );
  }
  if (ctx.user?.role === "admin") return DEFAULT_ADMIN_SCOPES;
  return DEFAULT_USER_SCOPES;
}

export function hasRuntimeScope(
  ctx: RuntimeAuthContext,
  required: RuntimeScope,
): boolean {
  return deriveRuntimeScopes(ctx).includes(required);
}

export function assertRuntimeScope(
  ctx: RuntimeAuthContext,
  required: RuntimeScope,
): void {
  if (!hasRuntimeScope(ctx, required)) {
    const error = new Error(
      `Escopo administrativo insuficiente: requer ${required}.`,
    );
    (error as any).code = "FORBIDDEN";
    throw error;
  }
}
