import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../config/trpc";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const meetingStatusSchema = z.enum([
  "scheduled",
  "ongoing",
  "completed",
  "cancelled",
]);

const meetingTierSchema = z.enum([
  "all",
  "iniciante",
  "operador",
  "estrategista",
  "elite",
]);

const participantSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string().optional(),
  registeredAt: z.string().datetime(),
  attended: z.boolean().default(false),
});

const meetingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(120),
  description: z.string().max(1200).optional(),
  mentorName: z.string().min(2).max(80),
  mentorId: z.string(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(240).default(60),
  maxParticipants: z.number().int().min(1).max(20).default(20),
  meetingLink: z.string().url().or(z.literal("")).optional(),
  platform: z
    .enum(["google_meet", "zoom", "teams", "whereby", "outro"])
    .default("google_meet"),
  agenda: z.array(z.string().max(200)).default([]),
  tags: z.array(z.string().max(40)).default([]),
  requiredTier: meetingTierSchema.default("all"),
  status: meetingStatusSchema.default("scheduled"),
  participants: z.array(participantSchema).default([]),
  recordingUrl: z.string().url().or(z.literal("")).optional(),
  notes: z.string().max(2000).optional(),
  isPublished: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

type Meeting = z.infer<typeof meetingSchema>;
type Participant = z.infer<typeof participantSchema>;

const storageSchema = z.object({
  version: z.number().default(1),
  meetings: z.array(meetingSchema).default([]),
  updatedAt: z.string().datetime().optional(),
});

type MeetingsFile = z.infer<typeof storageSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_PATH = path.resolve(process.cwd(), "data", "meetings.json");

async function ensureStorage() {
  await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });
  try {
    await fs.access(STORAGE_PATH);
  } catch {
    const initial: MeetingsFile = {
      version: 1,
      meetings: [],
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(STORAGE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStorage(): Promise<MeetingsFile> {
  await ensureStorage();
  const raw = await fs.readFile(STORAGE_PATH, "utf8");
  return storageSchema.parse(JSON.parse(raw));
}

async function writeStorage(data: MeetingsFile) {
  await ensureStorage();
  await fs.writeFile(
    STORAGE_PATH,
    JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
}

function generateId(): string {
  return `mtg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Tier ordering
const TIER_ORDER: Record<string, number> = {
  all: 0,
  iniciante: 1,
  operador: 2,
  estrategista: 3,
  elite: 4,
};

function userMeetsTier(userTier: string, requiredTier: string): boolean {
  if (requiredTier === "all") return true;
  return (TIER_ORDER[userTier] ?? 0) >= (TIER_ORDER[requiredTier] ?? 99);
}

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────

export const meetingRouter = router({
  // ── list (público para usuários autenticados) ──
  list: publicProcedure
    .input(
      z
        .object({
          status: meetingStatusSchema.optional(),
          onlyUpcoming: z.boolean().optional().default(false),
          requiredTier: meetingTierSchema.optional(),
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(50).default(20),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const storage = await readStorage();
      let items = storage.meetings.filter((m) => m.isPublished !== false);

      if (input?.status) {
        items = items.filter((m) => m.status === input.status);
      }

      if (input?.onlyUpcoming) {
        const now = new Date().toISOString();
        items = items.filter(
          (m) =>
            m.status === "scheduled" &&
            m.scheduledAt > now,
        );
      }

      // Sort ascending by scheduledAt
      items.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );

      const total = items.length;
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;
      const paginated = items.slice(offset, offset + limit);

      return {
        meetings: paginated.map((m) => ({
          ...m,
          participantCount: m.participants.length,
          spotsLeft: m.maxParticipants - m.participants.length,
          isFull: m.participants.length >= m.maxParticipants,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // ── get single ──
  get: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const storage = await readStorage();
      const meeting = storage.meetings.find((m) => m.id === input.id) ?? null;
      if (!meeting) return { meeting: null };
      return {
        meeting: {
          ...meeting,
          participantCount: meeting.participants.length,
          spotsLeft: meeting.maxParticipants - meeting.participants.length,
          isFull: meeting.participants.length >= meeting.maxParticipants,
        },
      };
    }),

  // ── stats ──
  stats: adminProcedure.query(async () => {
    const storage = await readStorage();
    const now = new Date().toISOString();
    const total = storage.meetings.length;
    const scheduled = storage.meetings.filter(
      (m) => m.status === "scheduled" && m.scheduledAt > now,
    ).length;
    const completed = storage.meetings.filter(
      (m) => m.status === "completed",
    ).length;
    const cancelled = storage.meetings.filter(
      (m) => m.status === "cancelled",
    ).length;
    const totalParticipants = storage.meetings.reduce(
      (acc, m) => acc + m.participants.length,
      0,
    );
    return { total, scheduled, completed, cancelled, totalParticipants };
  }),

  // ── create (admin) ──
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(3).max(120),
        description: z.string().max(1200).optional(),
        mentorName: z.string().min(2).max(80),
        scheduledAt: z.string().datetime(),
        durationMinutes: z.number().int().min(15).max(240).default(60),
        maxParticipants: z.number().int().min(1).max(20).default(20),
        meetingLink: z.string().url().or(z.literal("")).optional(),
        platform: z
          .enum(["google_meet", "zoom", "teams", "whereby", "outro"])
          .default("google_meet"),
        agenda: z.array(z.string().max(200)).default([]),
        tags: z.array(z.string().max(40)).default([]),
        requiredTier: meetingTierSchema.default("all"),
        notes: z.string().max(2000).optional(),
        isPublished: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const storage = await readStorage();
      const now = new Date().toISOString();
      const mentorId = ctx.user?.id ? String(ctx.user.id) : "admin";

      const newMeeting: Meeting = {
        id: generateId(),
        ...input,
        mentorId,
        participants: [],
        status: "scheduled",
        createdAt: now,
        updatedAt: now,
      };

      storage.meetings.push(newMeeting);
      await writeStorage(storage);

      return { ok: true, meeting: newMeeting };
    }),

  // ── update (admin) ──
  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        title: z.string().min(3).max(120).optional(),
        description: z.string().max(1200).optional(),
        mentorName: z.string().min(2).max(80).optional(),
        scheduledAt: z.string().datetime().optional(),
        durationMinutes: z.number().int().min(15).max(240).optional(),
        maxParticipants: z.number().int().min(1).max(20).optional(),
        meetingLink: z.string().url().or(z.literal("")).optional(),
        platform: z
          .enum(["google_meet", "zoom", "teams", "whereby", "outro"])
          .optional(),
        agenda: z.array(z.string().max(200)).optional(),
        tags: z.array(z.string().max(40)).optional(),
        requiredTier: meetingTierSchema.optional(),
        status: meetingStatusSchema.optional(),
        recordingUrl: z.string().url().or(z.literal("")).optional(),
        notes: z.string().max(2000).optional(),
        isPublished: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const storage = await readStorage();
      const idx = storage.meetings.findIndex((m) => m.id === input.id);
      if (idx < 0) throw new Error("Reunião não encontrada.");

      const { id: _id, ...updates } = input;
      storage.meetings[idx] = {
        ...storage.meetings[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await writeStorage(storage);
      return { ok: true, meeting: storage.meetings[idx] };
    }),

  // ── delete (admin) ──
  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const storage = await readStorage();
      const before = storage.meetings.length;
      storage.meetings = storage.meetings.filter((m) => m.id !== input.id);
      await writeStorage(storage);
      return { ok: true, removed: before !== storage.meetings.length };
    }),

  // ── join meeting (afiliado) ──
  join: protectedProcedure
    .input(
      z.object({
        meetingId: z.string().min(1),
        name: z.string().min(2).max(80),
        email: z.string().email().optional(),
        userTier: z.string().default("iniciante"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const storage = await readStorage();
      const idx = storage.meetings.findIndex((m) => m.id === input.meetingId);
      if (idx < 0) throw new Error("Reunião não encontrada.");

      const meeting = storage.meetings[idx];

      if (meeting.status === "cancelled")
        throw new Error("Esta reunião foi cancelada.");
      if (meeting.status === "completed")
        throw new Error("Esta reunião já foi concluída.");

      if (!userMeetsTier(input.userTier, meeting.requiredTier)) {
        throw new Error(
          `Esta reunião requer nível ${meeting.requiredTier}. Avance sua trilha para participar.`,
        );
      }

      if (meeting.participants.length >= meeting.maxParticipants) {
        throw new Error(
          `Vagas esgotadas. Máximo de ${meeting.maxParticipants} participantes atingido.`,
        );
      }

      const userId = String(ctx.user.id);
      const alreadyJoined = meeting.participants.some(
        (p) => p.userId === userId,
      );
      if (alreadyJoined) throw new Error("Você já está inscrito nesta reunião.");

      const participant: Participant = {
        userId,
        name: input.name,
        email: input.email,
        registeredAt: new Date().toISOString(),
        attended: false,
      };

      storage.meetings[idx].participants.push(participant);
      storage.meetings[idx].updatedAt = new Date().toISOString();
      await writeStorage(storage);

      return {
        ok: true,
        spotsLeft:
          meeting.maxParticipants - storage.meetings[idx].participants.length,
        meetingLink: meeting.meetingLink,
      };
    }),

  // ── leave meeting ──
  leave: protectedProcedure
    .input(z.object({ meetingId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const storage = await readStorage();
      const idx = storage.meetings.findIndex((m) => m.id === input.meetingId);
      if (idx < 0) throw new Error("Reunião não encontrada.");

      const userId = String(ctx.user.id);
      const before = storage.meetings[idx].participants.length;
      storage.meetings[idx].participants = storage.meetings[idx].participants.filter(
        (p) => p.userId !== userId,
      );
      storage.meetings[idx].updatedAt = new Date().toISOString();
      await writeStorage(storage);

      return { ok: true, removed: before !== storage.meetings[idx].participants.length };
    }),

  // ── mark attendance (admin) ──
  markAttendance: adminProcedure
    .input(
      z.object({
        meetingId: z.string().min(1),
        userId: z.string().min(1),
        attended: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const storage = await readStorage();
      const mIdx = storage.meetings.findIndex((m) => m.id === input.meetingId);
      if (mIdx < 0) throw new Error("Reunião não encontrada.");

      const pIdx = storage.meetings[mIdx].participants.findIndex(
        (p) => p.userId === input.userId,
      );
      if (pIdx < 0) throw new Error("Participante não encontrado.");

      storage.meetings[mIdx].participants[pIdx].attended = input.attended;
      storage.meetings[mIdx].updatedAt = new Date().toISOString();
      await writeStorage(storage);

      return { ok: true };
    }),

  // ── listAdmin (admin) ──
  listAdmin: adminProcedure
    .input(
      z
        .object({
          status: meetingStatusSchema.optional(),
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(50).default(20),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const storage = await readStorage();
      let items = [...storage.meetings];

      if (input?.status) {
        items = items.filter((m) => m.status === input.status);
      }

      items.sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      );

      const total = items.length;
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      return {
        meetings: items.slice(offset, offset + limit).map((m) => ({
          ...m,
          participantCount: m.participants.length,
          spotsLeft: m.maxParticipants - m.participants.length,
          isFull: m.participants.length >= m.maxParticipants,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),
});
