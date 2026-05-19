/**
 * Sistema de Títulos de Capitalização
 *
 * Produtos financeiros de longo prazo com sorteios periódicos.
 */

import { mysqlTable, varchar, boolean, timestamp, text, int, decimal, json } from 'drizzle-orm/mysql-core';

// ============================================
// SCHEMA DO BANCO DE DADOS
// ============================================

/**
 * Títulos de Capitalização (Capitalization Titles)
 */
export const capitalizationTitles = mysqlTable('capitalization_titles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(),  // traditional, incentive, monthly
  faceValue: decimal('face_value', { precision: 15, scale: 2 }).notNull(),  // Valor de face
  monthlyContribution: decimal('monthly_contribution', { precision: 15, scale: 2 }).notNull(),
  termMonths: int('term_months').notNull(),  // Prazo em meses
  gracePeriodMonths: int('grace_period_months').default(0),  // Período de carência
  minPurchaseAmount: decimal('min_purchase_amount', { precision: 15, scale: 2 }),
  maxPurchaseAmount: decimal('max_purchase_amount', { precision: 15, scale: 2 }),
  validityStart: timestamp('validity_start').notNull(),
  validityEnd: timestamp('validity_end').notNull(),
  status: varchar('status', { length: 20 }).default('active'),  // active, paused, closed
  solvent: varchar('solvent_id', { length: 36 }),  // Empresa emissora
  cvmCode: varchar('cvm_code', { length: 50 }),  // Código CVM
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

/**
 * Títulos Comprados (Purchased Titles)
 */
export const purchasedTitles = mysqlTable('purchased_titles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  titleId: varchar('title_id', { length: 36 }).notNull().references(() => capitalizationTitles.id),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => capitalizationTitles.id),
  serialNumber: varchar('serial_number', { length: 50 }).notNull().unique(),
  purchaseDate: timestamp('purchase_date').defaultNow(),
  activationDate: timestamp('activation_date'),
  maturityDate: timestamp('maturity_date').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),  // pending, active, matured, cancelled, redeemed
  totalPaidAmount: decimal('total_paid_amount', { precision: 15, scale: 2 }).notNull().default(0),
  lastPaymentDate: timestamp('last_payment_date'),
  nextPaymentDate: timestamp('next_payment_date'),
  paymentCount: int('payment_count').default(0),
  redemptionValue: decimal('redemption_value', { precision: 15, scale: 2 }),  // Valor de resgate
  redeemedAt: timestamp('redeemed_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Pagamentos de Títulos
 */
export const titlePayments = mysqlTable('title_payments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  purchasedTitleId: varchar('purchased_title_id', { length: 36 }).notNull().references(() => purchasedTitles.id),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => purchasedTitles.id),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 30 }).notNull(),  // pix, credit_card, bank_transfer
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending'),  // pending, completed, failed, refunded
  dueDate: timestamp('due_date').notNull(),
  paidAt: timestamp('paid_at'),
  transactionRef: varchar('transaction_ref', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Sorteios de Títulos
 */
export const titleDraws = mysqlTable('title_draws', {
  id: varchar('id', { length: 36 }).primaryKey(),
  titleId: varchar('title_id', { length: 36 }).notNull().references(() => capitalizationTitles.id),
  drawNumber: int('draw_number').notNull(),
  drawDate: timestamp('draw_date').notNull(),
  prizeDescription: text('prize_description').notNull(),
  prizeValue: decimal('prize_value', { precision: 15, scale: 2 }).notNull(),
  totalParticipants: int('total_participants').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),  // pending, completed, cancelled
  resultPublishedAt: timestamp('result_published_at'),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Ganhadores de Sorteio de Títulos
 */
export const titleDrawWinners = mysqlTable('title_draw_winners', {
  id: varchar('id', { length: 36 }).primaryKey(),
  drawId: varchar('draw_id', { length: 36 }).notNull().references(() => titleDraws.id),
  purchasedTitleId: varchar('purchased_title_id', { length: 36 }).notNull().references(() => purchasedTitles.id),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => purchasedTitles.id),
  position: int('position').notNull(),
  prizeWon: text('prize_won').notNull(),
  prizeValue: decimal('prize_value', { precision: 15, scale: 2 }).notNull(),
  verificationHash: varchar('verification_hash', { length: 64 }).notNull(),
  notifiedAt: timestamp('notified_at'),
  confirmedAt: timestamp('confirmed_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// ============================================
// TIPOS E INTERFACES
// ============================================

export type TitleType = 'traditional' | 'incentive' | 'monthly';
export type TitleStatus = 'pending' | 'active' | 'matured' | 'cancelled' | 'redeemed';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type DrawStatus = 'pending' | 'completed' | 'cancelled';

export interface CapitalizationTitle {
  id: string;
  name: string;
  description?: string;
  type: TitleType;
  faceValue: number;
  monthlyContribution: number;
  termMonths: number;
  gracePeriodMonths: number;
  minPurchaseAmount?: number;
  maxPurchaseAmount?: number;
  validityStart: Date;
  validityEnd: Date;
  status: TitleStatus;
  solvent?: string;
  cvmCode?: string;
}

export interface PurchasedTitle {
  id: string;
  titleId: string;
  userId: string;
  serialNumber: string;
  purchaseDate: Date;
  activationDate?: Date;
  maturityDate: Date;
  status: TitleStatus;
  totalPaidAmount: number;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  paymentCount: number;
  redemptionValue?: number;
  redeemedAt?: Date;
  // Campos calculados
  title?: CapitalizationTitle;
  isPaidOff?: boolean;
  daysToMaturity?: number;
  projectedValue?: number;
}

export interface TitlePayment {
  id: string;
  purchasedTitleId: string;
  userId: string;
  amount: number;
  paymentMethod: 'pix' | 'credit_card' | 'bank_transfer';
  paymentStatus: PaymentStatus;
  dueDate: Date;
  paidAt?: Date;
  transactionRef?: string;
}

export interface TitleDraw {
  id: string;
  titleId: string;
  drawNumber: number;
  drawDate: Date;
  prizeDescription: string;
  prizeValue: number;
  totalParticipants: number;
  status: DrawStatus;
  resultPublishedAt?: Date;
}

export interface TitleDrawWinner {
  id: string;
  drawId: string;
  purchasedTitleId: string;
  userId: string;
  position: number;
  prizeWon: string;
  prizeValue: number;
  notifiedAt?: Date;
  confirmedAt?: Date;
}

// ============================================
// CONSTANTES
// ============================================

export const TITLE_TYPES = {
  TRADITIONAL: 'traditional',
  INCENTIVE: 'incentive',
  MONTHLY: 'monthly'
} as const;

export const TITLE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  MATURED: 'matured',
  CANCELLED: 'cancelled',
  REDEEMED: 'redeemed'
} as const;

export const PAYMENT_METHODS = {
  PIX: 'pix',
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer'
} as const;

// ============================================
// SERVICE
// ============================================

export class CapitalizationTitleService {
  /**
   * Compra um título
   */
  static async purchase(
    titleId: string,
    userId: string,
    paymentMethod: 'pix' | 'credit_card' | 'bank_transfer'
  ): Promise<{
    purchasedTitle: PurchasedTitle;
    firstPayment: TitlePayment;
  }> {
    // TODO: Validar título
    // TODO: Criar purchasedTitle
    // TODO: Criar primeiro pagamento
    // TODO: Processar pagamento inicial

    const serialNumber = `CT${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    return {
      purchasedTitle: {
        id: `pt_${Date.now()}`,
        titleId,
        userId,
        serialNumber,
        purchaseDate: new Date(),
        maturityDate: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000), // Placeholder
        status: 'pending',
        totalPaidAmount: 0,
        paymentCount: 0
      },
      firstPayment: {
        id: `pmt_${Date.now()}`,
        purchasedTitleId: '',
        userId,
        amount: 0, // Placeholder
        paymentMethod,
        paymentStatus: 'pending',
        dueDate: new Date()
      }
    };
  }

  /**
   * Processa pagamento mensal
   */
  static async processPayment(
    purchasedTitleId: string,
    paymentMethod: 'pix' | 'credit_card' | 'bank_transfer'
  ): Promise<{ success: boolean; payment: TitlePayment }> {
    // TODO: Verificar título
    // TODO: Verificar data de pagamento
    // TODO: Processar pagamento
    // TODO: Atualizar purchasedTitle

    return {
      success: true,
      payment: {
        id: `pmt_${Date.now()}`,
        purchasedTitleId,
        userId: '',
        amount: 0,
        paymentMethod,
        paymentStatus: 'completed',
        dueDate: new Date(),
        paidAt: new Date()
      }
    };
  }

  /**
   * Calcula valor de resgate
   */
  static calculateRedemptionValue(
    purchasedTitle: PurchasedTitle,
    currentTitle: CapitalizationTitle
  ): {
    totalPaid: number;
    redemptionPercentage: number;
    redemptionValue: number;
    penalty: number;
    netValue: number;
  } {
    const totalPaid = purchasedTitle.totalPaidAmount;

    // Determinar percentual baseado no tempo decorrido
    const monthsElapsed = Math.floor(
      (Date.now() - (purchasedTitle.activationDate?.getTime() || purchasedTitle.purchaseDate.getTime())) /
      (30 * 24 * 60 * 60 * 1000)
    );

    let redemptionPercentage = 0;

    if (currentTitle.type === 'traditional') {
      // Título tradicional: percentuais legais
      if (monthsElapsed < 3) redemptionPercentage = 0;
      else if (monthsElapsed < 6) redemptionPercentage = 0.5;
      else if (monthsElapsed < 12) redemptionPercentage = 0.75;
      else redemptionPercentage = 1.0;
    } else {
      // Título mensal/incentivo: regras próprias
      redemptionPercentage = Math.min(monthsElapsed / currentTitle.termMonths, 1);
    }

    const redemptionValue = totalPaid * redemptionPercentage;
    const penalty = redemptionPercentage < 1 ? redemptionValue * 0.1 : 0; // 10% multa
    const netValue = redemptionValue - penalty;

    return {
      totalPaid,
      redemptionPercentage: redemptionPercentage * 100,
      redemptionValue,
      penalty,
      netValue
    };
  }

  /**
   * Realiza sorteio de título
   */
  static async performDraw(
    titleId: string,
    drawNumber: number,
    prizeValue: number,
    prizeDescription: string,
    winnerCount: number = 1
  ): Promise<{
    draw: TitleDraw;
    winners: TitleDrawWinner[];
  }> {
    // TODO: Obter todos os títulos elegíveis
    // TODO: Executar sorteio
    // TODO: Registrar ganadores

    return {
      draw: {
        id: `d_${Date.now()}`,
        titleId,
        drawNumber,
        drawDate: new Date(),
        prizeDescription,
        prizeValue,
        totalParticipants: 0,
        status: 'completed',
        resultPublishedAt: new Date()
      },
      winners: []
    };
  }

  /**
   * Verifica elegibilidade para sorteio
   */
  static isEligibleForDraw(purchasedTitle: PurchasedTitle): boolean {
    if (purchasedTitle.status !== 'active') {
      return false;
    }

    // Deve ter pelo menos 1 pagamento confirmado
    if (purchasedTitle.paymentCount < 1) {
      return false;
    }

    // Não pode estar em período de carência para novos sorteios
    // (regra específica do título)

    return true;
  }
}

export default {
  capitalizationTitles,
  purchasedTitles,
  titlePayments,
  titleDraws,
  titleDrawWinners,
  CapitalizationTitleService,
  TITLE_TYPES,
  TITLE_STATUS,
  PAYMENT_METHODS
};