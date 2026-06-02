import type { NextFunction, Request, Response } from "express";

export interface NexusApiContext {
  tenantId: string;
  apiKey: string;
  authScheme: "bearer";
  source: "env_registry" | "single_env";
}

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

function validateApiKeyFromEnv(apiKey: string): { valid: boolean; tenantId?: string; source?: NexusApiContext["source"] } {
  const registry = parseApiKeyRegistry();
  const registryMatch = registry.find((entry) => entry.apiKey === apiKey);
  if (registryMatch) {
    return { valid: true, tenantId: registryMatch.tenantId, source: "env_registry" };
  }

  const singleApiKey = process.env.NEXUS_OPEN_API_KEY?.trim();
  if (singleApiKey && singleApiKey === apiKey) {
    return {
      valid: true,
      tenantId: process.env.NEXUS_OPEN_API_TENANT_ID?.trim() || "default-tenant",
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

    const validation = validateApiKeyFromEnv(apiKey);
    if (!validation.valid || !validation.tenantId || !validation.source) {
      res.status(401).json({
        error: {
          code: "invalid_api_key",
          message:
            "API key inválida ou não registrada nas variáveis NEXUS_OPEN_API_KEYS / NEXUS_OPEN_API_KEY.",
        },
      });
      return;
    }

    res.locals.nexusApi = {
      tenantId: validation.tenantId,
      apiKey,
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
