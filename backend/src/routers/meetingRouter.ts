/**
 * meetingRouter — Nexus Affil'IA'te · Onda 8
 * Feed interno auditável para reuniões C-Level. Nenhum dado fictício é retornado.
 */
import { z } from "zod";
import { Pool } from "pg";
import { adminProcedure, publicProcedure, router } from "../config/trpc";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const messageKind = z.enum(["note", "decision", "action", "signal"]);

function normalizeThread(row: any) {
  return {
    id: Number(row.id),
    title: row.title,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: Number(row.messages ?? 0),
    lastMessageAt: row.last_message_at ?? null,
  };
}

export const meetingRouter = router({
  health: publicProcedure.query(() => ({ ok: true, service: "meetings", source: "database" })),

  listSignals: publicProcedure.query(() => ({
    signals: ["ceo", "cfo", "cmo", "coo", "cpo", "cto"].map((role) => ({ role, status: "active" })),
  })),

  listThreads: adminProcedure
    .input(z.object({ status: z.enum(["open", "closed", "archived"]).optional(), limit: z.number().int().min(1).max(100).default(40) }).optional())
    .query(async ({ input }) => {
      const status = input?.status;
      const limit = input?.limit ?? 40;
      const result = await pool.query(
        `SELECT t.*, COUNT(m.id)::int AS messages, MAX(m.created_at) AS last_message_at
           FROM meeting_threads t
           LEFT JOIN meeting_messages m ON m.thread_id = t.id
          WHERE ($1::text IS NULL OR t.status = $1)
          GROUP BY t.id
          ORDER BY COALESCE(MAX(m.created_at), t.updated_at) DESC
          LIMIT $2`,
        [status ?? null, limit],
      );
      return { threads: result.rows.map(normalizeThread), source: "db_real" };
    }),

  getThread: adminProcedure
    .input(z.object({ threadId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const thread = await pool.query('SELECT * FROM meeting_threads WHERE id = $1', [input.threadId]);
      if (!thread.rowCount) return { thread: null, messages: [] };
      const messages = await pool.query(
        'SELECT id, thread_id, author_name, author_role, body, kind, created_at FROM meeting_messages WHERE thread_id = $1 ORDER BY created_at ASC',
        [input.threadId],
      );
      return {
        thread: normalizeThread(thread.rows[0]),
        messages: messages.rows.map((row) => ({
          id: Number(row.id), threadId: Number(row.thread_id), authorName: row.author_name,
          authorRole: row.author_role, body: row.body, kind: row.kind, createdAt: row.created_at,
        })),
      };
    }),

  createThread: adminProcedure
    .input(z.object({ title: z.string().trim().min(3).max(180), openingMessage: z.string().trim().min(1).max(6000).optional(), kind: messageKind.default("note") }))
    .mutation(async ({ ctx, input }) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const actor = ctx.user.email ?? `admin:${ctx.user.id}`;
        const thread = await client.query(
          'INSERT INTO meeting_threads (title, created_by) VALUES ($1, $2) RETURNING *',
          [input.title, actor],
        );
        if (input.openingMessage) {
          await client.query(
            'INSERT INTO meeting_messages (thread_id, author_name, author_role, body, kind) VALUES ($1, $2, $3, $4, $5)',
            [thread.rows[0].id, actor, "admin", input.openingMessage, input.kind],
          );
        }
        await client.query("COMMIT");
        return { ok: true, thread: normalizeThread(thread.rows[0]) };
      } catch (error) { await client.query("ROLLBACK"); throw error; }
      finally { client.release(); }
    }),

  postMessage: adminProcedure
    .input(z.object({ threadId: z.number().int().positive(), body: z.string().trim().min(1).max(6000), kind: messageKind.default("note") }))
    .mutation(async ({ ctx, input }) => {
      const actor = ctx.user.email ?? `admin:${ctx.user.id}`;
      const result = await pool.query(
        `INSERT INTO meeting_messages (thread_id, author_name, author_role, body, kind)
         VALUES ($1, $2, 'admin', $3, $4) RETURNING *`,
        [input.threadId, actor, input.body, input.kind],
      );
      await pool.query('UPDATE meeting_threads SET updated_at = NOW() WHERE id = $1', [input.threadId]);
      return { ok: true, messageId: Number(result.rows[0].id) };
    }),

  setThreadStatus: adminProcedure
    .input(z.object({ threadId: z.number().int().positive(), status: z.enum(["open", "closed", "archived"]) }))
    .mutation(async ({ input }) => {
      const result = await pool.query('UPDATE meeting_threads SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id', [input.status, input.threadId]);
      if (!result.rowCount) throw new Error("Thread de reunião não encontrado.");
      return { ok: true, status: input.status };
    }),

  getStats: adminProcedure.query(async () => {
    const result = await pool.query(`SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'open')::int AS open,
      COUNT(*) FILTER (WHERE status = 'closed')::int AS closed
      FROM meeting_threads`);
    return { ...result.rows[0], source: "db_real" };
  }),
});
