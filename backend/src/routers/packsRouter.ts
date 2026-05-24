import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { packs, agentPacks, InsertAgentPack } from "../drizzle/schema";
import { getAgentByUserId } from "./db";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const packsRouter = router({
  listAvailable: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(packs).where(eq(packs.status, "active"));
  }),

  listMine: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) return [];
    return await db
      .select()
      .from(agentPacks)
      .where(and(eq(agentPacks.agentId, agent.id), eq(agentPacks.status, "active")));
  }),

  purchasePack: protectedProcedure
    .input(z.object({ packId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const agent = await getAgentByUserId(ctx.user.id);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agente não encontrado",
        });
      }

      const pack = await db
        .select()
        .from(packs)
        .where(eq(packs.id, input.packId))
        .limit(1);

      if (!pack || pack.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pacote não encontrado",
        });
      }

      const existing = await db
        .select()
        .from(agentPacks)
        .where(
          and(
            eq(agentPacks.agentId, agent.id),
            eq(agentPacks.packId, input.packId),
            eq(agentPacks.status, "active")
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Pacote já está ativo para este agente",
        });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const newAgentPack: InsertAgentPack = {
        agentId: agent.id,
        packId: input.packId,
        status: "active",
        expiresAt,
      };

      await db.insert(agentPacks).values(newAgentPack);
      return { success: true, pack: pack[0] };
    }),

  cancelPack: protectedProcedure
    .input(z.object({ agentPackId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const agent = await getAgentByUserId(ctx.user.id);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agente não encontrado",
        });
      }

      await db
        .update(agentPacks)
        .set({ status: "inactive" })
        .where(
          and(
            eq(agentPacks.id, input.agentPackId),
            eq(agentPacks.agentId, agent.id)
          )
        );

      return { success: true };
    }),

  getPackDetails: publicProcedure
    .input(z.object({ packId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(packs)
        .where(eq(packs.id, input.packId))
        .limit(1);
      return result[0] ?? null;
    }),
});
