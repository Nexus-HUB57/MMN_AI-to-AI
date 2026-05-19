/**
 * Sistema de Holdings e Dividendos
 *
 * Permite que afiliados acumulem participações acionárias e recebam dividendos.
 */

import { mysqlTable, varchar, boolean, timestamp, text, int, decimal, json } from 'drizzle-orm/mysql-core';

// ============================================
// SCHEMA DO BANCO DE DADOS
// ============================================

/**
 * Holdings (Empresas/Fundos)
 */
export const holdings = mysqlTable('holdings', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(),  // company, fund, dao
  totalShares: int('total_shares').notNull(),
  sharePrice: decimal('share_price', { precision: 15, scale: 2 }).notNull(),  // Preço por ação
  currency: varchar('currency', { length: 3 }).default('BRL'),
  status: varchar('status', { length: 20 }).default('active'),  // active, closed, suspended
  minShares: int('min_shares').default(1),
  maxSharesPerUser: int('max_shares_per_user'),  // Limite por usuário, null = sem limite
  dividendYield: decimal('dividend_yield', { precision: 5, scale: 4 }).default(0),  // Rendimento anual
  isPublic: boolean('is_public').default(false),  // Visível publicamente
  requiresKYC: boolean('requires_kyc').default(false),  // Requer KYC completo
  metadata: json('metadata'),
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

/**
 * Participações (Holdings Shares)
 */
export const holdingsShares = mysqlTable('holdings_shares', {
  id: varchar('id', { length: 36 }).primaryKey(),
  holdingId: varchar('holding_id', { length: 36 }).notNull().references(() => holdings.id),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => holdings.id),
  shares: int('shares').notNull(),
  averagePrice: decimal('average_price', { precision: 15, scale: 2 }).notNull(),
  totalInvested: decimal('total_invested', { precision: 15, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('active'),  // active, locked, sold
  lockedUntil: timestamp('locked_until'),  // Período de lock
  acquiredAt: timestamp('acquired_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Transações de Ações
 */
export const holdingsTransactions = mysqlTable('holdings_transactions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  holdingId: varchar('holding_id', { length: 36 }).notNull().references(() => holdings.id),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => holdings.id),
  type: varchar('type', { length: 50 }).notNull(),  // buy, sell, dividend, split, bonus
  shares: int('shares').notNull(),
  pricePerShare: decimal('price_per_share', { precision: 15, scale: 2 }),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  fee: decimal('fee', { precision: 15, scale: 2 }).default(0),
  status: varchar('status', { length: 20 }).default('pending'),  // pending, completed, cancelled
  referenceId: varchar('reference_id', { length: 36 }),  // Ordem ou dividend_id
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Dividendos Distribuídos
 */
export const dividends = mysqlTable('dividends', {
  id: varchar('id', { length: 36 }).primaryKey(),
  holdingId: varchar('holding_id', { length: 36 }).notNull().references(() => holdings.id),
  period: varchar('period', { length: 20 }).notNull(),  // 2024-Q1, 2024-01, etc
  amountPerShare: decimal('amount_per_share', { precision: 15, scale: 6 }).notNull(),
  totalDistributed: decimal('total_distributed', { precision: 15, scale: 2 }).notNull(),
  totalShares: int('total_shares').notNull(),
  recordDate: timestamp('record_date').notNull(),  // Data de registro
  paymentDate: timestamp('payment_date').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),  // pending, distributed, cancelled
  distributionType: varchar('distribution_type', { length: 30 }).default('cash'),  // cash, shares, bonus
  createdAt: timestamp('created_at').defaultNow()
});

/**
 * Dividendos por Usuário
 */
export const userDividends = mysqlTable('user_dividends', {
  id: varchar('id', { length: 36 }).primaryKey(),
  dividendId: varchar('dividend_id', { length: 36 }).notNull().references(() => dividends.id),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => holdings.id),
  holdingSharesId: varchar('holding_shares_id', { length: 36 }).notNull().references(() => holdingsShares.id),
  sharesOwned: int('shares_owned').notNull(),
  amountPerShare: decimal('amount_per_share', { precision: 15, scale: 6 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 15, scale: 2 }).default(0),
  netAmount: decimal('net_amount', { precision: 15, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'),  // pending, paid, reinvested
  paidAt: timestamp('paid_at'),
  reinvestedIntoHoldingId: varchar('reinvested_into_holding_id', { length: 36 }),
  createdAt: timestamp('created_at').defaultNow()
});

// ============================================
// TIPOS E INTERFACES
// ============================================

export type HoldingType = 'company' | 'fund' | 'dao';
export type HoldingStatus = 'active' | 'closed' | 'suspended';
export type TransactionType = 'buy' | 'sell' | 'dividend' | 'split' | 'bonus';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';
export type DividendStatus = 'pending' | 'distributed' | 'cancelled';
export type DistributionType = 'cash' | 'shares' | 'bonus';

export interface Holding {
  id: string;
  name: string;
  description?: string;
  type: HoldingType;
  totalShares: number;
  sharePrice: number;
  currency: string;
  status: HoldingStatus;
  minShares: number;
  maxSharesPerUser?: number;
  dividendYield: number;
  isPublic: boolean;
  requiresKYC: boolean;
  createdBy: string;
  createdAt: Date;
  // Campos calculados
  circulatingShares?: number;
  marketCap?: number;
  userShares?: number;
  userDividendAccrued?: number;
}

export interface HoldingShare {
  id: string;
  holdingId: string;
  userId: string;
  shares: number;
  averagePrice: number;
  totalInvested: number;
  status: 'active' | 'locked' | 'sold';
  lockedUntil?: Date;
  acquiredAt: Date;
  // Campos calculados
  currentValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
}

export interface Dividend {
  id: string;
  holdingId: string;
  period: string;
  amountPerShare: number;
  totalDistributed: number;
  totalShares: number;
  recordDate: Date;
  paymentDate: Date;
  status: DividendStatus;
  distributionType: DistributionType;
}

export interface DividendPayment {
  id: string;
  dividendId: string;
  userId: string;
  holdingSharesId: string;
  sharesOwned: number;
  amountPerShare: number;
  totalAmount: number;
  tax: number;
  netAmount: number;
  status: 'pending' | 'paid' | 'reinvested';
  paidAt?: Date;
}

// ============================================
// CONSTANTES
// ============================================

export const HOLDING_TYPES = {
  COMPANY: 'company',
  FUND: 'fund',
  DAO: 'dao'
} as const;

export const TRANSACTION_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
  DIVIDEND: 'dividend',
  SPLIT: 'split',
  BONUS: 'bonus'
} as const;

export const DIVIDEND_STATUS = {
  PENDING: 'pending',
  DISTRIBUTED: 'distributed',
  CANCELLED: 'cancelled'
} as const;

// ============================================
// SERVICE
// ============================================

export class HoldingsService {
  /**
   * Compra ações
   */
  static async buyShares(
    holdingId: string,
    userId: string,
    shares: number,
    pricePerShare: number
  ): Promise<{ transaction: any; newBalance: HoldingShare }> {
    const totalAmount = shares * pricePerShare;
    const fee = totalAmount * 0.01; // 1% taxa

    // TODO: Verificar saldo do usuário
    // TODO: Verificar limite de ações
    // TODO: Criar transação
    // TODO: Atualizar ou criar holding shares

    return {
      transaction: {
        id: `txn_${Date.now()}`,
        holdingId,
        userId,
        type: 'buy',
        shares,
        pricePerShare,
        totalAmount,
        fee,
        status: 'completed'
      },
      newBalance: {
        id: `hs_${Date.now()}`,
        holdingId,
        userId,
        shares,
        averagePrice: pricePerShare,
        totalInvested: totalAmount,
        status: 'active'
      }
    };
  }

  /**
   * Vende ações
   */
  static async sellShares(
    holdingId: string,
    userId: string,
    shares: number,
    pricePerShare: number
  ): Promise<{ transaction: any; newBalance: HoldingShare; proceeds: number }> {
    // TODO: Verificar se usuário possui ações suficientes
    // TODO: Criar transação de venda
    // TODO: Atualizar balance

    const totalAmount = shares * pricePerShare;
    const fee = totalAmount * 0.01;

    return {
      transaction: {
        id: `txn_${Date.now()}`,
        holdingId,
        userId,
        type: 'sell',
        shares,
        pricePerShare,
        totalAmount,
        fee,
        status: 'pending'
      },
      newBalance: {
        id: `hs_${Date.now()}`,
        holdingId,
        userId,
        shares: 0,
        averagePrice: 0,
        totalInvested: 0,
        status: 'sold'
      },
      proceeds: totalAmount - fee
    };
  }

  /**
   * Distribui dividendos
   */
  static async distributeDividends(
    holdingId: string,
    period: string,
    amountPerShare: number
  ): Promise<{ dividend: Dividend; payments: DividendPayment[] }> {
    // TODO: Obter todos os detentores de ações
    // TODO: Calcular dividend por usuário
    // TODO: Criar registro de dividend
    // TODO: Criar pagamentos pendentes

    const payments: DividendPayment[] = [];

    return {
      dividend: {
        id: `div_${Date.now()}`,
        holdingId,
        period,
        amountPerShare,
        totalDistributed: 0,
        totalShares: 0,
        recordDate: new Date(),
        paymentDate: new Date(),
        status: 'pending'
      },
      payments
    };
  }

  /**
   * Calcula rendimento por período
   */
  static calculateYield(shares: number, price: number, dividendPerShare: number): {
    grossAmount: number;
    tax: number;
    netAmount: number;
    yieldPercent: number;
  } {
    const grossAmount = shares * dividendPerShare;
    const tax = grossAmount * 0.15; // 15% IR
    const netAmount = grossAmount - tax;
    const yieldPercent = (dividendPerShare / price) * 100;

    return {
      grossAmount,
      tax,
      netAmount,
      yieldPercent
    };
  }

  /**
   * Obtém portfólio consolidado do usuário
   */
  static async getUserPortfolio(userId: string): Promise<{
    holdings: HoldingShare[];
    totalInvested: number;
    totalCurrentValue: number;
    totalProfitLoss: number;
    totalDividendsAccrued: number;
  }> {
    // TODO: Buscar todas as holdings do usuário
    // TODO: Calcular valores atuais baseados nos preços de mercado

    return {
      holdings: [],
      totalInvested: 0,
      totalCurrentValue: 0,
      totalProfitLoss: 0,
      totalDividendsAccrued: 0
    };
  }
}

export default {
  holdings,
  holdingsShares,
  holdingsTransactions,
  dividends,
  userDividends,
  HoldingsService,
  HOLDING_TYPES,
  TRANSACTION_TYPES,
  DIVIDEND_STATUS
};