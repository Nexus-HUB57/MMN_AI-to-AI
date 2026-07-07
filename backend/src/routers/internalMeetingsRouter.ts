import { z } from "zod";
import { Pool } from "pg";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../config/trpc";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Internal Meetings Router · Owner: COO/AI Otavio Nexus Ops
 * 
 * Reuniões internas via chatbot (C-Suite) + Jivo chat (afiliados)
 * NÃO usa Google Meet / Zoom / Teams
 */
export const internalMeetingsRouter = router({
  // Listar meetings agendados
  list: protectedProcedure
    .input(z.object({
      meetingType: z.enum(["c-suite", "affiliate-support", "training", "all"]).default("all"),
      status: z.enum(["scheduled", "ongoing", "completed", "cancelled", "all"]).default("all"),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const where: string[] = ["1=1"];
      const params: any[] = [];
      let pi = 1;

      if (input.meetingType !== "all") {
        where.push(`meeting_type = $${pi++}`);
        params.push(input.meetingType);
      }
      if (input.status !== "all") {
        where.push(`status = $${pi++}`);
        params.push(input.status);
      }

      const rows = await pool.query(
        `SELECT id, title, meeting_type, scheduled_at, duration_minutes,
                chatbot_room_id, jivo_channel_id, participants, agenda,
                status, created_by, created_at
         FROM internal_meetings
         WHERE ${where.join(" AND ")}
         ORDER BY scheduled_at DESC
         LIMIT $${pi}`,
        [...params, input.limit],
      );

      return { meetings: rows.rows, total: rows.rows.length };
    }),

  // Criar meeting interno (automatiza chatbot room + Jivo channel)
  create: adminProcedure
    .input(z.object({
      title: z.string().min(3),
      meetingType: z.enum(["c-suite", "affiliate-support", "training"]),
      scheduledAt: z.string(),
      durationMinutes: z.number().default(60),
      participants: z.array(z.any()).default([]),
      agenda: z.array(z.any()).default([]),
    }))
    .mutation(async ({ input, ctx }) => {
      const meetingId = `meeting-${Date.now()}`;
      const chatbotRoomId = `chatbot-room-${meetingId}`;
      const jivoChannelId = input.meetingType === "affiliate-support" 
        ? `jivo-channel-${meetingId}` 
        : null;

      const result = await pool.query(
        `INSERT INTO internal_meetings 
          (id, title, meeting_type, scheduled_at, duration_minutes,
           chatbot_room_id, jivo_channel_id, participants, agenda, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10)
         RETURNING *`,
        [
          meetingId,
          input.title,
          input.meetingType,
          input.scheduledAt,
          input.durationMinutes,
          chatbotRoomId,
          jivoChannelId,
          JSON.stringify(input.participants),
          JSON.stringify(input.agenda),
          ctx.user?.email ?? "admin",
        ],
      );

      return {
        ok: true,
        meeting: result.rows[0],
        chatbotRoomUrl: `https://oneverso.com.br/meetings/room/${chatbotRoomId}`,
        jivoChannelUrl: jivoChannelId ? `https://oneverso.com.br/jivo/${jivoChannelId}` : null,
      };
    }),

  // Iniciar meeting (transição scheduled -> ongoing)
  start: adminProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ input }) => {
      const result = await pool.query(
        `UPDATE internal_meetings SET status='ongoing', updated_at=now() WHERE id=$1 RETURNING *`,
        [input.meetingId],
      );
      return { ok: true, meeting: result.rows[0] };
    }),

  // Estatísticas
  stats: protectedProcedure.query(async () => {
    const total = await pool.query(`SELECT COUNT(*)::int AS c FROM internal_meetings`);
    const upcoming = await pool.query(
      `SELECT COUNT(*)::int AS c FROM internal_meetings WHERE scheduled_at > now() AND status='scheduled'`,
    );
    const cSuite = await pool.query(
      `SELECT COUNT(*)::int AS c FROM internal_meetings WHERE meeting_type='c-suite'`,
    );

    return {
      total: total.rows[0]?.c ?? 0,
      upcoming: upcoming.rows[0]?.c ?? 0,
      cSuite: cSuite.rows[0]?.c ?? 0,
    };
  }),
});
