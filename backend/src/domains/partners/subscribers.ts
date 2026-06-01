/**
 * Partners domain — event subscribers.
 *
 * Wiring de reações automáticas a eventos publicados pelo próprio
 * domínio Partners (e por outros domínios no futuro).
 *
 * v1.3.0:
 *  - `PARTNER_TIER_PROMOTED` → `XP_GRANTED` + (opcional) `CAREER_LEVEL_UP`
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

  const xpPayload: XPGrantedPayload = {
    userId,
    amount: reward,
    reason: `partner_tier_promotion:${payload.previousTier}->${payload.newTier}`,
    source: "milestone",
    newTotal: newTotalXp,
  };

  let careerPayload: CareerLevelUpPayload | null = null;
  if (leveledUp) {
    const newRank = rankForLevel(newLevel);
    const previousRank = rankForLevel(previousLevel);
    const benefits = partnerBenefitsForLevel(newLevel);
    careerPayload = {
      userId,
      previousLevel,
      newLevel,
      previousRank,
      newRank,
      benefits,
    };
    xpStateByUserId.set(userId, {
      userId,
      totalXp: newTotalXp,
      level: newLevel,
      rank: newRank,
    });
  } else {
    xpStateByUserId.set(userId, {
      userId,
      totalXp: newTotalXp,
      level: newLevel,
      rank: rankForLevel(newLevel),
    });
  }

  return { payload: xpPayload, leveledUp, careerPayload };
}

function partnerBenefitsForLevel(level: number): string[] {
  if (level >= 5) return ["Manager dedicado", "Relatórios customizados"];
  if (level >= 4) return ["API de acesso", "Suporte 24/7"];
  if (level >= 3) return ["Dashboard em tempo real", "Suporte prioritário"];
  if (level >= 2) return ["Relatórios diários", "Bônus de rede escalonado"];
  return ["Dashboard básico"];
}

// ============================================================================
// Registro de handlers (chamado uma vez no boot do domínio)
// ============================================================================

export interface PartnerEventSubscriptionHandle {
  dispose: () => void;
}

export function registerPartnersEventHandlers(): PartnerEventSubscriptionHandle {
  const handler = async (event: DomainEvent<PartnerTierPromotedPayload>) => {
    const result = applyTierPromotionXp(event.payload);
    if (!result) return;
    await publishXpGranted(result.payload, {
      correlationId: event.correlationId,
      causationId: event.id,
      sourceEventType: event.type,
    });
    if (result.leveledUp && result.careerPayload) {
      await publishCareerLevelUp(result.careerPayload, {
        correlationId: event.correlationId,
        causationId: event.id,
        sourceEventType: event.type,
      });
    }
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
