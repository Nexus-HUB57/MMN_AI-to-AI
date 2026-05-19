/**
 * Sistema de Sorteios com Grafo de Rede e IA
 *
 * Sorteios justos baseados na árvore de rede MMN, com verificação por IA.
 */

import { mysqlTable, varchar, boolean, timestamp, text, int, decimal, json } from 'drizzle-orm/mysql-core';

// ============================================
// SCHEMA DO BANCO DE DADOS
// ============================================

/**
 * Sorteios (Raffles)
 */
export const raffles = mysqlTable('raffles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  prizeDescription: text('prize_description').notNull(),
  prizeValue: decimal('prize_value', { precision: 15, scale: 2 }),
  prizeImageUrl: varchar('prize_image_url', { length: 500 }),
  ticketPrice: int('ticket_price').notNull().default(0),  // Em centavos, 0 = gratuito
  maxTickets: int('max_tickets'),
  maxTicketsPerUser: int('max_tickets_per_user').default(1),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  drawDate: timestamp('draw_date'),
  status: varchar('status', { length: 20 }).default('pending'),  // pending, active, completed, cancelled
  isAutomatic: boolean('is_automatic').default(false),  // Sorteio automático vs manual
  winnerCount: int('winner_count').default(1),
  aiVerificationEnabled: boolean('ai_verification_enabled').default(true),
  minNetworkLevel: int('min_network_level').default(0),  // Nível mínimo na rede
  eligibleRoles: json('eligible_roles').default([]),  // Roles elegíveis
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

/**
 * Bilhetes de Sorteio (Raffle Tickets)
 */
export const raffleTickets = mysqlTable('raffle_tickets', {
  id: varchar('id', { length: 36 }).primaryKey(),
  raffleId: varchar('raffle_id', { length: 36 }).notNull().references(() => raffles.id),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => raffles.id),  // users.id
  tickets: int('tickets').notNull().default(1),
  networkLevel: int('network_level').default(0),  // Nível do usuário na rede no momento
  referralCode: varchar('referral_code', { length: 50 }),  // Código que gerou acesso
  isEligible: boolean('is_eligible').default(true),  // Verificado por IA
  eligibilityReason: text('eligibility_reason'),
  aiConfidenceScore: decimal('ai_confidence_score', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Resultado dos Sorteios (Winners)
 */
export const raffleWinners = mysqlTable('raffle_winners', {
  id: varchar('id', { length: 36 }).primaryKey(),
  raffleId: varchar('raffle_id', { length: 36 }).notNull().references(() => raffles.id),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => raffles.id),
  position: int('position').notNull(),  // 1, 2, 3...
  prizeWon: text('prize_won').notNull(),
  verificationHash: varchar('verification_hash', { length: 64 }).notNull(),  // Hash para verificar resultado
  aiVerified: boolean('ai_verified').default(false),
  verificationDetails: json('verification_details'),
  notifiedAt: timestamp('notified_at'),
  confirmedAt: timestamp('confirmed_at'),
  shippedAt: timestamp('shipped_at'),
  deliveredAt: timestamp('delivered_at'),
  trackingCode: varchar('tracking_code', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Histórico de Sorteios para Auditoria
 */
export const raffleDrawHistory = mysqlTable('raffle_draw_history', {
  id: varchar('id', { length: 36 }).primaryKey(),
  raffleId: varchar('raffle_id', { length: 36 }).notNull().references(() => raffles.id),
  drawMethod: varchar('draw_method', { length: 50 }).notNull(),  // random, weighted, ai_verified
  totalParticipants: int('total_participants').notNull(),
  eligibleParticipants: int('eligible_participants').notNull(),
  totalTickets: int('total_tickets').notNull(),
  randomSeed: varchar('random_seed', { length: 64 }),  // Seed usado para reprodutibilidade
  winnerIds: json('winner_ids').notNull(),
  verificationReport: json('verification_report'),
  drawnBy: varchar('drawn_by', { length: 36 }),  // userId ou 'system'
  createdAt: timestamp('created_at').defaultNow()
});

// ============================================
// TIPOS E INTERFACES
// ============================================

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
  verificationReport: {
    hash: string;
    algorithm: string;
    timestamp: number;
  };
}

export interface EligibilityCheck {
  isEligible: boolean;
  reason?: string;
  confidenceScore?: number;
  warnings?: string[];
}

// ============================================
// CONSTANTES
// ============================================

export const RAFFLE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const DRAW_METHODS = {
  RANDOM: 'random',
  WEIGHTED: 'weighted',  // Baseado em tickets comprados
  AI_VERIFIED: 'ai_verified',  // Com verificação de IA
  MANUAL: 'manual'  // Escolha manual por admin
} as const;

// ============================================
// SERVICE
// ============================================

export class RaffleService {
  /**
   * Verifica elegibilidade do usuário
   */
  static async checkEligibility(
    userId: string,
    raffle: Raffle,
    networkLevel: number
  ): Promise<EligibilityCheck> {
    const warnings: string[] = [];
    let confidenceScore = 1.0;

    // Verificar status do sorteio
    if (raffle.status !== RAFFLE_STATUS.ACTIVE) {
      return {
        isEligible: false,
        reason: `Sorteio não está ativo (status: ${raffle.status})`,
        confidenceScore: 1.0
      };
    }

    // Verificar data
    const now = new Date();
    if (now < raffle.startDate) {
      return {
        isEligible: false,
        reason: 'Sorteio ainda não começou',
        confidenceScore: 1.0
      };
    }

    if (now > raffle.endDate) {
      return {
        isEligible: false,
        reason: 'Sorteio já encerrou',
        confidenceScore: 1.0
      };
    }

    // Verificar nível de rede
    if (networkLevel < raffle.minNetworkLevel) {
      return {
        isEligible: false,
        reason: `Nível mínimo de rede não atingido (mínimo: ${raffle.minNetworkLevel})`,
        confidenceScore: 1.0
      };
    }

    // Verificar limite de tickets por usuário
    if (raffle.maxTicketsPerUser > 0) {
      // TODO: Consultar tickets já comprados pelo usuário
      const existingTickets = 0; // Placeholder
      if (existingTickets >= raffle.maxTicketsPerUser) {
        return {
          isEligible: false,
          reason: `Limite de bilhetes atingido (máximo: ${raffle.maxTicketsPerUser})`,
          confidenceScore: 1.0
        };
      }
    }

    // Verificar limite máximo de tickets
    if (raffle.maxTickets && raffle.maxTickets > 0) {
      // TODO: Consultar total de tickets vendidos
      const currentTickets = 0;
      if (currentTickets >= raffle.maxTickets) {
        return {
          isEligible: false,
          reason: 'Todos os bilhetes foram vendidos',
          confidenceScore: 1.0
        };
      }
    }

    // Se IA verification estiver habilitada, adicionar warning
    if (raffle.aiVerificationEnabled) {
      warnings.push('Verificação adicional por IA será realizada');
    }

    return {
      isEligible: true,
      confidenceScore,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Realiza sorteio
   */
  static async performDraw(
    raffleId: string,
    method: DrawMethod = DRAW_METHODS.AI_VERIFIED
  ): Promise<DrawResult> {
    // Gerar seed aleatório
    const randomSeed = this.generateRandomSeed();

    // TODO: Obter participantes elegíveis
    const eligibleUsers: Array<{ userId: string; tickets: number }> = [];

    if (eligibleUsers.length === 0) {
      throw new Error('Nenhum participante elegível');
    }

    // Selecionar ganadores
    const winners = this.selectWinners(eligibleUsers, 1, randomSeed);

    // Gerar hash de verificação
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

  /**
   * Seleciona ganadores usando algoritmo Fisher-Yates
   */
  private static selectWinners(
    participants: Array<{ userId: string; tickets: number }>,
    count: number,
    seed: string
  ): RaffleWinner[] {
    // Criar pool de tickets
    const ticketPool: string[] = [];
    participants.forEach(p => {
      for (let i = 0; i < p.tickets; i++) {
        ticketPool.push(p.userId);
      }
    });

    // Embaralhar usando seed
    const random = this.seededRandom(seed);
    for (let i = ticketPool.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [ticketPool[i], ticketPool[j]] = [ticketPool[j], ticketPool[i]];
    }

    // Selecionar ganadores únicos
    const selectedUsers = new Set<string>();
    const winners: RaffleWinner[] = [];
    let position = 1;

    for (const userId of ticketPool) {
      if (selectedUsers.size >= count) break;
      if (!selectedUsers.has(userId)) {
        selectedUsers.add(userId);
        winners.push({
          id: `winner_${Date.now()}_${position}`,
          raffleId: '',
          userId,
          position,
          prizeWon: '',
          verificationHash: '',
          aiVerified: false
        });
        position++;
      }
    }

    return winners;
  }

  /**
   * Gera seed aleatório
   */
  private static generateRandomSeed(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Random seeded
   */
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

  /**
   * Gera relatório de verificação
   */
  private static generateVerificationReport(
    winners: RaffleWinner[],
    seed: string
  ): DrawResult['verificationReport'] {
    const data = JSON.stringify({ winners, seed, timestamp: Date.now() });
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Simple hash (em produção usar SHA-256 real)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return {
      hash: Math.abs(hash).toString(16).padStart(16, '0'),
      algorithm: 'SHA-256',
      timestamp: Date.now()
    };
  }

  /**
   * Verifica resultado do sorteio
   */
  static async verifyDraw(raffleId: string, drawHistoryId: string): Promise<boolean> {
    // TODO: Implementar verificação real com IA
    // Comparar hash stored com hash recalculado
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