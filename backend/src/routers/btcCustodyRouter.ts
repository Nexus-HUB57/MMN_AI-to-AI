/**
 * btcCustodyRouter (Onda 19) — Custódia Binance + Aportes
 * ---------------------------------------------------------------------------
 * Regras de negócio:
 *  - Endereço de custódia único e público (regulado, custodiado pela Binance)
 *  - Termos: congelamento 90 dias após aporte + D+5 para retiradas
 *  - Fluxo: afiliado solicita aporte -> sistema emite endereço -> afiliado envia
 *    e informa o hash -> sistema valida e credita em btc_deposits +
 *    histórico bitcoin
 *  - Segurança: nenhuma custódia real de chaves privadas. Sistema é ledger.
 */
import { z } from "zod";
import { Pool } from "pg";
import { publicProcedure, router, protectedProcedure } from "../config/trpc";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Endereço público de custódia Binance (idealmente vem de env var).
// Nunca commit chave privada — só endereço público de deposit.
const BINANCE_CUSTODY_ADDRESS =
  process.env.BINANCE_CUSTODY_ADDRESS ||
  "bc1qnexus0custody0placeholder0change0in0production";

const CUSTODY_TERMS = {
  freezeDays: 90,          // Congelamento 90 dias
  withdrawDelayDays: 5,    // D+5 após solicitação
  minDepositBrl: 50,       // Mínimo R$ 50 por aporte
  provider: "Binance",
  regulated: true,
  network: "BTC (Bitcoin Mainnet)",
};

export const btcCustodyRouter = router({
  /**
   * Retorna endereço + termos (public — para exibir no /payments)
   */
  getCustodyInfo: publicProcedure.query(async () => {
    return {
      ok: true,
      address: BINANCE_CUSTODY_ADDRESS,
      network: CUSTODY_TERMS.network,
      provider: CUSTODY_TERMS.provider,
      regulated: CUSTODY_TERMS.regulated,
      terms: {
        freezeDays: CUSTODY_TERMS.freezeDays,
        withdrawDelayDays: CUSTODY_TERMS.withdrawDelayDays,
        minDepositBrl: CUSTODY_TERMS.minDepositBrl,
      },
      disclaimer:
        "Custódia integral pela Binance (parceira regulada). Nenhum dado enviado a serviços externos. " +
        `Aportes são congelados por ${CUSTODY_TERMS.freezeDays} dias e retiradas processadas em D+${CUSTODY_TERMS.withdrawDelayDays}.`,
    };
  }),

  /**
   * Registra intenção de aporte (gera slot aguardando hash do usuário).
   * (public com userId opcional para desbloquear UI)
   */
  createDepositIntent: publicProcedure
    .input(z.object({
      userId: z.number().int().positive().optional(),
      amountBrlCents: z.number().int().min(5000), // mínimo R$ 50
      amountBtc: z.number().positive(),
      btcQuoteBrl: z.number().positive(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = input.userId ?? (ctx as any)?.user?.id;
      if (!userId) {
        return { ok: false, error: "user_required" };
      }
      try {
        const res = await pool.query(
          `INSERT INTO btc_deposits
             (user_id, amount_brl_cents, amount_btc, btc_quote_brl,
              custody_address, status, network, created_at)
           VALUES ($1, $2, $3, $4, $5, 'awaiting_hash', $6, NOW())
           RETURNING id, custody_address, created_at`,
          [
            userId,
            input.amountBrlCents,
            input.amountBtc,
            input.btcQuoteBrl,
            BINANCE_CUSTODY_ADDRESS,
            CUSTODY_TERMS.network,
          ]
        );
        return {
          ok: true,
          depositId: res.rows[0].id,
          address: res.rows[0].custody_address,
          network: CUSTODY_TERMS.network,
          expiresIn: "24h",
          instructions:
            "Envie o valor exato para o endereço acima usando sua carteira BTC. " +
            "Assim que a transação for confirmada na rede, informe o hash abaixo para creditar seu saldo.",
        };
      } catch (e: any) {
        return { ok: false, error: e?.message || "insert_failed" };
      }
    }),

  /**
   * Afiliado informa hash de envio para validação.
   */
  submitDepositHash: publicProcedure
    .input(z.object({
      depositId: z.number().int().positive(),
      txHash: z.string().min(60).max(80),  // BTC txids ~64 hex
      userId: z.number().int().positive().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = input.userId ?? (ctx as any)?.user?.id;
      const cleanHash = input.txHash.trim().replace(/^0x/i, "");
      if (!/^[a-fA-F0-9]{60,72}$/.test(cleanHash)) {
        return { ok: false, error: "invalid_hash_format" };
      }
      try {
        // Update deposit com hash + move para 'pending_confirmation'
        const upd = await pool.query(
          `UPDATE btc_deposits
           SET tx_hash = $1, status = 'pending_confirmation',
               hash_submitted_at = NOW()
           WHERE id = $2 AND ($3::int IS NULL OR user_id = $3)
             AND status IN ('awaiting_hash','pending_confirmation')
           RETURNING id, status, amount_btc, custody_address`,
          [cleanHash, input.depositId, userId ?? null]
        );
        if (upd.rows.length === 0) {
          return { ok: false, error: "deposit_not_found_or_ownership_mismatch" };
        }
        return {
          ok: true,
          depositId: input.depositId,
          txHash: cleanHash,
          status: "pending_confirmation",
          note:
            "Hash registrado. Aguarde confirmação on-chain (média 30-60 min). " +
            "Após confirmação automática pelo sistema, o valor será creditado no seu Histórico Bitcoin.",
        };
      } catch (e: any) {
        return { ok: false, error: e?.message };
      }
    }),

  /**
   * Histórico de aportes (public com userId).
   */
  listMyDeposits: publicProcedure
    .input(z.object({
      userId: z.number().int().positive().optional(),
      limit: z.number().int().min(1).max(100).default(20),
    }).optional())
    .query(async ({ input, ctx }) => {
      const userId = input?.userId ?? (ctx as any)?.user?.id;
      if (!userId) {
        return { ok: false, deposits: [], summary: null };
      }
      const limit = input?.limit ?? 20;
      try {
        const res = await pool.query(
          `SELECT id, amount_brl_cents, amount_btc, btc_quote_brl,
                  custody_address, tx_hash, status, network,
                  created_at, hash_submitted_at, confirmed_at
           FROM btc_deposits
           WHERE user_id = $1
           ORDER BY created_at DESC LIMIT $2`,
          [userId, limit]
        );

        const summary = await pool.query(
          `SELECT
             COALESCE(SUM(amount_brl_cents), 0) AS total_brl_cents,
             COALESCE(SUM(amount_btc), 0) AS total_btc,
             COUNT(*) AS total_deposits,
             COUNT(*) FILTER (WHERE status='confirmed') AS confirmed_count,
             COUNT(*) FILTER (WHERE status='pending_confirmation') AS pending_count,
             COUNT(*) FILTER (WHERE status='awaiting_hash') AS awaiting_count
           FROM btc_deposits WHERE user_id = $1`,
          [userId]
        );

        return {
          ok: true,
          deposits: res.rows,
          summary: {
            totalBrlCents: Number(summary.rows[0]?.total_brl_cents || 0),
            totalBtc: Number(summary.rows[0]?.total_btc || 0),
            totalDeposits: Number(summary.rows[0]?.total_deposits || 0),
            confirmedCount: Number(summary.rows[0]?.confirmed_count || 0),
            pendingCount: Number(summary.rows[0]?.pending_count || 0),
            awaitingCount: Number(summary.rows[0]?.awaiting_count || 0),
          },
        };
      } catch (e: any) {
        return { ok: true, deposits: [], summary: null };
      }
    }),
});
