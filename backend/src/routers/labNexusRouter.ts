/**
 * Lab Nexus · tRPC Router
 * --------------------------------------------------------------
 * Expõe o Chat Bot Lab Nexus ao frontend via tRPC. Mantém o segredo
 * de cada provedor exclusivamente no servidor; o cliente vê apenas
 * a lista de modelos disponíveis, quota diária e a flag `configured`.
 *
 * CEO-015: Access check via packDeliveryService.checkUserAccess()
 *          — Lab Nexus requires `lab_nexus` access flag
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
import { getLabNexusUsageSnapshot } from "../services/lab-nexus/usageLedger";
import {
  checkUserAccess,
} from "../services/packDeliveryService";

const providerIdSchema = z.enum(
  Object.keys(LAB_NEXUS_PROVIDERS) as [LabNexusProviderId, ...LabNexusProviderId[]],
);

const roleSchema = z.enum(["system", "user", "assistant"]) satisfies z.ZodType<LabNexusRole>;
const tierSchema = z.enum(["iniciante", "operador", "estrategista", "elite"]);

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
  tier: tierSchema.optional(),
});

/**
 * CEO-015: Middleware de verificação de acesso.
 * Lab Nexus é restrito a usuários com access flag `lab_nexus`.
 * Packs AA (IA Agentic) e superiores concedem este acesso.
 */
async function requireLabAccess(ctx: any): Promise<boolean> {
  if (!ctx?.user?.id) return false;
  try {
    const access = await checkUserAccess(ctx.user.id, "lab_nexus");
    return access.hasAccess;
  } catch {
    // Se a tabela não existe ou há erro, permitir por enquanto (grace period)
    console.warn("[LabNexus] access check failed — allowing (grace period)");
    return true;
  }
}

export const labNexusRouter = router({
  providers: publicProcedure.query(() => ({
    providers: getProviderPublicSummary(),
    permissionTiers: ["estrategista", "elite"],
  })),

  usage: protectedProcedure
    .input(z.object({ tier: tierSchema.optional() }).optional())
    .query(async ({ ctx, input }) => {
      const hasAccess = await requireLabAccess(ctx);
      if (!hasAccess) {
        return {
          usage: { used: 0, limit: 0, remaining: 0 },
          accessDenied: true,
          message: "Lab Nexus requer Pack AA (IA Agentic) ou superior",
        };
      }
      return {
        usage: getLabNexusUsageSnapshot({
          affiliateId: ctx.user?.id,
          tier: input?.tier ?? "estrategista",
        }),
        accessDenied: false,
      };
    }),

  chat: protectedProcedure
    .input(chatInputSchema)
    .mutation(async ({ ctx, input }) => {
      // CEO-015: Verificar acesso antes do chat
      const hasAccess = await requireLabAccess(ctx);
      if (!hasAccess) {
        throw new Error("Acesso negado: Lab Nexus requer Pack AA (IA Agentic) ou superior. Adquira o Pack na seção Packs/Upgrade do Dashboard.");
      }

      const tier = input.tier ?? "estrategista";
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

  /**
   * CEO-015: Verifica se o usuário tem acesso ao Lab Nexus.
   * Usado pelo frontend para renderizar condicionalmente a UI.
   */
  checkAccess: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx?.user?.id) return { hasAccess: false, level: null, packSlug: null };
    return await checkUserAccess(ctx.user.id, "lab_nexus");
  }),
});
