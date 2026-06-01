/**
 * Partners domain — event subscribers.
 *
 * Wiring de reações automáticas a eventos publicados pelo próprio
 * domínio Partners (e por outros domínios no futuro).
 *
 * v1.3.0:
 *  - `PARTNER_TIER_PROMOTED` → `XP_GRANTED` + (opcional) `CAREER_LEVEL_UP`
 *
 * v1.3.1 (correções e observabilidade):
 *  - XP Ledger: cada concessão de XP é registrada num audit trail
 *    por `userId`, com `correlationId` / `causationId` propagados.
 *    Habilita agentes e admins a auditar e raciocinar sobre a
 *    origem do XP de um parceiro (essencial para um protótipo
 *    agentic observável).
 *  - Fim do silent drop: quando o subscriber não consegue resolver
 *    o `partnerId` (parceiro inexistente, id inválido) ou quando a
 *    promoção não concede XP, um `SYSTEM_ALERT` é publicado ao invés
 *    de descartar o evento em silêncio.
 *
 * Os subscribers são registrados preguiçosamente via
 * `registerPartnersEventHandlers()`, que retorna um `dispose()` para
 * remover as inscrições (útil em testes e no graceful shutdown do
 * processo).
 *
 * O estado de XP é mantido em memória por `userId` (consistente com
 * o padrão in-memory do domínio Partners). Quando a persistência real
 * for introduzida no service, este cache pode ser derivado do banco
 * sem alterar a forma dos eventos.
 */

import {
  eventBus,
  DomainEventType,
  type DomainEvent,
  type PartnerTierPromotedPayload,
  type XPGrantedPayload,
  type CareerLevelUpPayload,
} from "../../_core/events/eventBus";
import { publishXpGranted, publishCareerLevelUp } from "../xp/events";
import { publishSystemAlert, type SystemAlertPayload } from "../cron/events";
import { getPartnerRecordById } from "./repository";
import type { PartnerTier } from "./types";

// ============================================================================
// Tabela de XP — recompensas por promoção de tier
// ============================================================================

/**
 * Recompensa fixa de XP por promoção de tier.
 * Mantida deliberadamente simples e configurável por tier.
 */
const TIER_PROMOTION_XP: Record<
  Exclude<PartnerTier, "silver">, // silver é o tier inicial — sem promoção "from base"
  number
> = {
  gold: 500,
  platinum: 1_500,
  diamond: 5_000,
};

/**
 * XP cumulativo necessário para alcançar cada nível.
 * Índices 1-based: thresholds[1] = XP para o nível 2.
 */
const LEVEL_THRESHOLDS: ReadonlyArray<number> = [
  0, // nível 1 (inicial)
  500, // nível 2
  2_000, // nível 3
  7_000, // nível 4
  20_000, // nível 5
  50_000, // nível 6
];

const RANK_BY_LEVEL: ReadonlyArray<string> = [
  "Affiliate", // 1
  "Partner", // 2
  "Pro Partner", // 3
  "Elite Partner", // 4
  "Master Partner", // 5
  "Diamond Partner", // 6
];

export interface PartnerXpState {
  userId: string;
  totalXp: number;
  level: number;
  rank: string;
}

const xpStateByUserId = new Map<string, PartnerXpState>();

/**
 * Reseta o estado in-memory de XP por usuário.
 * Útil para testes e para o job de reconciliação que pode ser
 * introduzido quando a persistência real chegar.
 */
export function resetPartnerXpState(): void {
  xpStateByUserId.clear();
  xpLedger.length = 0;
}

export function getPartnerXpState(userId: string): PartnerXpState | undefined {
  return xpStateByUserId.get(userId);
}

function nextLevelThreshold(level: number): number | null {
  if (level >= LEVEL_THRESHOLDS.length) return null;
  return LEVEL_THRESHOLDS[level]; // thresholds[n] = XP para o nível n+1
}

function rankForLevel(level: number): string {
  const idx = Math.min(Math.max(level, 1), RANK_BY_LEVEL.length) - 1;
  return RANK_BY_LEVEL[idx] ?? RANK_BY_LEVEL[0];
}

function levelForXp(totalXp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

function rewardForPromotion(newTier: PartnerTier): number {
  if (newTier === "silver") return 0;
  return TIER_PROMOTION_XP[newTier];
}

// ============================================================================
// XP Ledger (v1.3.1) — audit trail de concessões de XP
// ============================================================================

/**
 * Entrada do ledger para uma única concessão de XP.
 * Inclui os deltas, os níveis anterior/novo e os identificadores
 * de correlação/causa propagados do evento original. Permite
 * reconstruir a história de XP de um parceiro a partir do log.
 */
export interface XpLedgerEntry {
  /** Sequencial local (1-based) para o ledger global. */
  sequence: number;
  userId: string;
  partnerId: number;
  amount: number;
  reason: string;
  source: "activity" | "sale" | "milestone" | "bonus";
  previousTotal: number;
  newTotal: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  previousTier: PartnerTier;
  newTier: PartnerTier;
  /** correlationId do evento original (chain tracing). */
  correlationId?: string;
  /** causationId do evento original (chain tracing). */
  causationId?: string;
  /** Tipo do evento que originou a concessão. */
  sourceEventType: DomainEventType;
  grantedAt: string; // ISO-8601
}

/**
 * Ledger global de concessões de XP. Usamos um array (em vez de
 * `Map<userId, XpLedgerEntry[]>`) para preservar a ordem temporal
 * exata e permitir replay/auditoria global. Para queries por
 * usuário use `getPartnerXpHistory(userId)`.
 *
 * O sequence é atribuído no momento do push e é monotonicamente
 * crescente durante a vida do processo.
 */
const xpLedger: XpLedgerEntry[] = [];
let nextXpLedgerSequence = 1;

/**
 * Estatísticas agregadas do XP Ledger de um usuário.
 */
export interface XpLedgerStats {
  userId: string;
  totalGrants: number;
  totalXp: number;
  firstGrantAt: string | null;
  lastGrantAt: string | null;
  /** Quantas concessões causaram level-up. */
  levelUps: number;
  /** Total de XP ganho no último grant. */
  lastGrantAmount: number | null;
}

/**
 * Retorna a história completa de concessões de XP de um `userId`,
 * na ordem em que foram concedidas. Retorna `[]` se o usuário
 * nunca recebeu XP.
 */
export function getPartnerXpHistory(userId: string): XpLedgerEntry[] {
  return xpLedger.filter((e) => e.userId === userId);
}

/**
 * Retorna o ledger global de XP (snapshot), útil para replay,
 * auditoria e jobs de reconciliação.
 */
export function listAllXpLedger(): ReadonlyArray<XpLedgerEntry> {
  return [...xpLedger];
}

/**
 * Calcula estatísticas agregadas do XP Ledger de um `userId`.
 * Útil para dashboards e para a próxima camada de API do Partners
 * Pack expor o estado de XP via tRPC.
 */
export function getXpLedgerStats(userId: string): XpLedgerStats {
  const history = xpLedger.filter((e) => e.userId === userId);
  if (history.length === 0) {
    return {
      userId,
      totalGrants: 0,
      totalXp: 0,
      firstGrantAt: null,
      lastGrantAt: null,
      levelUps: 0,
      lastGrantAmount: null,
    };
  }
  const first = history[0];
  const last = history[history.length - 1];
  return {
    userId,
    totalGrants: history.length,
    totalXp: last.newTotal,
    firstGrantAt: first.grantedAt,
    lastGrantAt: last.grantedAt,
    levelUps: history.filter((e) => e.leveledUp).length,
    lastGrantAmount: last.amount,
  };
}

/** Helper interno: registra uma entrada no ledger. */
function recordXpGrant(entry: Omit<XpLedgerEntry, "sequence">): XpLedgerEntry {
  const full: XpLedgerEntry = { sequence: nextXpLedgerSequence++, ...entry };
  xpLedger.push(full);
  return full;
}

// ============================================================================
// Subscriber: PARTNER_TIER_PROMOTED → XP_GRANTED (+ CAREER_LEVEL_UP)
// ============================================================================

interface GrantedXpResult {
  payload: XPGrantedPayload;
  leveledUp: boolean;
  careerPayload: CareerLevelUpPayload | null;
}

/**
 * Aplica a recompensa de XP por uma promoção de tier e devolve os
 * payloads resultantes (sem publicar). Idempotente em `userId`.
 *
 * Retorna `null` quando:
 *  - A promoção não concede XP (ex.: `silver` é o tier inicial).
 *  - O `partnerId` não é finito.
 *  - O parceiro não existe no repositório in-memory.
 *
 * Nestes casos o chamador é responsável por emitir um sinal
 * diagnóstico (ex.: `SYSTEM_ALERT`) — ver o handler registrado em
 * `registerPartnersEventHandlers()`.
 */
export function applyTierPromotionXp(
  payload: PartnerTierPromotedPayload,
): GrantedXpResult | null {
  const reward = rewardForPromotion(payload.newTier);
  if (reward <= 0) return null;

  // Resolve o userId real a partir do partnerId.
  const partnerId = Number(payload.partnerId);
  if (!Number.isFinite(partnerId)) return null;
  const partner = getPartnerRecordById(partnerId);
  if (!partner) return null;

  const userId = String(partner.userId);
  const previous = xpStateByUserId.get(userId) ?? {
    userId,
    totalXp: 0,
    level: 1,
    rank: rankForLevel(1),
  };
  const previousLevel = previous.level;
  const newTotalXp = previous.totalXp + reward;
  const newLevel = levelForXp(newTotalXp);
  const leveledUp = newLevel > previousLevel;
  const newRank = rankForLevel(newLevel);
  const previousRank = rankForLevel(previousLevel);

  const xpPayload: XPGrantedPayload = {
    userId,
    amount: reward,
    reason: `partner_tier_promotion:${payload.previousTier}->${payload.newTier}`,
    source: "milestone",
    newTotal: newTotalXp,
  };

  let careerPayload: CareerLevelUpPayload | null = null;
  if (leveledUp) {
    const benefits = partnerBenefitsForLevel(newLevel);
    careerPayload = {
      userId,
      previousLevel,
      newLevel,
      previousRank,
      newRank,
      benefits,
    };
  }

  // Atualiza o estado agregado (sempre).
  xpStateByUserId.set(userId, {
    userId,
    totalXp: newTotalXp,
    level: newLevel,
    rank: newRank,
  });

  return { payload: xpPayload, leveledUp, careerPayload };
}

/**
 * Diagnóstico que explica por que `applyTierPromotionXp` retornou
 * `null`. Permite que o handler emita `SYSTEM_ALERT` ao invés de
 * descartar o evento em silêncio.
 */
export type TierPromotionXpDiagnostic =
  | { kind: "no_reward"; tier: PartnerTier }
  | { kind: "invalid_partner_id"; rawPartnerId: string }
  | { kind: "partner_not_found"; partnerId: number };

/**
 * Versão "diagnostic" de `applyTierPromotionXp`. Devolve a mesma
 * `GrantedXpResult` quando há sucesso e um `TierPromotionXpDiagnostic`
 * explicando o motivo quando retorna `null`. Usada internamente pelo
 * handler de eventos; exposta também para testes e para o futuro
 * `routers/partnersRouter.ts` que quiser inspecionar a falha.
 */
export function applyTierPromotionXpWithDiagnostic(
  payload: PartnerTierPromotedPayload,
): { result: GrantedXpResult; diagnostic: null } | { result: null; diagnostic: TierPromotionXpDiagnostic } {
  const reward = rewardForPromotion(payload.newTier);
  if (reward <= 0) {
    return { result: null, diagnostic: { kind: "no_reward", tier: payload.newTier } };
  }
  const partnerId = Number(payload.partnerId);
  if (!Number.isFinite(partnerId)) {
    return { result: null, diagnostic: { kind: "invalid_partner_id", rawPartnerId: payload.partnerId } };
  }
  const partner = getPartnerRecordById(partnerId);
  if (!partner) {
    return { result: null, diagnostic: { kind: "partner_not_found", partnerId } };
  }
  const result = applyTierPromotionXp(payload);
  // Se chegamos aqui, `applyTierPromotionXp` deve ter sucesso.
  if (!result) {
    return { result: null, diagnostic: { kind: "partner_not_found", partnerId } };
  }
  return { result, diagnostic: null };
}

function partnerBenefitsForLevel(level: number): string[] {
  if (level >= 5) return ["Manager dedicado", "Relatórios customizados"];
  if (level >= 4) return ["API de acesso", "Suporte 24/7"];
  if (level >= 3) return ["Dashboard em tempo real", "Suporte prioritário"];
  if (level >= 2) return ["Relatórios diários", "Bônus de rede escalonado"];
  return ["Dashboard básico"];
}

/**
 * Mapeia um `TierPromotionXpDiagnostic` para um `SystemAlertPayload`
 * descrevendo a falha.
 */
function alertPayloadForDiagnostic(
  diagnostic: TierPromotionXpDiagnostic,
  sourceEvent: DomainEvent<PartnerTierPromotedPayload>,
): SystemAlertPayload {
  switch (diagnostic.kind) {
    case "no_reward":
      return {
        alertId: `partners_no_reward_${sourceEvent.id}`,
        severity: "info",
        title: "Partners XP chain: no reward for tier",
        description: `Promoção para tier '${diagnostic.tier}' não concede XP. Evento ignorado.`,
      };
    case "invalid_partner_id":
      return {
        alertId: `partners_invalid_partner_id_${sourceEvent.id}`,
        severity: "warning",
        title: "Partners XP chain: invalid partnerId",
        description: `partnerId inválido recebido: '${diagnostic.rawPartnerId}'. Evento ignorado.`,
      };
    case "partner_not_found":
      return {
        alertId: `partners_partner_not_found_${sourceEvent.id}`,
        severity: "warning",
        title: "Partners XP chain: partner not found",
        description: `Nenhum partner com id ${diagnostic.partnerId} no repositório. Evento ignorado.`,
      };
  }
}

// ============================================================================
// Registro de handlers (chamado uma vez no boot do domínio)
// ============================================================================

export interface PartnerEventSubscriptionHandle {
  dispose: () => void;
}

export function registerPartnersEventHandlers(): PartnerEventSubscriptionHandle {
  const handler = async (event: DomainEvent<PartnerTierPromotedPayload>) => {
    const outcome = applyTierPromotionXpWithDiagnostic(event.payload);
    if (outcome.diagnostic) {
      // Silent-drop eliminado: emitimos um SYSTEM_ALERT para que
      // observers (audit, dashboards, agentes) possam reagir.
      await publishSystemAlert(
        alertPayloadForDiagnostic(outcome.diagnostic, event),
        {
          correlationId: event.correlationId,
          causationId: event.id,
          sourceEventType: event.type,
          sourceDomain: "partners",
          diagnostic: outcome.diagnostic,
        },
      );
      return;
    }
    // outcome.result é não-nulo aqui.
    const { payload, leveledUp, careerPayload } = outcome.result!;
    await publishXpGranted(payload, {
      correlationId: event.correlationId,
      causationId: event.id,
      sourceEventType: event.type,
    });
    if (leveledUp && careerPayload) {
      await publishCareerLevelUp(careerPayload, {
        correlationId: event.correlationId,
        causationId: event.id,
        sourceEventType: event.type,
      });
    }

    // XP Ledger (v1.3.1): registra a concessão para auditoria.
    // Reconstruímos o `partnerId` a partir do payload, já que
    // `outcome.result.payload` carrega apenas o `userId`.
    const partnerId = Number(event.payload.partnerId);
    const previousTotal = payload.newTotal - payload.amount;
    const newLevel = leveledUp && careerPayload
      ? careerPayload.newLevel
      : levelForXp(payload.newTotal);
    const previousLevel = leveledUp && careerPayload
      ? careerPayload.previousLevel
      : levelForXp(previousTotal);
    recordXpGrant({
      userId: payload.userId,
      partnerId: Number.isFinite(partnerId) ? partnerId : -1,
      amount: payload.amount,
      reason: payload.reason,
      source: payload.source,
      previousTotal,
      newTotal: payload.newTotal,
      previousLevel,
      newLevel,
      leveledUp,
      previousTier: event.payload.previousTier,
      newTier: event.payload.newTier,
      correlationId: event.correlationId,
      causationId: event.id,
      sourceEventType: event.type,
      grantedAt: new Date().toISOString(),
    });
  };

  const subscriptionId = eventBus.subscribe<PartnerTierPromotedPayload>(
    DomainEventType.PARTNER_TIER_PROMOTED,
    handler,
    { priority: 100 },
  );

  return {
    dispose: () => {
      eventBus.unsubscribe(subscriptionId);
    },
  };
}

// ============================================================================
// Helpers exportados (úteis para testes e jobs)
// ============================================================================

export const __testing = {
  levelForXp,
  rankForLevel,
  rewardForPromotion,
  nextLevelThreshold,
  TIER_PROMOTION_XP,
  LEVEL_THRESHOLDS,
  RANK_BY_LEVEL,
};
