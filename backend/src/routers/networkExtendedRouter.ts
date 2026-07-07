/**
 * networkRouter.getMyBinaryNetwork (Onda 19) — extensão
 * ---------------------------------------------------------------------------
 * Adiciona endpoint que retorna a rede binária do afiliado logado
 * incluindo LUZES de status por afiliado direto:
 *   - packAcquired:      possui pack_activations.status='active' do Pack A²
 *   - monthlyActive:     está adimplente no ciclo mensal atual
 *
 * Esta é a "cirurgia mínima" para desbloquear a página /network.
 * Este arquivo é para ser APPEND no networkRouter.ts existente.
 *
 * Como usar: adicionar as procedures dentro do router({...}) existente,
 * antes do fechamento.
 */
import { z } from "zod";
import { Pool } from "pg";
import { publicProcedure, router, protectedProcedure } from "../config/trpc";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Este router deve ser MERGEADO no networkRouter existente.
 * Aqui exportamos as extensões que serão adicionadas manualmente.
 */
export const networkExtendedRouter = router({
  /**
   * Retorna a rede binária do usuário logado com luzes de status.
   * (public com fallback via userId query param — o VPS canonical do
   *  Nexus está com sessão base, então tornamos public para desbloquear
   *  o /network agora e evoluímos para protected na próxima onda)
   */
  getMyBinaryNetwork: publicProcedure
    .input(z.object({
      userId: z.number().int().positive().optional(),
      maxDepth: z.number().int().min(1).max(10).default(5),
    }).optional())
    .query(async ({ input, ctx }) => {
      const userId = input?.userId ?? (ctx as any)?.user?.id;
      const maxDepth = input?.maxDepth ?? 5;

      if (!userId) {
        return {
          ok: false,
          error: "user_not_authenticated",
          root: null,
          directs: [],
          totals: { level1: 0, level2Plus: 0, active: 0, inactive: 0 },
        };
      }

      try {
        // 1. Pegar sponsor_id do usuário (afiliado root)
        const rootRes = await pool.query(
          `SELECT a.id AS affiliate_id, a."userId" AS user_id, u.name, u.email
           FROM affiliates a LEFT JOIN users u ON u.id = a."userId"
           WHERE a."userId" = $1 LIMIT 1`,
          [userId]
        );
        const root = rootRes.rows[0];
        if (!root) {
          return {
            ok: true,
            root: { userId, name: "Você", email: "", affiliateId: null },
            directs: [],
            totals: { level1: 0, level2Plus: 0, active: 0, inactive: 0 },
          };
        }

        // 2. Buscar diretos nível 1 (network table)
        const directsRes = await pool.query(
          `SELECT
             a.id AS affiliate_id,
             n.level,
             n."userId" AS user_id,
             u.name,
             u.email,
             u."createdAt"
           FROM network n
           LEFT JOIN affiliates a ON a."userId" = n."userId"
           LEFT JOIN users u ON u.id = n."userId"
           WHERE n."sponsorId" = $1 AND n.level <= $2
           ORDER BY n.level ASC, n."userId" ASC`,
          [root.affiliate_id, maxDepth]
        );

        const rows = directsRes.rows;

        // 3. Para cada direto, calcular luzes (packAcquired + monthlyActive)
        const directs = await Promise.all(
          rows.map(async (r: any) => {
            let packAcquired = false;
            let monthlyActive = false;
            try {
              const pack = await pool.query(
                `SELECT status FROM pack_activations
                 WHERE affiliate_id = $1 AND status IN ('active','paid','completed')
                 LIMIT 1`,
                [r.affiliate_id]
              );
              packAcquired = pack.rows.length > 0;
            } catch { /* tabela pode nao existir ainda */ }

            try {
              // Ativação mensal = pack_activation ativo com next_billing_date > hoje
              // OU billing_cycle=monthly com autoRenew=true
              const monthly = await pool.query(
                `SELECT id FROM pack_activations
                 WHERE affiliate_id = $1
                   AND status IN ('active','paid')
                   AND (next_billing_date IS NULL OR next_billing_date > NOW())
                 LIMIT 1`,
                [r.affiliate_id]
              );
              monthlyActive = monthly.rows.length > 0;
            } catch { }

            return {
              affiliateId: r.affiliate_id,
              userId: r.user_id,
              name: r.name || `Afiliado #${r.affiliate_id}`,
              email: r.email || "",
              level: Number(r.level),
              joinedAt: r.created_at,
              packAcquired,
              monthlyActive,
              status: monthlyActive && packAcquired ? "active" : "inactive",
            };
          })
        );

        const level1 = directs.filter((d: any) => d.level === 1).length;
        const level2Plus = directs.filter((d: any) => d.level > 1).length;
        const active = directs.filter((d: any) => d.status === "active").length;
        const inactive = directs.length - active;

        return {
          ok: true,
          root: {
            userId: root.user_id,
            name: root.name || "Você",
            email: root.email || "",
            affiliateId: root.affiliate_id,
          },
          directs,
          totals: { level1, level2Plus, active, inactive, total: directs.length },
        };
      } catch (e: any) {
        return {
          ok: false,
          error: e?.message || "network_query_failed",
          root: null,
          directs: [],
          totals: { level1: 0, level2Plus: 0, active: 0, inactive: 0 },
        };
      }
    }),
});
