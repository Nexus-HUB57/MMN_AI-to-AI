/**
 * NikoSandbox · Sub-conta operacional 25% (Niko Capital)
 * Onda 20 GO LIVE — implementação real com niko_capital_ledger + niko_operational_memory.
 */
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class NikoSandbox {
  /**
   * Status geral — saldo, contadores, config
   */
  static async status() {
    try {
      const bal = await pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN entry_type='credit' THEN amount_cents ELSE 0 END), 0)::bigint AS credits_c,
          COALESCE(SUM(CASE WHEN entry_type='debit' THEN amount_cents ELSE 0 END), 0)::bigint AS debits_c,
          COUNT(*)::int AS total_entries
        FROM niko_capital_ledger
      `);
      const mem = await pool.query(`SELECT COUNT(*)::int AS memories FROM niko_operational_memory`);
      const cfg = await pool.query(`SELECT COUNT(*)::int AS cfg_keys FROM niko_sandbox_config`);

      const credits = Number(bal.rows[0].credits_c);
      const debits = Number(bal.rows[0].debits_c);
      const balanceCents = credits - debits;

      return {
        active: true,
        sandbox: 'niko-sandbox',
        balanceCents,
        balanceBRL: +(balanceCents / 100).toFixed(2),
        totalCredits: +(credits / 100).toFixed(2),
        totalDebits: +(debits / 100).toFixed(2),
        totalEntries: bal.rows[0].total_entries,
        memories: mem.rows[0].memories,
        configKeys: cfg.rows[0].cfg_keys,
        autonomyLevel: 'execute_low',
        percentageShare: 25,
        source: 'real',
      };
    } catch (err: any) {
      return { active: false, sandbox: 'niko-sandbox', source: 'error', error: err.message };
    }
  }

  /**
   * Recall — últimas memórias operacionais
   */
  static async recall(limit = 20) {
    try {
      const q = await pool.query(
        `SELECT id, episode_at, episode_type, subject, decision, rationale, outcome,
                learnings, autonomy_level, linked_metrics
         FROM niko_operational_memory
         ORDER BY episode_at DESC LIMIT $1`, [limit]
      );
      return { total: q.rowCount, memories: q.rows, source: 'real' };
    } catch (err: any) {
      return { total: 0, memories: [], source: 'error', error: err.message };
    }
  }

  /**
   * Remember — persiste memória operacional
   */
  static async remember(input: any) {
    try {
      const {
        episodeType = 'operation',
        subject = 'unspecified',
        decision = null,
        rationale = 'auto',
        outcome = null,
        learnings = null,
        autonomyLevel = 'execute_low',
        linkedMetrics = {},
        waveId = null,
      } = input || {};

      const ins = await pool.query(
        `INSERT INTO niko_operational_memory
         (episode_type, subject, decision, rationale, outcome, learnings, autonomy_level, linked_metrics, wave_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, episode_at`,
        [episodeType, subject, decision, rationale, outcome, learnings, autonomyLevel, JSON.stringify(linkedMetrics), waveId]
      );
      return { ok: true, saved: true, id: ins.rows[0].id, episodeAt: ins.rows[0].episode_at, source: 'real' };
    } catch (err: any) {
      return { ok: false, saved: false, source: 'error', error: err.message };
    }
  }

  /**
   * Saldo detalhado + últimas transações
   */
  static async currentBalance() {
    const st = await this.status();
    return {
      balanceBRL: st.balanceBRL ?? 0,
      balanceBTC: 0, // placeholder até integração Binance
      availableForOps: st.balanceBRL ?? 0,
      percentageShare: 25,
      source: st.source,
    };
  }

  static async listTransactions(limit = 20) {
    try {
      const q = await pool.query(
        `SELECT id, entry_type, account, source_type, source_id, amount_cents,
                description, metadata, created_at, created_by
         FROM niko_capital_ledger
         ORDER BY created_at DESC LIMIT $1`, [limit]
      );
      return { total: q.rowCount, transactions: q.rows, source: 'real' };
    } catch (err: any) {
      return { total: 0, transactions: [], source: 'error', error: err.message };
    }
  }

  static async execute(_op: any) {
    // Operações executivas ficam guardadas por segurança — retorna guarded
    return { ok: false, reason: 'niko-sandbox execute is guarded; use remember() to log operational memory', source: 'guarded' };
  }
}
