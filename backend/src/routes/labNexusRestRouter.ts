/**
 * Lab Nexus · REST Router
 * --------------------------------------------------------------
 * Endpoint REST simples para integrações externas e clientes não-tRPC.
 * O POST de chat é protegido por shared key para evitar uso anônimo.
 */

import express, { type Request, type Response } from "express";
import { z } from "zod";
import {
  getProviderPublicSummary,
  LAB_NEXUS_PROVIDERS,
  type LabNexusProviderId,
} from "../services/lab-nexus/providerRegistry";
import { runLabNexusChat } from "../services/lab-nexus/chatService";

const providerIds = Object.keys(LAB_NEXUS_PROVIDERS) as [LabNexusProviderId, ...LabNexusProviderId[]];

const chatBodySchema = z.object({
  providerId: z.enum(providerIds),
  model: z.string().min(1).max(120).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().min(1).max(20000),
      }),
    )
    .min(1)
    .max(40),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().max(32000).optional(),
  tier: z.enum(["iniciante", "operador", "estrategista", "elite"]).optional(),
  affiliateId: z.union([z.string().min(1).max(120), z.number().int().positive()]).optional(),
});

function readSharedKey() {
  return process.env.LAB_NEXUS_PUBLIC_API_KEY?.trim() ?? "";
}

function readPresentedKey(req: Request) {
  const fromHeader = req.header("x-lab-nexus-key")?.trim();
  if (fromHeader) return fromHeader;

  const auth = req.header("authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return "";
}

export function createLabNexusRestRouter() {
  const router = express.Router();

  router.get("/providers", (_req: Request, res: Response) => {
    res.json({
      stage: "lab-nexus-v1",
      providers: getProviderPublicSummary(),
      permissionTiers: ["operador", "estrategista", "elite"],
      restChatSecurity: readSharedKey() ? "shared-key-enabled" : "shared-key-missing",
    });
  });

  router.post("/chat", async (req: Request, res: Response) => {
    const sharedKey = readSharedKey();
    if (!sharedKey) {
      res.status(503).json({
        error: "ServiceUnavailable",
        message: "Integração REST do Lab Nexus desabilitada até configurar LAB_NEXUS_PUBLIC_API_KEY.",
      });
      return;
    }

    const presentedKey = readPresentedKey(req);
    if (!presentedKey || presentedKey !== sharedKey) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Shared key inválida para o endpoint REST do Lab Nexus.",
      });
      return;
    }

    const parsed = chatBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "ValidationError",
        issues: parsed.error.flatten(),
      });
      return;
    }

    try {
      const response = await runLabNexusChat(parsed.data);
      res.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const normalized = message.toLowerCase();
      const status = normalized.includes("acesso negado") || normalized.includes("limite diário") ? 403 : 502;
      res.status(status).json({
        error: status === 403 ? "Forbidden" : "UpstreamError",
        message,
      });
    }
  });

  return router;
}
