import type { NextFunction, Request, Response } from "express";
import { sql } from "drizzle-orm";
import { getDb } from "../db";

export interface NexusApiPermissions {
  read?: boolean;
  write?: boolean;
  admin?: boolean;
  modules?: string[];
}

export interface NexusApiContext {
  tenantId: string;
  apiKey: string;
  keyId: string | null;
  permissions: NexusApiPermissions | null;
  authScheme: "bearer";
  source: "tenant_api_keys" | "env_registry" | "single_env";
}

interface ApiKeyValidationResult {
  valid: boolean;
  tenantId?: string;
  keyId?: string | null;
  permissions?: NexusApiPermissions | null;
  source?: NexusApiContext["source"];
}

let tenantApiKeysUnavailableLogged = false;

function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.trim().split(/\s+/, 2);
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

function parseApiKeyRegistry() {
  const rawRegistry = process.env.NEXUS_OPEN_API_KEYS?.trim();
  if (!rawRegistry) return [] as Array<{ tenantId: string; apiKey: string }>;

  return rawRegistry
    .split(/[;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [tenantId, apiKey] = entry.split(":", 2).map((part) => part.trim());
      if (!tenantId || !apiKey) return null;
      return { tenantId, apiKey };
    })
    .filter((entry): entry is { tenantId: string; apiKey: string } => Boolean(entry));
}

function normalizePermissions(value: unknown): NexusApiPermissions | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return normalizePermissions(JSON.parse(value));
    } catch {
      return null;
    }
  }

  if (typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  return {
    read: record.read === undefined ? undefined : Boolean(record.read),
    write: record.write === undefined ? undefined : Boolean(record.write),
    admin: record.admin === undefined ? undefined : Boolean(record.admin),
    modules: Array.isArray(record.modules)
      ? record.modules.filter((item): item is string => typeof item === "string")
      : undefined,
  };
}

async function validateApiKeyFromTenantTable(apiKey: string): Promise<ApiKeyValidationResult> {
  const db = await getDb();
  if (!db) {
    return { valid: false };
  }

  try {
    const result = await (db as any).execute(sql`
      select id, tenant_id, permissions, is_active, expires_at
      from tenant_api_keys
      where api_key = ${apiKey}
      limit 1
    `);

    const rows = Array.isArray(result?.rows) ? result.rows : [];
    const row = rows[0] as
      | {
          id?: string;
          tenant_id?: string;
          permissions?: unknown;
          is_active?: boolean;
          expires_at?: string | Date | null;
        }
      | undefined;

    if (!row?.tenant_id || row.is_active === false) {
      return { valid: false };
    }

    const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
    if (expiresAt && !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
      return { valid: false };
    }

    void (db as any).execute(sql`
      update tenant_api_keys
      set last_used_at = now()
      where id = ${row.id ?? ""}
    `);

    void (db as any).execute(sql`
      update tenant_billing
      set api_calls_used = coalesce(api_calls_used, 0) + 1,
          updated_at = now()
      where tenant_id = ${row.tenant_id}
    `).catch(() => undefined);

    return {
      valid: true,
      tenantId: row.tenant_id,
      keyId: row.id ?? null,
      permissions: normalizePermissions(row.permissions),
      source: "tenant_api_keys",
    };
  } catch (error) {
    if (!tenantApiKeysUnavailableLogged) {
      tenantApiKeysUnavailableLogged = true;
      console.warn(
        "[NexusOpenAPI] tenant_api_keys indisponível; autenticação seguirá com fallback em variáveis de ambiente.",
        error,
      );
    }
    return { valid: false };
  }
}

function validateApiKeyFromEnv(apiKey: string): ApiKeyValidationResult {
  const registry = parseApiKeyRegistry();
  const registryMatch = registry.find((entry) => entry.apiKey === apiKey);
  if (registryMatch) {
    return {
      valid: true,
      tenantId: registryMatch.tenantId,
      keyId: null,
      permissions: null,
      source: "env_registry",
    };
  }

  const singleApiKey = process.env.NEXUS_OPEN_API_KEY?.trim();
  if (singleApiKey && singleApiKey === apiKey) {
    return {
      valid: true,
      tenantId: process.env.NEXUS_OPEN_API_TENANT_ID?.trim() || "default-tenant",
      keyId: null,
      permissions: null,
      source: "single_env",
    };
  }

  return { valid: false };
}

export function getNexusApiContext(res: Response): NexusApiContext | null {
  return (res.locals?.nexusApi ?? null) as NexusApiContext | null;
}

export async function requireNexusApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const apiKey = extractBearerToken(req.header("authorization") || undefined);

    if (!apiKey) {
      res.status(401).json({
        error: {
          code: "missing_api_key",
          message: "Envie Authorization: Bearer <api_key> para acessar a Nexus Open API.",
        },
      });
      return;
    }

    const tenantValidation = await validateApiKeyFromTenantTable(apiKey);
    const validation = tenantValidation.valid ? tenantValidation : validateApiKeyFromEnv(apiKey);

    if (!validation.valid || !validation.tenantId || !validation.source) {
      res.status(401).json({
        error: {
          code: "invalid_api_key",
          message:
            "API key inválida ou não registrada na tenant_api_keys / variáveis NEXUS_OPEN_API_KEYS / NEXUS_OPEN_API_KEY.",
        },
      });
      return;
    }

    res.locals.nexusApi = {
      tenantId: validation.tenantId,
      apiKey,
      keyId: validation.keyId ?? null,
      permissions: validation.permissions ?? null,
      authScheme: "bearer",
      source: validation.source,
    } satisfies NexusApiContext;

    next();
  } catch (error) {
    res.status(500).json({
      error: {
        code: "api_auth_failed",
        message: error instanceof Error ? error.message : "Falha desconhecida na autenticação da API.",
      },
    });
  }
}
