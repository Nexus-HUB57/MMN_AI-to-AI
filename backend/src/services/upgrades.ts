import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../config/trpc";
import { getDb } from "../../../database/schemas/db";
import { upgrades, agentUpgrades, Upgrade as InsertUpgrade, AgentUpgrade as InsertAgentUpgrade } from "../../../database/schemas/schema-final";
import { getAgentByUserId, getActiveUpgrades } from "../../../database/schemas/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const upgradesRouter = router({
  listAvailable: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(upgrades).where(eq(upgrades.status, "available"));
  }),

  listActive: protectedProcedure.query(async ({ ctx }) => {
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent not found",
      });
    }
    return await getActiveUpgrades(agent.id);
  }),

  activateUpgrade: protectedProcedure
    .input(z.object({ upgradeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const agent = await getAgentByUserId(ctx.user.id);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      const upgrade = await db.select().from(upgrades).where(eq(upgrades.id, input.upgradeId)).limit(1);
      if (!upgrade || upgrade.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upgrade not found",
        });
      }

      const newAgentUpgrade: InsertAgentUpgrade = {
        agentId: agent.id,
        upgradeId: input.upgradeId,
        status: "active",
      };

      await db.insert(agentUpgrades).values(newAgentUpgrade);
      return newAgentUpgrade;
    }),

  deactivateUpgrade: protectedProcedure
    .input(z.object({ agentUpgradeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const agent = await getAgentByUserId(ctx.user.id);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      await db
        .update(agentUpgrades)
        .set({ status: "inactive" })
        .where(eq(agentUpgrades.id, input.agentUpgradeId));

      return { success: true };
    }),
});
