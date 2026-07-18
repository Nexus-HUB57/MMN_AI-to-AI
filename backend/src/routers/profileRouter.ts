// HOTFIX D18.11: profileRouter — permite editar dados do próprio usuário (email é imutável).
import { z } from "zod";
import { Pool } from "pg";
import { router, protectedProcedure } from "../config/trpc";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function resolveUserId(ctx: any): number | null {
  const v = ctx?.user?.id ?? ctx?.userId ?? null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function withClient<T>(fn: (c: any) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try { return await fn(c); }
  finally { c.release(); }
}

export const profileRouter = router({
  /** Retorna o perfil do usuário logado (dados oficiais do banco). */
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const id = resolveUserId(ctx);
    if (!id) return null;
    return withClient(async (c) => {
      const r = await c.query(
        `SELECT id, name, email, role, cpf, phone,
                "createdAt" AS created_at, "updatedAt" AS updated_at, "lastSignedIn" AS last_signed_in
           FROM users WHERE id=$1 LIMIT 1`,
        [id]
      );
      if (!r.rows.length) return null;
      const row = r.rows[0];
      return {
        id: Number(row.id),
        name: String(row.name || ""),
        email: String(row.email || ""),
        role: String(row.role || "user"),
        cpf: row.cpf ? String(row.cpf) : "",
        phone: row.phone ? String(row.phone) : "",
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
        lastSignedIn: row.last_signed_in ? new Date(row.last_signed_in).toISOString() : null,
      };
    });
  }),

  /** Atualiza campos permitidos. email NUNCA é editável (regra de negócio explícita). */
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().trim().min(2).max(160).optional(),
      cpf: z.string().trim().max(32).optional().nullable(),
      phone: z.string().trim().max(32).optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = resolveUserId(ctx);
      if (!id) throw new Error("Usuário não autenticado.");

      const sets: string[] = [];
      const params: any[] = [];
      if (input.name !== undefined) { params.push(input.name); sets.push(`name=$${params.length}`); }
      if (input.cpf !== undefined) { params.push(input.cpf || null); sets.push(`cpf=$${params.length}`); }
      if (input.phone !== undefined) { params.push(input.phone || null); sets.push(`phone=$${params.length}`); }

      if (!sets.length) return { ok: true, updated: 0 };

      params.push(id);
      const sql = `UPDATE users SET ${sets.join(", ")}, "updatedAt"=NOW() WHERE id=$${params.length} RETURNING id, name, email, cpf, phone`;
      return withClient(async (c) => {
        const r = await c.query(sql, params);
        const row = r.rows[0];
        return {
          ok: true,
          updated: r.rowCount,
          user: row ? {
            id: Number(row.id),
            name: String(row.name || ""),
            email: String(row.email || ""),
            cpf: row.cpf ? String(row.cpf) : "",
            phone: row.phone ? String(row.phone) : "",
          } : null,
        };
      });
    }),
});
