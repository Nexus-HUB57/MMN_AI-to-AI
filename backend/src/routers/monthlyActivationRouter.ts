/**
 * monthlyActivationRouter — Ativação Mensal endpoints
 *
 * CEO-015: Endpoints para o frontend gerenciar a ativação mensal dos afiliados.
 * - getMyStatus: retorna o status de ativação do ciclo atual
 * - getHistory: histórico de ativações
 * - processPayment: registra pagamento e entrega compensação
 *
 * Protocolo_Pack: Ativação Mensal é obrigatória para níveis A²II+ (exceto A² base).
 * Cada ativação paga compensa com Pack A² no estoque do afiliado.
 */

import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { Pool } from "pg";

let _pool: Pool | null = null;
function getPool(): Pool {
  if (!_pool) {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) throw new Error("DATABASE_URL not configured");
    _pool = new Pool({ connectionString: connStr, max: 10 });
  }
  return _pool;
}

function getCurrentCycle(): string {
  return new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });
}

export const monthlyActivationRouter = router({
  /**
   * Retorna o status de ativação mensal do usuário no ciclo atual.
   * Frontend usa para exibir "Ativação Mensal: PENDENTE" ou "ATIVA".
   */
  getMyStatus: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx?.user?.id;
    if (!userId) return { status: "unknown", cycle: "", message: "Não autenticado" };

    const cycle = getCurrentCycle();
    const client = await getPool().connect();
    try {
      // Garantir que a tabela existe
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS user_monthly_activation (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            pack_slug VARCHAR(100) NOT NULL,
            cycle_label VARCHAR(50) NOT NULL,
            cost_cents INTEGER NOT NULL DEFAULT 0,
            packs_compensation INTEGER NOT NULL DEFAULT 0,
            status VARCHAR(50) DEFAULT 'configured',
            activated_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, cycle_label)
          );
        `);
      } catch {
        // tabela pode já existir
      }

      const r = await client.query(
        `SELECT * FROM user_monthly_activation
         WHERE user_id = $1 AND cycle_label = $2
         ORDER BY created_at DESC LIMIT 1`,
        [userId, cycle],
      );

      if (r.rows.length === 0) {
        return {
          status: "no_record",
          cycle,
          message: "Nenhuma ativação configurada para este ciclo",
          needsActivation: false,
        };
      }

      const row = r.rows[0];
      return {
        status: row.status, // "configured" | "paid" | "expired"
        cycle: row.cycle_label,
        costCents: row.cost_cents,
        packsCompensation: row.packs_compensation,
        packSlug: row.pack_slug,
        activatedAt: row.activated_at?.toISOString?.() ?? null,
        createdAt: row.created_at?.toISOString?.() ?? null,
        needsActivation: row.status === "configured",
        isActive: row.status === "paid",
        isExpired: row.status === "expired",
        message: row.status === "paid"
          ? `Ativação ${cycle} confirmada`
          : row.status === "expired"
            ? `Ativação ${cycle} expirada`
            : `Ativação ${cycle} pendente — R$${(row.cost_cents / 100).toFixed(2)}`,
      };
    } finally {
      client.release();
    }
  }),

  /**
   * Histórico de ativações mensais do usuário.
   */
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(12) }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx?.user?.id;
      if (!userId) return { items: [], total: 0 };

      const client = await getPool().connect();
      try {
        const r = await client.query(
          `SELECT cycle_label, cost_cents, packs_compensation, status, activated_at, created_at
           FROM user_monthly_activation
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT $2`,
          [userId, input?.limit ?? 12],
        );

        return {
          items: r.rows.map((row: any) => ({
            cycle: row.cycle_label,
            costCents: row.cost_cents,
            packsCompensation: row.packs_compensation,
            status: row.status,
            activatedAt: row.activated_at?.toISOString?.() ?? null,
            createdAt: row.created_at?.toISOString?.() ?? null,
          })),
          total: r.rows.length,
        };
      } finally {
        client.release();
      }
    }),

  /**
   * Processa pagamento de ativação mensal.
   * Marca o ciclo como pago e entrega Pack A² compensação ao estoque.
   */
  processPayment: protectedProcedure
    .input(z.object({
      paymentRef: z.string().min(2),
      amountCents: z.number().int().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx?.user?.id;
      if (!userId) return { ok: false, message: "Não autenticado" };

      try {
        const { processMonthlyActivation } = await import("../services/packDeliveryService");

        // Encontrar o pack ativo do usuário com ativação mensal habilitada
        const client = await getPool().connect();
        try {
          const packRes = await client.query(
            `SELECT DISTINCT pg.pack_slug
             FROM marketplace_pack_grants pg
             JOIN user_pack_access upa ON upa.user_id = pg.user_id
             WHERE pg.user_id = $1 AND pg.status IN ('granted','active','completed')
             LIMIT 1`,
            [userId],
          );

          // Fallback: usar pack-a2ii como padrão se não encontrar
          let packSlug = packRes.rows[0]?.pack_slug ?? "pack-a2ii";
        } catch {
          packSlug = "pack-a2ii";
        } finally {
          client.release();
        }

        const result = await processMonthlyActivation(
          userId,
          packSlug,
          input.paymentRef,
          input.amountCents,
        );
        return result;
      } catch (e: any) {
        return { ok: false, message: `Erro ao processar ativação: ${e.message}` };
      }
    }),

  /**
   * Admin: lista todas as ativações pendentes do ciclo atual.
   */
  listPending: adminProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      const cycle = getCurrentCycle();
      const client = await getPool().connect();
      try {
        const r = await client.query(
          `SELECT uma.*, u.name, u.email
           FROM user_monthly_activation uma
           JOIN users u ON u.id = uma.user_id
           WHERE uma.cycle_label = $1 AND uma.status = 'configured'
           ORDER BY uma.created_at ASC
           LIMIT $2`,
          [cycle, input?.limit ?? 50],
        );

        return {
          cycle,
          pending: r.rows.map((row: any) => ({
            userId: row.user_id,
            userName: row.name,
            userEmail: row.email,
            packSlug: row.pack_slug,
            costCents: row.cost_cents,
            packsCompensation: row.packs_compensation,
            createdAt: row.created_at,
          })),
          total: r.rows.length,
        };
      } finally {
        client.release();
      }
    }),

  /**
   * Admin: limpa ativações stale (ciclos anteriores com status configured).
   * Resolve o bug de junho/julho — marca entries antigos como expired.
   */
  cleanStale: adminProcedure.mutation(async () => {
    const cycle = getCurrentCycle();
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      // Marcar configured de ciclos anteriores como expired
      const stale = await client.query(
        `UPDATE user_monthly_activation
         SET status = 'expired'
         WHERE status = 'configured'
           AND cycle_label != $1
           AND created_at < NOW() - INTERVAL '10 days'
         RETURNING id, user_id, cycle_label`,
        [cycle],
      );

      await client.query("COMMIT");

      return {
        ok: true,
        cycle,
        expiredCount: stale.rows.length,
        message: `${stale.rows.length} ativações stale marcadas como expired`,
      };
    } catch (e: any) {
      await client.query("ROLLBACK").catch(() => undefined);
      return { ok: false, message: e.message };
    } finally {
      client.release();
    }
  }),
});
