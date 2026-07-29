/**
 * Lab Nexus · tRPC Router
 * --------------------------------------------------------------
 * Expõe o Chat Bot Lab Nexus ao frontend via tRPC.
 * CEO-016: Pack-level enforcement — Lab Nexus liberado apenas para
 * packs da categoria agente_orquestrador (AO, AOII, AOIII) ou superior (AA, AAII, AAIII).
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
import { resolveAccessTier, PACK_TIER_ORDER } from "../services/packProtocolService";
import { Pool } from "pg";

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
 * Verifica se o usuário tem pack com acesso ao Lab Nexus.
 * Lab Nexus é liberado a partir de Agente Orquestrador (AO) e IA Agentic (AA).
 */
async function checkLabNexusAccess(userId: number): Promise<{ allowed: boolean; tier: string; message: string }> {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const grants = await pool.query(
      `SELECT DISTINCT pack_slug FROM marketplace_pack_grants
        WHERE user_id = $1 AND status = 'granted'`,
      [userId],
    );
    await pool.end();

    const ownedSlugs = grants.rows.map((r: any) => r.pack_slug as string);
    const access = resolveAccessTier(ownedSlugs);

    if (access.labAccess) {
      return {
        allowed: true,
        tier: access.tier,
        message: `Lab Nexus liberado para pack ${access.category} nivel ${access.level}`,
      };
    }

    return {
      allowed: false,
      tier: access.tier,
      message: `Lab Nexus requer pack Agente Orquestrador (AO+) ou IA Agentic (AA+). Pack atual: ${access.category} nivel ${access.level}`,
    };
  } catch (e: any) {
    // Se houver erro na consulta, permitir com restrição (fail-open)
    return { allowed: true, tier: "estrategista", message: `Verificação de acesso indisponível: ${e.message}` };
  }
}

export const labNexusRouter = router({
  providers: publicProcedure.query(() => ({
    providers: getProviderPublicSummary(),
    permissionTiers: ["estrategista", "elite"],
    description: "Lab Nexus liberado a partir de Agente Orquestrador (AO) ou IA Agentic (AA)",
  })),

  usage: protectedProcedure
    .input(z.object({ tier: tierSchema.optional() }).optional())
    .query(async ({ ctx, input }) => {
      // CEO-016: Verificar acesso baseado no pack
      const access = await checkLabNexusAccess(ctx.user?.id);
      return {
        usage: getLabNexusUsageSnapshot({
          affiliateId: ctx.user?.id,
          tier: access.allowed ? (input?.tier ?? access.tier) : "iniciante",
        }),
        access,
      };
    }),

  chat: protectedProcedure
    .input(chatInputSchema)
    .mutation(async ({ ctx, input }) => {
      // CEO-016: Verificar acesso antes de permitir chat
      const access = await checkLabNexusAccess(ctx.user?.id);
      if (!access.allowed) {
        throw new Error(access.message);
      }

      return runLabNexusChat({
        providerId: input.providerId,
        model: input.model,
        messages: input.messages,
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        affiliateId: ctx.user?.id,
        tier: input.tier ?? access.tier,
      });
    }),
});
