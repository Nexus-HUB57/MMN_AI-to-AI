import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "./_core/trpc";
import {
  findAgentByUserId,
  insertAgentRuntimeAudit,
  listActiveUpgradesByAgentId,
  updateAgentPerformanceScore,
} from "../domains/agent-runtime/repository";
import {
  AgentNotFoundError,
  bumpAgentRuntimePerformance,
  generateAgentContent,
  generateAgentContentBatch,
  getAgentRuntimeProfile,
  registerAgentRuntimeAction,
} from "../domains/agent-runtime/service";
import { invokeLLM } from "../services/llm-v2";

/**
 * Agent Runtime Router
 * -------------------------------------------------------------
 * Camada de transporte do runtime do Agente IA: delega ao domínio a leitura do
 * perfil consolidado, geração de conteúdo, bump de performance e auditoria de
 * ações, preservando o contrato público do router.
 */

const generateInputSchema = z.object({
  topic: z.string().min(3),
  platform: z.enum(["whatsapp", "instagram", "facebook"]).optional(),
  toneOverride: z
    .enum(["professional", "casual", "persuasive", "humorous"])
    .optional(),
  maxLength: z.number().min(60).max(2200).optional(),
  includeHashtags: z.boolean().optional().default(false),
});

const generateBatchInputSchema = z.object({
  topic: z.string().min(3),
  platform: z.enum(["whatsapp", "instagram", "facebook"]).optional(),
  count: z.number().min(1).max(5).default(3),
});

function buildAgentRuntimeDeps() {
  return {
    findAgentByUserId,
    listActiveUpgradesByAgentId,
    updateAgentPerformanceScore,
    insertAudit: insertAgentRuntimeAudit,
    invokeLlm: invokeLLM,
    onAuditFailure: (error: unknown) => {
      console.warn("[agentRuntimeRouter] Falha ao registrar auditoria:", error);
    },
  };
}

function handleAgentRuntimeError(
  error: unknown,
  options: {
    operation: string;
    internalMessage: string;
  },
): never {
  if (error instanceof AgentNotFoundError) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: error.message,
    });
  }

  console.error(`[agentRuntimeRouter] ${options.operation}:`, error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: options.internalMessage,
  });
}

export const agentRuntimeRouter = router({
  /**
   * Estado consolidado do agente: configuração + upgrades ativos.
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getAgentRuntimeProfile(ctx.user.id, buildAgentRuntimeDeps());
    } catch (error) {
      handleAgentRuntimeError(error, {
        operation: "Error getting agent profile",
        internalMessage: "Failed to load agent runtime profile",
      });
    }
  }),

  /**
   * Geração unificada respeitando a content strategy.
   * Persiste auditoria da ação para a aba "Últimas ações" no app.
   */
  generate: protectedProcedure
    .input(generateInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await generateAgentContent(
          {
            userId: ctx.user.id,
            input,
          },
          buildAgentRuntimeDeps(),
        );
      } catch (error) {
        handleAgentRuntimeError(error, {
          operation: "Error generating content",
          internalMessage: "Failed to generate agent content",
        });
      }
    }),

  /**
   * Gera múltiplas variações cobrindo diferentes tons.
   */
  generateBatch: protectedProcedure
    .input(generateBatchInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await generateAgentContentBatch(
          {
            userId: ctx.user.id,
            input,
          },
          buildAgentRuntimeDeps(),
        );
      } catch (error) {
        handleAgentRuntimeError(error, {
          operation: "Error generating content batch",
          internalMessage: "Failed to generate agent content batch",
        });
      }
    }),

  /**
   * Ajusta o performance score do agente (limitado entre 0 e 100).
   */
  bumpPerformance: protectedProcedure
    .input(z.object({ delta: z.number().min(-50).max(50) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await bumpAgentRuntimePerformance(
          {
            userId: ctx.user.id,
            delta: input.delta,
          },
          buildAgentRuntimeDeps(),
        );
      } catch (error) {
        handleAgentRuntimeError(error, {
          operation: "Error bumping performance",
          internalMessage: "Failed to update agent performance",
        });
      }
    }),

  /**
   * Registra externamente uma ação concluída (ex: postagem feita
   * por integração de marketplace ou rede social).
   */
  registerAction: protectedProcedure
    .input(
      z.object({
        action: z.string().min(2).max(50),
        metadata: z.record(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await registerAgentRuntimeAction(
          {
            userId: ctx.user.id,
            input,
          },
          buildAgentRuntimeDeps(),
        );
      } catch (error) {
        handleAgentRuntimeError(error, {
          operation: "Error registering action",
          internalMessage: "Failed to register agent action",
        });
      }
    }),
});
