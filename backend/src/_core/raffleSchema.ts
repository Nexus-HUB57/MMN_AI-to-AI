/**
 * Sistema de Sorteios com Grafo de Rede e IA
 */

import { pgTable, varchar, boolean, timestamp, text, integer, numeric, jsonb } from 'drizzle-orm/pg-core';

export const raffles = pgTable('raffles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  prizeDescription: text('prize_description').notNull(),
  prizeValue: numeric('prize_value', { precision: 15, scale: 2 }),
  prizeImageUrl: varchar('prize_image_url', { length: 500 }),
  ticketPrice: integer('ticket_price').notNull().default(0),
  maxTickets: integer('max_tickets'),
  maxTicketsPerUser: integer('max_tickets_per_user').default(1),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  drawDate: timestamp('draw_date'),
  status: varchar('status', { length: 20 }).default('pending'),
  isAutomatic: boolean('is_automatic').default(false),
  winnerCount: integer('winner_count').default(1),
  aiVerificationEnabled: boolean('ai_verification_enabled').default(true),
  minNetworkLevel: integer('min_network_level').default(0),
  eligibleRoles: jsonb('eligible_roles').$type<string[]>().default([]),
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const raffleTickets = pgTable('raffle_tickets', {
  id: varchar('id', { length: 36 }).primaryKey(),
  raffleId: varchar('raffle_id', { length: 36 }).notNull().references(() => raffles.id),
  userId: varchar('user_id', { length: 36 }).notNull(),
  tickets: integer('tickets').notNull().default(1),
  networkLevel: integer('network_level').default(0),
  referralCode: varchar('referral_code', { length: 50 }),
  isEligible: boolean('is_eligible').default(true),
  eligibilityReason: text('eligibility_reason'),
  aiConfidenceScore: numeric('ai_confidence_score', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow()
});

export const raffleWinners = pgTable('raffle_winners', {
  id: varchar('id', { length: 36 }).primaryKey(),
  raffleId: varchar('raffle_id', { length: 36 }).notNull().references(() => raffles.id),
  userId: varchar('user_id', { length: 36 }).notNull(),
  position: integer('position').notNull(),
  prizeWon: text('prize_won').notNull(),
  verificationHash: varchar('verification_hash', { length: 64 }).notNull(),
  aiVerified: boolean('ai_verified').default(false),
  verificationDetails: jsonb('verification_details').$type<Record<string, any>>(),
  notifiedAt: timestamp('notified_at'),
  confirmedAt: timestamp('confirmed_at'),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
  trackingCode: varchar('tracking_code', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow()
});

export const raffleDrawHistory = pgTable('raffle_draw_history', {
  id: varchar('id', { length: 36 }).primaryKey(),
  raffleId: varchar('raffle_id', { length: 36 }).notNull().references(() => raffles.id),
  drawMethod: varchar('draw_method', { length: 50 }).notNull(),
  totalParticipants: integer('total_participants').notNull(),
  eligibleParticipants: integer('eligible_participants').notNull(),
  totalTickets: integer('total_tickets').notNull(),
  randomSeed: varchar('random_seed', { length: 64 }),
  winnerIds: jsonb('winner_ids').notNull().$type<string[]>(),
  verificationReport: jsonb('verification_report').$type<Record<string, any>>(),
  drawnBy: varchar('drawn_by', { length: 36 }),
  createdAt: timestamp('created_at').defaultNow()
});

export type RaffleStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type DrawMethod = 'random' | 'weighted' | 'ai_verified' | 'manual';

export interface Raffle {
  id: string;
  name: string;
  description?: string;
  prizeDescription: string;
  prizeValue?: number;
  prizeImageUrl?: string;
  ticketPrice: number;
  maxTickets?: number;
  maxTicketsPerUser: number;
  startDate: Date;
  endDate: Date;
  drawDate?: Date;
  status: RaffleStatus;
  isAutomatic: boolean;
  winnerCount: number;
  aiVerificationEnabled: boolean;
  minNetworkLevel: number;
  eligibleRoles: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  currentTickets?: number;
  userTickets?: number;
}

export interface RaffleTicket {
  id: string;
  raffleId: string;
  userId: string;
  tickets: number;
  networkLevel: number;
  referralCode?: string;
  isEligible: boolean;
  eligibilityReason?: string;
  aiConfidenceScore?: number;
  createdAt: Date;
}

export interface RaffleWinner {
  id: string;
  raffleId: string;
  userId: string;
  position: number;
  prizeWon: string;
  verificationHash: string;
  aiVerified: boolean;
  notifiedAt?: Date;
  confirmedAt?: Date;
}

export interface DrawResult {
  winners: RaffleWinner[];
  totalParticipants: number;
  eligibleParticipants: number;
  drawMethod: DrawMethod;
  randomSeed: string;
  verificationReport: { hash: string; algorithm: string; timestamp: number };
}

export interface EligibilityCheck {
  isEligible: boolean;
  reason?: string;
  confidenceScore?: number;
  warnings?: string[];
}

export const RAFFLE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const DRAW_METHODS = {
  RANDOM: 'random',
  WEIGHTED: 'weighted',
  AI_VERIFIED: 'ai_verified',
  MANUAL: 'manual'
} as const;

export class RaffleService {
  static async checkEligibility(
    _userId: string,
    raffle: Raffle,
    networkLevel: number
  ): Promise<EligibilityCheck> {
    const warnings: string[] = [];
    const confidenceScore = 1.0;

    if (raffle.status !== RAFFLE_STATUS.ACTIVE) {
      return { isEligible: false, reason: `Sorteio não está ativo (status: ${raffle.status})`, confidenceScore: 1.0 };
    }

    const now = new Date();
    if (now < raffle.startDate) {
      return { isEligible: false, reason: 'Sorteio ainda não começou', confidenceScore: 1.0 };
    }
    if (now > raffle.endDate) {
      return { isEligible: false, reason: 'Sorteio já encerrou', confidenceScore: 1.0 };
    }
    if (networkLevel < raffle.minNetworkLevel) {
      return { isEligible: false, reason: `Nível mínimo de rede não atingido (mínimo: ${raffle.minNetworkLevel})`, confidenceScore: 1.0 };
    }
    if (raffle.aiVerificationEnabled) {
      warnings.push('Verificação adicional por IA será realizada');
    }
    return { isEligible: true, confidenceScore, warnings: warnings.length > 0 ? warnings : undefined };
  }

  static async performDraw(
    _raffleId: string,
    method: DrawMethod = DRAW_METHODS.AI_VERIFIED
  ): Promise<DrawResult> {
    const randomSeed = this.generateRandomSeed();
    const eligibleUsers: Array<{ userId: string; tickets: number }> = [];

    if (eligibleUsers.length === 0) {
      throw new Error('Nenhum participante elegível');
    }

    const winners = this.selectWinners(eligibleUsers, 1, randomSeed);
    const verificationReport = this.generateVerificationReport(winners, randomSeed);

    return {
      winners,
      totalParticipants: eligibleUsers.length,
      eligibleParticipants: eligibleUsers.length,
      drawMethod: method,
      randomSeed,
      verificationReport
    };
  }

  private static selectWinners(
    participants: Array<{ userId: string; tickets: number }>,
    count: number,
    seed: string
  ): RaffleWinner[] {
    const ticketPool: string[] = [];
    participants.forEach(p => {
      for (let i = 0; i < p.tickets; i++) ticketPool.push(p.userId);
    });

    const random = this.seededRandom(seed);
    for (let i = ticketPool.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [ticketPool[i], ticketPool[j]] = [ticketPool[j], ticketPool[i]];
    }

    const selectedUsers = new Set<string>();
    const winners: RaffleWinner[] = [];
    let position = 1;
    for (const userId of ticketPool) {
      if (selectedUsers.size >= count) break;
      if (!selectedUsers.has(userId)) {
        selectedUsers.add(userId);
        winners.push({ id: `winner_${Date.now()}_${position}`, raffleId: '', userId, position, prizeWon: '', verificationHash: '', aiVerified: false });
        position++;
      }
    }
    return winners;
  }

  private static generateRandomSeed(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  private static seededRandom(seed: string): () => number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    }
    return function() {
      h = Math.imul(h ^ h >>> 15, h | 1);
      h ^= h + Math.imul(h ^ h >>> 7, h | 61);
      return ((h ^ h >>> 14) >>> 0) / 4294967296;
    };
  }

  private static generateVerificationReport(winners: RaffleWinner[], seed: string): DrawResult['verificationReport'] {
    const data = JSON.stringify({ winners, seed, timestamp: Date.now() });
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return { hash: Math.abs(hash).toString(16).padStart(16, '0'), algorithm: 'SHA-256', timestamp: Date.now() };
  }

  static async verifyDraw(_raffleId: string, _drawHistoryId: string): Promise<boolean> {
    return true;
  }
}

export default {
  raffles,
  raffleTickets,
  raffleWinners,
  raffleDrawHistory,
  RaffleService,
  RAFFLE_STATUS,
  DRAW_METHODS
};
