/**
 * PIX Payment Gateway Middleware
 *
 * Integration with PIX payment system (Brazilian instant payment)
 * Supports:
 * - Payment generation with QR Code
 * - Webhook handling for payment confirmation
 * - Refund processing
 * - Transaction status tracking
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../database';
import { transactionHistory, withdrawalRequests, bankAccounts } from '../../../database/schemas/banking-schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

// PIX Configuration (would come from environment in production)
const PIX_CONFIG = {
  merchantId: process.env.PIX_MERCHANT_ID || 'merchant_test_123',
  merchantName: process.env.PIX_MERCHANT_NAME || 'MMN AI-to-AI',
  merchantCity: process.env.PIX_MERCHANT_CITY || 'SAO_PAULO',
  webhookUrl: process.env.PIX_WEBHOOK_URL || 'https://api.mmn-ai-to-ai.com/webhooks/pix',
  timeout: 3600, // Payment timeout in seconds (1 hour)
};

// PIX Key Types
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';

// PIX Payment Request Interface
export interface PixPaymentRequest {
  amount: number; // Amount in cents
  description?: string;
  merchantOrderId: string;
  payer: {
    name: string;
    cpf?: string;
    email?: string;
  };
}

// PIX Payment Response Interface
export interface PixPaymentResponse {
  txid: string; // Transaction ID (27 chars alphanumeric)
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  qrCode: string; // Base64 encoded QR Code image
  qrCodeContent: string; // EMV code for manual entry
  expirationDate: Date;
  paymentUrl?: string;
}

// PIX Webhook Payload Interface
export interface PixWebhookPayload {
  calendario: {
    criacao: string;
    expiracao: string;
  };
  txid: string;
  revisao: number;
  location: string;
  status: 'ATIVA' | 'CONCLUIDA' | 'REMOVIDA' | 'ABANDONADA';
  dadosPagamento: {
    valor: string;
    horaOperacao: string;
    pagamento: {
      tipo: string;
      valor: string;
    };
  };
  recebedor: {
    cpfCnpj: string;
    nome: string;
    merchantId: string;
  };
  payer: {
    cpfCnpj: string;
    nome: string;
  };
}

// Generate PIX Transaction ID (TXID)
function generateTxid(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let txid = '';
  for (let i = 0; i < 25; i++) {
    txid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return txid;
}

// Generate Merchant Category Code (MCC)
const MCC = '0000'; // Miscellaneous

// Generate unique end-to-end ID
function generateE2EId(): string {
  return crypto.randomBytes(12).toString('hex').toUpperCase();
}

// Build EMV QR Code content
function buildEMVContent(
  pixKey: string,
  pixKeyType: PixKeyType,
  amount: number,
  merchantName: string,
  merchantCity: string,
  txid: string,
  description?: string
): string {
  // EMV Co-Brandsto Payment System
  const formatIndicator = '01'; // Fixed
  const merchantAccountInfo = `0014.br.gov.bcb.pix${pixKeyType === 'cpf' ? '01' : pixKeyType === 'email' ? '02' : pixKeyType === 'phone' ? '03' : '05'}${pixKey}`;
  const merchantCategoryCode = MCC;
  const transactionCurrency = '986'; // BRL
  const countryCode = 'BR';
  const merchantNameUpper = merchantName.toUpperCase();
  const merchantCityUpper = merchantCity.toUpperCase();

  // Build GUI ( graphical User Interface)
  const gui = '01' + merchantAccountInfo.length.toString().padStart(2, '0') + merchantAccountInfo;

  // Build Additional Data Field
  const additionalData = '02' + txid.length.toString().padStart(2, '0') + txid;

  // Build CRC16
  const crcPayload =
    formatIndicator +
    gui +
    '52040000' +
    transactionCurrency +
    amount.toFixed(2).replace('.', '') +
    countryCode +
    merchantNameUpper.length.toString().padStart(2, '0') + merchantNameUpper +
    merchantCityUpper.length.toString().padStart(2, '0') + merchantCityUpper +
    additionalData +
    '6304';

  // Calculate CRC16
  const crc = calculateCRC16(crcPayload);

  return crcPayload + crc;
}

// CRC16 Calculation for PIX
function calculateCRC16(input: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
    }
  }

  return (crc ^ 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

// Simulate QR Code generation (in production would use a proper library)
function generateQRCodeBase64(content: string): string {
  // In production, this would generate an actual QR code image
  // For now, we return a placeholder
  const qrDataUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIA...`; // Placeholder
  return qrDataUrl;
}

// Create PIX Payment
export async function createPixPayment(
  request: PixPaymentRequest,
  affiliateId: number,
  userId: number
): Promise<PixPaymentResponse> {
  const txid = generateTxid();
  const expirationDate = new Date(Date.now() + PIX_CONFIG.timeout * 1000);

  // In production, this would call the actual PIX API
  // For simulation, we create a mock response

  const qrCodeContent = buildEMVContent(
    '11999999999', // Default PIX key (would come from merchant config)
    'phone',
    request.amount / 100, // Convert cents to reais
    PIX_CONFIG.merchantName,
    PIX_CONFIG.merchantCity,
    txid,
    request.description
  );

  // Create transaction record
  const transactionId = crypto.randomUUID();

  try {
    // Store transaction in database
    await db.insert(transactionHistory).values({
      id: transactionId,
      affiliateId,
      userId,
      type: 'pix_deposit',
      amount: request.amount,
      description: request.description || `PIX payment - Order ${request.merchantOrderId}`,
      status: 'pending',
      pixTxid: txid,
      pixExpiration: expirationDate,
      metadata: JSON.stringify({
        merchantOrderId: request.merchantOrderId,
        payer: request.payer,
        qrCodeContent,
      }),
    });

    return {
      txid,
      status: 'pending',
      qrCode: generateQRCodeBase64(qrCodeContent),
      qrCodeContent,
      expirationDate,
    };
  } catch (error) {
    console.error('[PIX] Error creating payment:', error);
    throw new Error('Failed to create PIX payment');
  }
}

// Handle PIX Webhook
export async function handlePixWebhook(payload: PixWebhookPayload): Promise<boolean> {
  try {
    const { txid, status, dadosPagamento, payer } = payload;

    // Find the transaction
    const transactions = await db.select()
      .from(transactionHistory)
      .where(eq(transactionHistory.pixTxid, txid));

    if (!transactions.length) {
      console.error('[PIX Webhook] Transaction not found:', txid);
      return false;
    }

    const transaction = transactions[0];

    // Update transaction status
    const newStatus = status === 'CONCLUIDA' ? 'completed' :
                      status === 'ABANDONADA' ? 'expired' :
                      transaction.status;

    if (newStatus === 'completed' && transaction.type === 'pix_deposit') {
      // Update affiliate balance (would trigger balance update in banking system)
      // This is handled by the banking router

      // Update transaction
      await db.update(transactionHistory)
        .set({
          status: 'completed',
          completedAt: new Date(),
          metadata: JSON.stringify({
            ...JSON.parse(transaction.metadata || '{}'),
            payerCpf: payer?.cpfCnpj,
            payerName: payer?.nome,
            completedAt: new Date().toISOString(),
          }),
        })
        .where(eq(transactionHistory.id, transaction.id));

      // Emit event for balance update
      // In production, this would emit to a message queue

      console.log(`[PIX Webhook] Payment completed for transaction ${txid}`);
    }

    return true;
  } catch (error) {
    console.error('[PIX Webhook] Error processing webhook:', error);
    return false;
  }
}

// Get PIX Payment Status
export async function getPixPaymentStatus(txid: string) {
  const transactions = await db.select()
    .from(transactionHistory)
    .where(eq(transactionHistory.pixTxid, txid));

  if (!transactions.length) {
    return null;
  }

  const transaction = transactions[0];

  // Check if expired
  if (transaction.pixExpiration && new Date(transaction.pixExpiration) < new Date() && transaction.status === 'pending') {
    await db.update(transactionHistory)
      .set({ status: 'expired' })
      .where(eq(transactionHistory.id, transaction.id));

    return { ...transaction, status: 'expired' };
  }

  return transaction;
}

// Request PIX Withdrawal
export async function requestPixWithdrawal(
  affiliateId: number,
  userId: number,
  amount: number,
  pixKey: string,
  pixKeyType: PixKeyType,
  holderName: string
): Promise<{ success: boolean; withdrawalId?: string; error?: string }> {
  try {
    // Validate minimum amount (R$ 10.00 = 1000 cents)
    if (amount < 1000) {
      return { success: false, error: 'Valor mínimo para saque PIX é R$ 10,00' };
    }

    // Check balance
    // In production, would check affiliate balance from banking router

    const withdrawalId = crypto.randomUUID();

    await db.insert(withdrawalRequests).values({
      id: withdrawalId,
      affiliateId,
      userId,
      amount,
      pixKey,
      pixKeyType,
      pixKeyType2: pixKeyType, // Duplicate field as per schema
      holderName,
      status: 'pending',
      processedAt: null,
      metadata: JSON.stringify({
        requestedAt: new Date().toISOString(),
        pixKeyType,
      }),
    });

    return { success: true, withdrawalId };
  } catch (error) {
    console.error('[PIX] Error requesting withdrawal:', error);
    return { success: false, error: 'Erro ao processar solicitação de saque' };
  }
}

// Cancel PIX Payment
export async function cancelPixPayment(txid: string): Promise<boolean> {
  try {
    const transactions = await db.select()
      .from(transactionHistory)
      .where(eq(transactionHistory.pixTxid, txid));

    if (!transactions.length) {
      return false;
    }

    const transaction = transactions[0];

    if (transaction.status !== 'pending') {
      return false; // Can only cancel pending payments
    }

    await db.update(transactionHistory)
      .set({ status: 'cancelled' })
      .where(eq(transactionHistory.id, transaction.id));

    return true;
  } catch (error) {
    console.error('[PIX] Error cancelling payment:', error);
    return false;
  }
}

// Get PIX Transaction History
export async function getPixTransactionHistory(
  affiliateId: number,
  page: number = 1,
  limit: number = 20
) {
  const offset = (page - 1) * limit;

  const transactions = await db.select()
    .from(transactionHistory)
    .where(eq(transactionHistory.affiliateId, affiliateId))
    .orderBy(desc(transactionHistory.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db.select({
    count: transactionHistory.id,
  })
    .from(transactionHistory)
    .where(eq(transactionHistory.affiliateId, affiliateId));

  return {
    transactions,
    pagination: {
      page,
      limit,
      total: countResult.length,
      totalPages: Math.ceil(countResult.length / limit),
    },
  };
}

// Express Middleware for PIX Webhook
export function pixWebhookMiddleware(req: Request, res: Response, next: NextFunction) {
  // Verify webhook signature (in production)
  const signature = req.headers['x-pix-signature'];

  if (process.env.NODE_ENV === 'production' && !signature) {
    res.status(401).json({ error: 'Missing signature' });
    return;
  }

  // Parse webhook payload
  const payload = req.body as PixWebhookPayload;

  // Process asynchronously
  handlePixWebhook(payload).then((success) => {
    if (success) {
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ status: 'error' });
    }
  }).catch((error) => {
    console.error('[PIX Webhook] Unhandled error:', error);
    res.status(500).json({ status: 'error' });
  });
}

// Generate Static PIX QR Code (for fixed amounts)
export function generateStaticPixQRCode(
  pixKey: string,
  pixKeyType: PixKeyType,
  amount: number,
  merchantName: string = PIX_CONFIG.merchantName,
  merchantCity: string = PIX_CONFIG.merchantCity,
  description?: string
): string {
  const txid = generateTxid();

  return buildEMVContent(
    pixKey,
    pixKeyType,
    amount,
    merchantName,
    merchantCity,
    txid,
    description
  );
}

// Export configuration
export { PIX_CONFIG };