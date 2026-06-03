/**
 * Lab Nexus · tRPC Router
 * --------------------------------------------------------------
 * Expõe o Chat Bot Lab Nexus ao frontend via tRPC. Mantém o segredo
 * de cada provedor exclusivamente no servidor; o cliente vê apenas
 * a lista de modelos disponíveis e a flag `configured`.
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../config/trpc";
import {
  getProviderPublicSummary,
  LAB_NEXUS_PROVIDERS,
  type LabNexusProviderId,
} from "../services/lab-nexus/providerRegistry";
import {
  runLabNexusChat,
  type LabNexusRole,
} from "../services/lab-nexus/chatService";

const providerIdSchema = z.enum(
  Object.keys(LAB_NEXUS_PROVIDERS) as [LabNexusProviderId, ...LabNexusProviderId[]],
);

const roleSchema = z.enum(["system", "user", "assistant"]) satisfies z.ZodType<LabNexusRole>;

const messageSchema = z.object({
  role: roleSchema,
  content: z.string().min(1).max(20000),
});

const chatInputSchema = z.object({
  providerId: providerIdSchema,
  model: z.string().min(1).max(120).optional(),
  messages: z.array(messageSchema).min(1).max(40),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().max(32000).optional(),
  tier: z.enum(["iniciante", "operador", "estrategista", "elite"]).optional(),
});

export const labNexusRouter = router({
  providers: publicProcedure.query(() => ({
    providers: getProviderPublicSummary(),
    permissionTiers: ["operador", "estrategista", "elite"],
  })),

  chat: protectedProcedure
    .input(chatInputSchema)
    .mutation(async ({ ctx, input }) => {
      const tier = input.tier ?? "operador";
      return runLabNexusChat({
        providerId: input.providerId,
        model: input.model,
        messages: input.messages,
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        affiliateId: ctx.user?.id,
        tier,
      });
    }),
});
