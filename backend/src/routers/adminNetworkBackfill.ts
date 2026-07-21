/**
 * CEO-007: Admin endpoint para backfill da rede binaria
 *
 * Extrai pares (userId, sponsorCode) do niko_operational_memory log e
 * cria os links que faltam nas tabelas affiliates.sponsorId e network.
 * Idempotente — seguro para rodar multiplas vezes.
 */
import { z } from "zod";

export const adminNetworkBackfillProcedure = adminProcedure
  .mutation(async ({ ctx }) => {
    const db = ctx.db;
    let updated = 0;
    let inserted = 0;

    try {
      // 1. Extrair pares do log
      const logRows = await db.execute(sql`
        SELECT DISTINCT
          (decision::json->>'userId')::int AS user_id,
          decision::json->>'sponsorCode' AS sponsor_code
        FROM niko_operational_memory
        WHERE episode_type = 'signup'
          AND decision LIKE '%sponsorCode%'
          AND decision NOT LIKE '%"sponsorCode":null%'
          AND decision NOT LIKE '%"sponsorCode":""%'
      `);

      for (const row of logRows) {
        const userId = Number(row.user_id);
        const sponsorCode = String(row.sponsor_code || "").trim();
        if (!userId || !sponsorCode) continue;

        // 2. Resolver sponsor
        const [sponsor] = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.affiliateCode, sponsorCode));

        if (!sponsor) continue;

        // 3. Atualizar affiliates.sponsorId
        const [affiliate] = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.userId, userId));

        if (affiliate && !affiliate.sponsorId) {
          await db
            .update(affiliates)
            .set({ sponsorId: sponsor.id, updatedAt: new Date() })
            .where(eq(affiliates.id, affiliate.id));
          updated++;
        }

        // 4. Inserir na tabela network (se nao existe)
        const existing = await db.execute(sql`
          SELECT 1 FROM network
          WHERE "userId" = ${userId} AND "sponsorId" = ${sponsor.id}
          LIMIT 1
        `);

        if (!existing || existing.length === 0) {
          await db.execute(sql`
            INSERT INTO network ("userId", "sponsorId", level, "createdAt")
            VALUES (${userId}, ${sponsor.id}, 1, NOW())
          `);
          inserted++;
        }
      }

      console.log(`[CEO-007] Backfill complete: ${updated} affiliates updated, ${inserted} network entries created`);

      return {
        ok: true,
        affiliatesUpdated: updated,
        networkEntriesCreated: inserted,
        message: updated > 0 || inserted > 0
          ? `Backfill executado: ${updated} afiliados vinculados, ${inserted} entradas de rede criadas.`
          : "Nenhum registro pendente encontrado. A rede ja esta sincronizada.",
      };
    } catch (error: any) {
      console.error("[CEO-007] Backfill failed:", error?.message);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Backfill falhou: ${error?.message}`,
      });
    }
  });
