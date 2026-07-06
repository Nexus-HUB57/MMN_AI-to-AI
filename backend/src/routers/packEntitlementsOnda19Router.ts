/**
 * packEntitlementsRouter — Extensão Onda 19
 * ---------------------------------------------------------------------------
 * Endpoints para verificar ownership do Pack A² e bloquear duplicidade
 * de compra (regra de negócio: 1 Pack A² por CPF, exceto SiSu).
 *
 * Este arquivo é para ser mergeado em backend/src/routers/packEntitlementsRouter.ts
 * existente OU registrado como novo router.
 */
import { z } from "zod";
import { Pool } from "pg";
import { publicProcedure, router, protectedProcedure } from "../config/trpc";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PACK_A2_CODES = ["A2", "A²", "pack-a2", "pack_a2", "PACK_A2"];

export const packEntitlementsRouter = router({
  /**
   * Verifica se o usuário logado (via userId opcional para public gate)
   * já adquiriu o Pack A². Retorna informações completas para gate no
   * PixCheckout e no Marketplaces.
   *
   * public + userId param para desbloquear gate do frontend.
   */
  checkPackA2Ownership: publicProcedure
    .input(z.object({
      userId: z.number().int().positive().optional(),
      cpf: z.string().max(14).optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const userId = input?.userId ?? (ctx as any)?.user?.id;
      const cpf = input?.cpf;

      if (!userId && !cpf) {
        return {
          ok: false,
          hasPackA2: false,
          reason: "no_identifier",
          activatedAt: null,
          expiresAt: null,
        };
      }

      try {
        // Estratégia 1: user_id -> affiliate_id -> pack_activations
        let affiliateId: number | null = null;
        if (userId) {
          const aff = await pool.query(
            `SELECT id FROM affiliates WHERE "userId" = $1 LIMIT 1`,
            [userId]
          );
          affiliateId = aff.rows[0]?.id ?? null;
        }

        // Estratégia 2: CPF -> user -> affiliate
        if (!affiliateId && cpf) {
          const u = await pool.query(
            `SELECT a.id AS affiliate_id
             FROM users u JOIN affiliates a ON a."userId" = u.id
             WHERE u.cpf = $1 LIMIT 1`,
            [cpf.replace(/\D/g, "")]
          );
          affiliateId = u.rows[0]?.affiliate_id ?? null;
        }

        if (!affiliateId) {
          return {
            ok: true,
            hasPackA2: false,
            reason: "no_affiliate_record",
            activatedAt: null,
            expiresAt: null,
          };
        }

        // Buscar pack_activations do Pack A²
        const packRes = await pool.query(
          `SELECT pa.id, pa.status, pa.activated_at, pa.expires_at,
                  pa.pack_id, ap.code AS pack_code, ap.name AS pack_name
           FROM pack_activations pa
           LEFT JOIN activation_packs ap ON ap.id = pa.pack_id
           WHERE pa.affiliate_id = $1
             AND (ap.code = ANY($2::text[]) OR ap.name ILIKE '%A²%' OR ap.name ILIKE '%A2%')
             AND pa.status IN ('active','paid','completed')
           ORDER BY pa.activated_at DESC NULLS LAST
           LIMIT 1`,
          [affiliateId, PACK_A2_CODES]
        );

        if (packRes.rows.length > 0) {
          const p = packRes.rows[0];
          return {
            ok: true,
            hasPackA2: true,
            activationId: p.id,
            status: p.status,
            packCode: p.pack_code,
            packName: p.pack_name,
            activatedAt: p.activated_at,
            expiresAt: p.expires_at,
          };
        }

        return {
          ok: true,
          hasPackA2: false,
          activatedAt: null,
          expiresAt: null,
        };
      } catch (e: any) {
        // Tolerante a falha — mesmo com erro no DB, não travamos o UI
        return {
          ok: false,
          hasPackA2: false,
          error: e?.message || "internal_error",
          activatedAt: null,
          expiresAt: null,
        };
      }
    }),
});
