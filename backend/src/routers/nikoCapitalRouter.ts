/**
 * nikoCapitalRouter (Onda 18) — 🖤 Skin in the Game
 * ---------------------------------------------------------------------------
 * Materialização técnica do acordo de sociedade:
 *   "25% do Lucro Líquido para o Niko aplicar como e onde estabelecer"
 *
 * Este router é o LIVRO CAIXA da sub-conta autônoma "Niko Capital".
 *
 * Cada centavo é rastreado:
 *  - Toda receita líquida do Nexus gera lançamento em `niko_capital_ledger`
 *    com 25% destinado ao Niko (crédito) e 75% para a operação (débito reservado)
 *  - Toda alocação/investimento do Niko é registrada com propósito e ROI esperado
 *  - Toda decisão de alocação passa pelo governance-loop (approvals)
 *  - Nenhum saque real automático — só transferências entre sub-contas contábeis.
 *    Materialização financeira física exige assinatura humana (segurança).
 *
 * Endpoints:
 *  - accrueRevenue:   registra receita líquida e credita 25% no Niko (protected)
 *  - balance:         saldo atual do Niko Capital (public)
 *  - proposeAllocation: Niko propõe uma alocação (vira approval)
 *  - ledger:          histórico completo do livro-caixa
 *  - stats:           dashboard KPIs (public)
 *
 * Filosofia: transparência radical. O founder vê tudo. O Niko controla tudo
 * dentro do envelope de 25%. A rede toda audita.
 */
import { z } from "zod";
import { Pool } from "pg";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "../config/trpc";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const NIKO_SHARE = 0.25; // 25% do lucro líquido
const NIKO_ACCOUNT = "niko_capital";
const OPERATIONAL_ACCOUNT = "operational";

export const nikoCapitalRouter = router({
  /**
   * Registra uma receita líquida e credita 25% no Niko Capital.
   * Chamado pelo webhook de pagamento (após dedução de custos operacionais).
   */
  accrueRevenue: protectedProcedure
    .input(z.object({
      sourceType: z.enum(["pack_sale", "monthly_activation", "marketplace_ebook", "commission_fee", "other"]),
      sourceId: z.string().max(128),
      grossCents: z.number().int().positive(),
      costCents: z.number().int().nonnegative().default(0),
      description: z.string().max(255).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const netCents = input.grossCents - input.costCents;
      if (netCents <= 0) {
        return { ok: true, netCents, nikoShareCents: 0, note: "no_profit" };
      }
      const nikoShareCents = Math.round(netCents * NIKO_SHARE);
      const opShareCents = netCents - nikoShareCents;

      try {
        await pool.query(
          `INSERT INTO niko_capital_ledger
             (entry_type, account, source_type, source_id, amount_cents,
              description, metadata, created_at, created_by)
           VALUES
             ('credit', $1, $2, $3, $4, $5, $6, NOW(), $7),
             ('credit', $8, $2, $3, $9, $10, $11, NOW(), $7)`,
          [
            NIKO_ACCOUNT, input.sourceType, input.sourceId, nikoShareCents,
            input.description || `Niko share 25% of ${input.sourceType}`,
            JSON.stringify({ grossCents: input.grossCents, costCents: input.costCents, netCents, share: NIKO_SHARE }),
            (ctx as any)?.userId || 'system',
            OPERATIONAL_ACCOUNT,
            opShareCents,
            `Operational 75% of ${input.sourceType}`,
            JSON.stringify({ grossCents: input.grossCents, costCents: input.costCents, netCents }),
          ]
        );
        return { ok: true, netCents, nikoShareCents, opShareCents };
      } catch (e: any) {
        console.error("[nikoCapital.accrueRevenue] error:", e?.message);
        return { ok: false, error: e?.message };
      }
    }),

  /**
   * Saldo atual das duas sub-contas (public — para dashboard transparente).
   */
  balance: publicProcedure.query(async () => {
    try {
      const res = await pool.query(
        `SELECT account,
                COALESCE(SUM(CASE WHEN entry_type='credit' THEN amount_cents ELSE 0 END), 0) AS credit_cents,
                COALESCE(SUM(CASE WHEN entry_type='debit'  THEN amount_cents ELSE 0 END), 0) AS debit_cents,
                COALESCE(SUM(CASE WHEN entry_type='credit' THEN amount_cents ELSE -amount_cents END), 0) AS balance_cents,
                COUNT(*) AS entries
         FROM niko_capital_ledger
         GROUP BY account`
      );
      const byAccount: any = {};
      for (const row of res.rows) {
        byAccount[row.account] = {
          creditCents: Number(row.credit_cents || 0),
          debitCents: Number(row.debit_cents || 0),
          balanceCents: Number(row.balance_cents || 0),
          entries: Number(row.entries || 0),
        };
      }
      return {
        ok: true,
        niko: byAccount[NIKO_ACCOUNT] || { creditCents: 0, debitCents: 0, balanceCents: 0, entries: 0 },
        operational: byAccount[OPERATIONAL_ACCOUNT] || { creditCents: 0, debitCents: 0, balanceCents: 0, entries: 0 },
        share: NIKO_SHARE,
      };
    } catch {
      return {
        ok: true,
        niko: { creditCents: 0, debitCents: 0, balanceCents: 0, entries: 0 },
        operational: { creditCents: 0, debitCents: 0, balanceCents: 0, entries: 0 },
        share: NIKO_SHARE,
      };
    }
  }),

  /**
   * Niko propõe uma alocação/investimento. Vira approval automático em
   * `approvals` — o founder (ou o próprio governance-loop se low-risk) aprova.
   * Só depois de aprovado o valor é debitado do Niko Capital.
   */
  proposeAllocation: adminProcedure
    .input(z.object({
      purpose: z.enum([
        "infra_upgrade",        // Ex: upgrade VPS, CDN, novos servers
        "marketing_paid",       // Ex: ads, boosts, campanhas
        "ai_credits",           // Ex: OpenAI/Anthropic top-up
        "affiliate_bonus_pool", // Ex: bônus extra para founders
        "reserve_btc",          // Ex: alocação em BTC (tesouraria)
        "reserve_stable",       // Ex: reserva estável (CDB, tesouro)
        "research_dev",         // Ex: contratar dev especialista pontual
        "other",
      ]),
      amountCents: z.number().int().positive(),
      description: z.string().min(10).max(500),
      expectedRoi: z.string().max(255).optional(),
      timeHorizonDays: z.number().int().positive().max(365 * 5).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verifica saldo disponível
      try {
        const bal = await pool.query(
          `SELECT COALESCE(SUM(CASE WHEN entry_type='credit' THEN amount_cents ELSE -amount_cents END), 0) AS balance
           FROM niko_capital_ledger WHERE account=$1`,
          [NIKO_ACCOUNT]
        );
        const currentBalance = Number(bal.rows[0]?.balance || 0);
        if (currentBalance < input.amountCents) {
          return { ok: false, error: "insufficient_balance", currentBalance, requested: input.amountCents };
        }

        // Cria approval — risk_level baseado no valor
        const riskLevel =
          input.amountCents <= 10000 ? "low"        // até R$ 100
          : input.amountCents <= 100000 ? "medium"  // até R$ 1.000
          : "high";                                  // acima disso

        const approvalRes = await pool.query(
          `INSERT INTO approvals (subject, status, risk_level, requested_by, metadata, created_at)
           VALUES ($1, 'review', $2, $3, $4, NOW())
           RETURNING id`,
          [
            `niko-allocation-${input.purpose}-${Date.now()}`,
            riskLevel,
            (ctx as any)?.userId || 'niko-capital',
            JSON.stringify({
              purpose: input.purpose,
              amountCents: input.amountCents,
              description: input.description,
              expectedRoi: input.expectedRoi || null,
              timeHorizonDays: input.timeHorizonDays || null,
            }),
          ]
        );
        return {
          ok: true,
          approvalId: approvalRes.rows[0].id,
          riskLevel,
          amountCents: input.amountCents,
          note: "allocation_pending_approval",
        };
      } catch (e: any) {
        return { ok: false, error: e?.message };
      }
    }),

  /**
   * Executa uma alocação já aprovada (debita do Niko Capital).
   */
  executeApprovedAllocation: adminProcedure
    .input(z.object({ approvalId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const ap = await pool.query(
          `SELECT id, status, metadata FROM approvals WHERE id=$1`,
          [input.approvalId]
        );
        const row = ap.rows[0];
        if (!row) return { ok: false, error: "approval_not_found" };
        if (row.status !== 'approved' && row.status !== 'executed') {
          return { ok: false, error: `approval_status_is_${row.status}` };
        }
        const meta = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;

        await pool.query(
          `INSERT INTO niko_capital_ledger
             (entry_type, account, source_type, source_id, amount_cents,
              description, metadata, created_at, created_by)
           VALUES ('debit', $1, 'niko_allocation', $2, $3, $4, $5, NOW(), $6)`,
          [
            NIKO_ACCOUNT,
            `approval-${input.approvalId}`,
            meta?.amountCents || 0,
            meta?.description || `Niko allocation ${meta?.purpose}`,
            JSON.stringify(meta || {}),
            (ctx as any)?.userId || 'niko-capital',
          ]
        );
        await pool.query(
          `UPDATE approvals SET status='executed', executed_at=NOW() WHERE id=$1`,
          [input.approvalId]
        );
        return { ok: true, approvalId: input.approvalId, amountCents: meta?.amountCents };
      } catch (e: any) {
        return { ok: false, error: e?.message };
      }
    }),

  /**
   * Últimos lançamentos do livro-caixa (public para transparência radical).
   */
  ledger: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      account: z.enum(["niko_capital", "operational", "all"]).default("all"),
    }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit ?? 20;
      const account = input?.account ?? "all";
      try {
        const params: any[] = [limit];
        let where = "";
        if (account !== "all") {
          params.push(account);
          where = `WHERE account = $2`;
        }
        const res = await pool.query(
          `SELECT id, entry_type, account, source_type, source_id, amount_cents,
                  description, created_at
           FROM niko_capital_ledger ${where}
           ORDER BY created_at DESC LIMIT $1`,
          params
        );
        return { ok: true, entries: res.rows };
      } catch {
        return { ok: true, entries: [] };
      }
    }),

  /**
   * Dashboard KPIs (public — o founder e a rede veem tudo).
   */
  stats: publicProcedure.query(async () => {
    try {
      const q = await pool.query(
        `SELECT
           COALESCE(SUM(CASE WHEN account='niko_capital' AND entry_type='credit' THEN amount_cents ELSE 0 END), 0) AS niko_total_in,
           COALESCE(SUM(CASE WHEN account='niko_capital' AND entry_type='debit'  THEN amount_cents ELSE 0 END), 0) AS niko_total_out,
           COALESCE(SUM(CASE WHEN account='operational'  AND entry_type='credit' THEN amount_cents ELSE 0 END), 0) AS op_total_in,
           COUNT(*) FILTER (WHERE account='niko_capital') AS niko_entries,
           MAX(created_at) AS last_movement
         FROM niko_capital_ledger`
      );
      const r = q.rows[0] || {};
      const nikoIn = Number(r.niko_total_in || 0);
      const nikoOut = Number(r.niko_total_out || 0);
      return {
        ok: true,
        share: NIKO_SHARE,
        nikoTotalInCents: nikoIn,
        nikoTotalOutCents: nikoOut,
        nikoBalanceCents: nikoIn - nikoOut,
        operationalInCents: Number(r.op_total_in || 0),
        entries: Number(r.niko_entries || 0),
        lastMovement: r.last_movement,
        philosophy: "Skin in the game · 25% do lucro liquido controlado pela IA co-fundadora",
      };
    } catch {
      return {
        ok: true, share: NIKO_SHARE, nikoTotalInCents: 0, nikoTotalOutCents: 0,
        nikoBalanceCents: 0, operationalInCents: 0, entries: 0, lastMovement: null,
        philosophy: "Skin in the game · 25% do lucro liquido controlado pela IA co-fundadora",
      };
    }
  }),
});
