import { TRPCError } from "@trpc/server";

import { copywriterPersuasivoHandler } from "./copywriterPersuasivo";
import { detectorTendenciasHandler } from "./detectorTendencias";
import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
  SkillSlug,
} from "./types";

/**
 * Dispatcher central das Skills operacionais.
 * -----------------------------------------------------------------------------
 * Mantém o registro de handlers disponíveis no runtime. Skills sem handler
 * ainda existem no catálogo (entitlement), mas só viram "operacionais" quando
 * o handler correspondente é registrado aqui.
 *
 * Esta é a peça que permite ao Autonomy Score sair do plano teórico:
 *  - skills com handler -> contam como "operacionais"
 *  - skills sem handler -> contam apenas como "entitlement"
 */
const HANDLERS: Record<string, SkillHandler<any, any>> = {
  [copywriterPersuasivoHandler.slug]: copywriterPersuasivoHandler,
  [detectorTendenciasHandler.slug]: detectorTendenciasHandler,
};

export function listRegisteredSkillHandlers(): Array<{
  slug: SkillSlug;
  title: string;
  category: string;
  version: string;
  supportsAutonomous: boolean;
}> {
  return Object.values(HANDLERS).map((handler) => ({
    slug: handler.slug,
    title: handler.title,
    category: handler.category,
    version: handler.version,
    supportsAutonomous: handler.supportsAutonomous,
  }));
}

export function hasSkillHandler(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(HANDLERS, slug);
}

export async function executeSkill(params: {
  slug: string;
  rawInput: unknown;
  context: SkillExecutionContext;
}): Promise<SkillExecutionResult> {
  const handler = HANDLERS[params.slug];
  if (!handler) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Skill "${params.slug}" ainda não possui handler operacional registrado.`,
    });
  }

  let parsedInput: unknown;
  try {
    parsedInput = handler.parseInput(params.rawInput);
  } catch (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        error instanceof Error
          ? `Entrada inválida para a skill "${params.slug}": ${error.message}`
          : `Entrada inválida para a skill "${params.slug}".`,
    });
  }

  try {
    return await handler.execute(parsedInput, params.context);
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        error instanceof Error
          ? `Falha ao executar skill "${params.slug}": ${error.message}`
          : `Falha ao executar skill "${params.slug}".`,
    });
  }
}
