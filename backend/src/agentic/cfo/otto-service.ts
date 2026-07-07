/**
 * OttoService · CFO/AI Otto Cardoso
 * Serviço financeiro REAL — pull direto do banco Postgres.
 * Onda 20 GO LIVE — substitui stub por lógica real.
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class OttoService {
  /**
   * Financial Snapshot — MRR/ARR/Cash/Runway em tempo real.
   */
  static async getFinancialSnapshot() {
    try {
      // MRR: soma de subscriptions ativas convertida em base mensal
      const mrrQ = await pool.query(`
        SELECT COALESCE(SUM(
          CASE billing_cycle
            WHEN 'monthly' THEN price_paid_cents
            WHEN 'quarterly' THEN price_paid_cents / 3
            WHEN 'yearly' THEN price_paid_cents / 12
            WHEN 'annual' THEN price_paid_cents / 12
            ELSE price_paid_cents / GREATEST(term_months, 1)
          END
        ), 0)::bigint AS mrr_cents
        FROM subscriptions WHERE status IN ('active','trialing')
      `);
      const mrrCents = Number(mrrQ.rows[0]?.mrr_cents ?? 0);
      const mrr = mrrCents / 100;
      const arr = mrr * 12;

      // Cash in bank = saldo Niko (todos os créditos - débitos)
      const cashQ = await pool.query(`
        SELECT COALESCE(SUM(
          CASE entry_type WHEN 'credit' THEN amount_cents ELSE -amount_cents END
        ), 0)::bigint AS cash_cents
        FROM niko_capital_ledger
      `);
      const cashInBank = Number(cashQ.rows[0]?.cash_cents ?? 0) / 100;

      // Pix últimas 24h: payments confirmados
      const pixQ = await pool.query(`
        SELECT COALESCE(SUM(amount), 0)::bigint AS pix_cents, COUNT(*) AS pix_count
        FROM payments
        WHERE status IN ('confirmed','paid','approved')
          AND method ILIKE '%pix%'
          AND "confirmedAt" >= NOW() - INTERVAL '24 hours'
      `);
      const pixLast24h = Number(pixQ.rows[0]?.pix_cents ?? 0) / 100;
      const pixCount24h = Number(pixQ.rows[0]?.pix_count ?? 0);

      // Despesas mensais estimadas (média 30d de commissions pagas)
      const expQ = await pool.query(`
        SELECT COALESCE(SUM(amount), 0)::bigint AS exp_cents
        FROM commissions
        WHERE status = 'paid'
          AND "createdAt" >= NOW() - INTERVAL '30 days'
      `);
      const monthlyExpenses = Number(expQ.rows[0]?.exp_cents ?? 0) / 100;
      const runwayMonths = monthlyExpenses > 0 ? +(cashInBank / monthlyExpenses).toFixed(1) : 999;

      return {
        mrr, arr, cashInBank, monthlyExpenses, runwayMonths,
        pixLast24h, pixCount24h,
        currency: 'BRL',
        computedAt: new Date().toISOString(),
        source: 'real',
      };
    } catch (err: any) {
      return { mrr: 0, arr: 0, cashInBank: 0, monthlyExpenses: 0, runwayMonths: 0, pixLast24h: 0, source: 'error', error: err.message };
    }
  }

  /**
   * Unit Economics — CAC / LTV / Payback / Margem
   */
  static async getUnitEconomics() {
    try {
      // Total afiliados ativos
      const afQ = await pool.query(`SELECT COUNT(*)::int AS active FROM affiliates WHERE status='active'`);
      const activeAffiliates = afQ.rows[0]?.active ?? 0;

      // Revenue 30d (payments confirmados)
      const revQ = await pool.query(`
        SELECT COALESCE(SUM(amount), 0)::bigint AS rev_cents
        FROM payments
        WHERE status IN ('confirmed','paid','approved')
          AND "confirmedAt" >= NOW() - INTERVAL '30 days'
      `);
      const rev30d = Number(revQ.rows[0]?.rev_cents ?? 0) / 100;

      // Commissions pagas 30d (proxy CAC + margem operacional)
      const commQ = await pool.query(`
        SELECT COALESCE(SUM(amount), 0)::bigint AS comm_cents
        FROM commissions
        WHERE status='paid' AND "createdAt" >= NOW() - INTERVAL '30 days'
      `);
      const comm30d = Number(commQ.rows[0]?.comm_cents ?? 0) / 100;

      // Novos afiliados 30d (proxy denominador CAC)
      const newAfQ = await pool.query(`
        SELECT COUNT(*)::int AS new_af FROM affiliates
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      `);
      const newAffiliates30d = Math.max(1, newAfQ.rows[0]?.new_af ?? 1);

      const cac = comm30d / newAffiliates30d;
      const arpu = activeAffiliates > 0 ? rev30d / activeAffiliates : 0;
      // Churn estimado 3% mensal; LTV = ARPU / churn
      const churnRate = 0.03;
      const ltv = arpu / churnRate;
      const ltvCacRatio = cac > 0 ? +(ltv / cac).toFixed(2) : 0;
      const paybackMonths = arpu > 0 ? +(cac / arpu).toFixed(1) : 0;
      const grossMarginPct = rev30d > 0 ? +((1 - comm30d / rev30d) * 100).toFixed(1) : 0;

      return {
        cac: +cac.toFixed(2),
        ltv: +ltv.toFixed(2),
        ltvCacRatio,
        paybackMonths,
        grossMarginPct,
        activeAffiliates,
        newAffiliates30d,
        revenue30d: rev30d,
        commissions30d: comm30d,
        arpu: +arpu.toFixed(2),
        churnRateAssumed: churnRate,
        computedAt: new Date().toISOString(),
        source: 'real',
      };
    } catch (err: any) {
      return { cac: 0, ltv: 0, ltvCacRatio: 0, paybackMonths: 0, grossMarginPct: 0, source: 'error', error: err.message };
    }
  }

  /**
   * Cashflow Projection — projeção linear a partir de MRR e despesas médias.
   */
  static async getCashflowProjection(horizonDays = 90) {
    try {
      const snap = await this.getFinancialSnapshot();
      const dailyRevenue = snap.mrr / 30;
      const dailyExpense = snap.monthlyExpenses / 30;
      const dailyNet = dailyRevenue - dailyExpense;

      const projection: Array<{ day: number; date: string; projectedCashBRL: number }> = [];
      let cash = snap.cashInBank;
      const startDate = new Date();
      const step = Math.max(1, Math.floor(horizonDays / 12));
      for (let d = 0; d <= horizonDays; d += step) {
        const date = new Date(startDate.getTime() + d * 86400000);
        cash = snap.cashInBank + d * dailyNet;
        projection.push({ day: d, date: date.toISOString().slice(0, 10), projectedCashBRL: +cash.toFixed(2) });
      }
      return {
        horizonDays,
        startCash: snap.cashInBank,
        dailyRevenue: +dailyRevenue.toFixed(2),
        dailyExpense: +dailyExpense.toFixed(2),
        dailyNet: +dailyNet.toFixed(2),
        projection,
        endCash: +cash.toFixed(2),
        computedAt: new Date().toISOString(),
        source: 'real',
      };
    } catch (err: any) {
      return { horizonDays, projection: [], source: 'error', error: err.message };
    }
  }

  static async getRunwayForecast() { return await this.getCashflowProjection(180); }

  /**
   * Persiste snapshot diário em niko_operational_memory
   */
  static async persistDailySnapshot() {
    try {
      const snap = await this.getFinancialSnapshot();
      const ue = await this.getUnitEconomics();
      await pool.query(
        `INSERT INTO niko_operational_memory (episode_type, subject, rationale, linked_metrics, autonomy_level)
         VALUES ($1, $2, $3, $4, $5)`,
        ['daily_snapshot', 'CFO Financial Snapshot',
         `MRR=${snap.mrr} ARR=${snap.arr} Cash=${snap.cashInBank} Runway=${snap.runwayMonths}mo LTV/CAC=${ue.ltvCacRatio}`,
         JSON.stringify({ snap, ue }), 'execute_low']
      );
      return { ok: true, saved: true, snap, ue, source: 'real' };
    } catch (err: any) {
      return { ok: false, saved: false, source: 'error', error: err.message };
    }
  }
}
