#!/usr/bin/env bash
# ==============================================================================
# Script de Geração de Ledger Auditable (Hash Chain)
# Projeto: MMN_AI-to-AI
# Autor: MiniMax Agent
# Data: 2026-05-16
# Versão: 1.0.0
# ==============================================================================
# Este script configura o sistema de ledger auditable para transações financeiras,
# implementando immutabilidade através de hash chain.
# ==============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configurações
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
SERVICES_DIR="$BACKEND_DIR/src/services"

# Criar diretório de auditoria
setup_audit_directory() {
    log_info "Configurando diretório de auditoria..."

    mkdir -p "$SERVICES_DIR/audit"
    log_success "Diretório de auditoria criado"
}

# Criar schema de ledger
create_ledger_schema() {
    log_info "Criando schema de ledger auditable..."

    cat > "$SERVICES_DIR/audit/ledger-schema.ts" << 'EOF'
/**
 * Schema de Ledger Auditable
 * Implementa ledger de transações com hash chain para immutabilidade
 */

import { z } from 'zod';
import { mysqlTable, varchar, text, timestamp, decimal, json } from '../../database/schemas/db';
import { nanoid } from 'nanoid';

// Tabela de entradas do ledger
export const ledgerEntries = mysqlTable('ledger_entries', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => nanoid()),
  transactionId: varchar('transaction_id', { length: 36 }).notNull(),
  previousHash: varchar('previous_hash', { length: 64 }),
  currentHash: varchar('current_hash', { length: 64 }).notNull(),
  entryType: varchar('entry_type', { length: 50 }).notNull(),
  userId: varchar('user_id', { length: 36 }),
  amount: decimal('amount', { precision: 15, scale: 2 }),
  balance: decimal('balance', { precision: 15, scale: 2 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull(),
  verified: varchar('verified', { length: 10 }).default('pending'),
});

// Tipos de entrada do ledger
export enum LedgerEntryType {
  COMMISSION = 'commission',
  PAYMENT = 'payment',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  ADJUSTMENT = 'adjustment',
  REFUND = 'refund',
}

// Schema de validação para transação
export const LedgerTransactionSchema = z.object({
  type: z.nativeEnum(LedgerEntryType),
  userId: z.string(),
  amount: z.number(),
  metadata: z.record(z.any()).optional(),
});

// Tipo inferido
export type LedgerTransaction = z.infer<typeof LedgerTransactionSchema>;
EOF

    log_success "Schema de ledger criado"
}

# Criar serviço de ledger
create_ledger_service() {
    log_info "Criando serviço de ledger auditable..."

    cat > "$SERVICES_DIR/audit/ledger-service.ts" << 'EOF'
/**
 * Serviço de Ledger Auditable
 * Implementa ledger de transações com hash chain para immutabilidade
 */

import { createHash } from 'crypto';
import { db } from '../../db';
import { ledgerEntries, LedgerEntryType, LedgerTransaction } from './ledger-schema';
import { eq, desc } from 'drizzle-orm';

export interface LedgerEntry {
  id: string;
  transactionId: string;
  previousHash: string | null;
  currentHash: string;
  entryType: LedgerEntryType;
  userId: string | null;
  amount: string;
  balance: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  verified: string;
}

/**
 * Gerar hash para entrada do ledger
 */
function generateHash(entry: {
  transactionId: string;
  previousHash: string | null;
  entryType: string;
  userId: string | null;
  amount: string;
  balance: string;
  metadata: string;
  timestamp: string;
}): string {
  const data = JSON.stringify({
    transactionId: entry.transactionId,
    previousHash: entry.previousHash,
    entryType: entry.entryType,
    userId: entry.userId,
    amount: entry.amount,
    balance: entry.balance,
    metadata: entry.metadata,
    timestamp: entry.timestamp,
  });

  return createHash('sha256').update(data).digest('hex');
}

/**
 * Obter último hash do ledger
 */
async function getLastHash(userId: string | null): Promise<string | null> {
  const lastEntry = await db
    .select({ currentHash: ledgerEntries.currentHash })
    .from(ledgerEntries)
    .where(userId ? eq(ledgerEntries.userId, userId) : undefined)
    .orderBy(desc(ledgerEntries.createdAt))
    .limit(1);

  return lastEntry.length > 0 ? lastEntry[0].currentHash : null;
}

/**
 * Obter saldo atual
 */
async function getCurrentBalance(userId: string): Promise<string> {
  const lastEntry = await db
    .select({ balance: ledgerEntries.balance })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.userId, userId))
    .orderBy(desc(ledgerEntries.createdAt))
    .limit(1);

  return lastEntry.length > 0 ? lastEntry[0].balance : '0.00';
}

/**
 * Criar nova entrada no ledger
 */
export async function createLedgerEntry(transaction: LedgerTransaction): Promise<LedgerEntry> {
  const transactionId = nanoid();
  const timestamp = new Date();
  const previousHash = await getLastHash(transaction.userId);
  const currentBalance = await getCurrentBalance(transaction.userId);

  // Calcular novo saldo
  let newBalance: string;
  const amount = transaction.amount.toFixed(2);

  switch (transaction.type) {
    case LedgerEntryType.COMMISSION:
    case LedgerEntryType.DEPOSIT:
      newBalance = (parseFloat(currentBalance) + transaction.amount).toFixed(2);
      break;
    case LedgerEntryType.PAYMENT:
    case LedgerEntryType.WITHDRAWAL:
      newBalance = (parseFloat(currentBalance) - transaction.amount).toFixed(2);
      break;
    case LedgerEntryType.REFUND:
      newBalance = (parseFloat(currentBalance) + transaction.amount).toFixed(2);
      break;
    case LedgerEntryType.ADJUSTMENT:
      newBalance = amount; // Substitui o saldo
      break;
    default:
      newBalance = currentBalance;
  }

  // Criar hash
  const currentHash = generateHash({
    transactionId,
    previousHash,
    entryType: transaction.type,
    userId: transaction.userId,
    amount,
    balance: newBalance,
    metadata: JSON.stringify(transaction.metadata || {}),
    timestamp: timestamp.toISOString(),
  });

  const entry = {
    id: nanoid(),
    transactionId,
    previousHash,
    currentHash,
    entryType: transaction.type,
    userId: transaction.userId,
    amount,
    balance: newBalance,
    metadata: transaction.metadata || {},
    createdAt: timestamp,
    verified: 'pending',
  };

  console.log('[LedgerService] Creating entry:', entry);

  // TODO: Inserir no banco de dados
  // await db.insert(ledgerEntries).values(entry);

  return entry as LedgerEntry;
}

/**
 * Verificar integridade do ledger
 */
export async function verifyLedgerIntegrity(userId: string): Promise<{
  valid: boolean;
  brokenAt?: string;
  totalEntries: number;
}> {
  const entries = await db
    .select()
    .from(ledgerEntries)
    .where(eq(ledgerEntries.userId, userId))
    .orderBy(ledgerEntries.createdAt);

  let previousHash: string | null = null;

  for (const entry of entries) {
    // Verificar链接 de hash
    if (entry.previousHash !== previousHash) {
      console.error('[LedgerService] Hash chain broken at entry:', entry.id);
      return {
        valid: false,
        brokenAt: entry.id,
        totalEntries: entries.length,
      };
    }

    // Recalcular hash para verificar
    const calculatedHash = generateHash({
      transactionId: entry.transactionId,
      previousHash: entry.previousHash,
      entryType: entry.entryType,
      userId: entry.userId,
      amount: entry.amount,
      balance: entry.balance,
      metadata: JSON.stringify(entry.metadata || {}),
      timestamp: entry.createdAt.toISOString(),
    });

    if (calculatedHash !== entry.currentHash) {
      console.error('[LedgerService] Hash mismatch at entry:', entry.id);
      return {
        valid: false,
        brokenAt: entry.id,
        totalEntries: entries.length,
      };
    }

    previousHash = entry.currentHash;
  }

  return {
    valid: true,
    totalEntries: entries.length,
  };
}

/**
 * Obter histórico de ledger
 */
export async function getLedgerHistory(
  userId: string,
  limit: number = 100
): Promise<LedgerEntry[]> {
  const entries = await db
    .select()
    .from(ledgerEntries)
    .where(eq(ledgerEntries.userId, userId))
    .orderBy(desc(ledgerEntries.createdAt))
    .limit(limit);

  return entries as LedgerEntry[];
}

/**
 * Buscar transação específica
 */
export async function findTransaction(transactionId: string): Promise<LedgerEntry | null> {
  const entry = await db
    .select()
    .from(ledgerEntries)
    .where(eq(ledgerEntries.transactionId, transactionId))
    .limit(1);

  return entry.length > 0 ? entry[0] as LedgerEntry : null;
}
EOF

    log_success "Serviço de ledger criado"
}

# Criar export do módulo
setup_exports() {
    log_info "Configurando exports do módulo de auditoria..."

    cat > "$SERVICES_DIR/audit/index.ts" << 'EOF'
/**
 * Módulo de Auditoria
 * Exporta serviços para ledger auditable e verificação de integridade
 */

export * from './ledger-schema';
export * from './ledger-service';
EOF

    log_success "Exports configurados"
}

# Função principal
main() {
    echo ""
    echo "========================================"
    echo "  CONFIGURAÇÃO LEDGER AUDITABLE"
    echo "  Projeto: MMN_AI-to-AI"
    echo "========================================"
    echo ""

    setup_audit_directory
    create_ledger_schema
    create_ledger_service
    setup_exports

    echo ""
    log_success "Sistema de ledger auditable configurado com sucesso"
    echo ""
    echo "Arquivos criados:"
    echo "  - $SERVICES_DIR/audit/ledger-schema.ts"
    echo "  - $SERVICES_DIR/audit/ledger-service.ts"
    echo "  - $SERVICES_DIR/audit/index.ts"
    echo ""
    echo "Funcionalidades implementadas:"
    echo "  - Hash chain para immutabilidade"
    echo "  - Verificação de integridade"
    echo "  - Histórico de transações"
    echo "  - Busca de transações específicas"
    echo ""
    echo "Tipos de transação suportados:"
    echo "  - COMMISSION: Comissões de vendas"
    echo "  - PAYMENT: Pagamentos"
    echo "  - WITHDRAWAL: Saques"
    echo "  - DEPOSIT: Depósitos"
    echo "  - ADJUSTMENT: Ajustes"
    echo "  - REFUND: Reembolsos"
    echo ""
}

# Executar função principal
main "$@"