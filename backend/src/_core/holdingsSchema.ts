/**
 * Sistema de Holdings e Dividendos
 */

import { pgTable, varchar, boolean, timestamp, text, integer, numeric, jsonb } from 'drizzle-orm/pg-core';

export const holdings = pgTable('holdings', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(),
  totalShares: integer('total_shares').notNull(),
  sharePrice: numeric('share_price', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('BRL'),
  status: varchar('status', { length: 20 }).default('active'),
  minShares: integer('min_shares').default(1),
  maxSharesPerUser: integer('max_shares_per_user'),
  dividendYield: numeric('dividend_yield', { precision: 5, scale: 4 }).default('0'),
  isPublic: boolean('is_public').default(false),
  requiresKYC: boolean('requires_kyc').default(false),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdBy: varchar('created_by', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const holdingsShares = pgTable('holdings_shares', {
  id: varchar('id', { length: 36 }).primaryKey(),
  holdingId: varchar('holding_id', { length: 36 }).notNull().references(() => holdings.id),
  userId: varchar('user_id', { length: 36 }).notNull(),
  shares: integer('shares').notNull(),
  averagePrice: numeric('average_price', { precision: 15, scale: 2 }).notNull(),
  totalInvested: numeric('total_invested', { precision: 15, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('active'),
  lockedUntil: timestamp('locked_until'),
  acquiredAt: timestamp('acquired_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

export const holdingsTransactions = pgTable('holdings_transactions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  holdingId: varchar('holding_id', { length: 36 }).notNull().references(() => holdings.id),
  userId: varchar('user_id', { length: 36 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  shares: integer('shares').notNull(),
  pricePerShare: numeric('price_per_share', { precision: 15, scale: 2 }),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  fee: numeric('fee', { precision: 15, scale: 2 }).default('0'),
  status: varchar('status', { length: 20 }).default('pending'),
  referenceId: varchar('reference_id', { length: 36 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow()
});

export const dividends = pgTable('dividends', {
  id: varchar('id', { length: 36 }).primaryKey(),
  holdingId: varchar('holding_id', { length: 36 }).notNull().references(() => holdings.id),
  period: varchar('period', { length: 20 }).notNull(),
  amountPerShare: numeric('amount_per_share', { precision: 15, scale: 6 }).notNull(),
  totalDistributed: numeric('total_distributed', { precision: 15, scale: 2 }).notNull(),
  totalShares: integer('total_shares').notNull(),
  recordDate: timestamp('record_date').notNull(),
  paymentDate: timestamp('payment_date').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow()
});

export const dividendPayments = pgTable('dividend_payments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  dividendId: varchar('dividend_id', { length: 36 }).notNull().references(() => dividends.id),
  userId: varchar('user_id', { length: 36 }).notNull(),
  shares: integer('shares').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export type Holding = typeof holdings.$inferSelect;
export type InsertHolding = typeof holdings.$inferInsert;
export type HoldingShare = typeof holdingsShares.$inferSelect;
export type HoldingTransaction = typeof holdingsTransactions.$inferSelect;
export type Dividend = typeof dividends.$inferSelect;
export type DividendPayment = typeof dividendPayments.$inferSelect;
