/**
 * Lab Nexus · REST Router
 * --------------------------------------------------------------
 * Endpoint REST simples para integrações externas e clientes não-tRPC.
 * Espelha o tRPC `labNexus.chat`. Não exige login (porta destinada a
 * widgets parceiros), mas mantém os limites por tier e nunca expõe
 * a chave de API ao cliente.
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
});

export function createLabNexusRestRouter() {
  const router = express.Router();

  router.get("/providers", (_req: Request, res: Response) => {
    res.json({
      stage: "lab-nexus-v1",
      providers: getProviderPublicSummary(),
      permissionTiers: ["operador", "estrategista", "elite"],
    });
  });

  router.post("/chat", async (req: Request, res: Response) => {
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
      const isForbidden = message.toLowerCase().includes("acesso negado");
      res.status(isForbidden ? 403 : 502).json({
        error: isForbidden ? "Forbidden" : "UpstreamError",
        message,
      });
    }
  });

  return router;
}
