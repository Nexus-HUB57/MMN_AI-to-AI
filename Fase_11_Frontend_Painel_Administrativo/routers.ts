import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { systemRouter } from "./systemRouter";
import { publicProcedure, protectedProcedure, router } from "./trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { users, affiliates, payments, delinquents, materials, commissionConfigs } from "../drizzle/schema";

// Admin-only procedure wrapper
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard router
  dashboard: router({
    getMetrics: adminProcedure.query(async () => {
      return await db.getDashboardMetrics();
    }),
  }),

  // Users router
  users: router({
    list: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await db.getAllUsers(input.limit, input.offset);
      }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserById(input.id);
      }),

    updateRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        try {
          await dbInstance.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
          await db.logAdminAction(ctx.user.id, "UPDATE_USER_ROLE", "user", input.userId, `Changed role to ${input.role}`);
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update user role" });
        }
      }),
  }),

  // Affiliates router
  affiliates: router({
    list: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await db.getAllAffiliates(input.limit, input.offset);
      }),

    getById: adminProcedure
      .input(z.object({ affiliateId: z.number() }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return null;
        const result = await dbInstance.select().from(affiliates).where(eq(affiliates.id, input.affiliateId)).limit(1);
        return result.length > 0 ? result[0] : null;
      }),
  }),

  // Commission configs router
  commissionConfigs: router({
    list: adminProcedure.query(async () => {
      return await db.getCommissionConfigs();
    }),

    update: adminProcedure
      .input(z.object({
        level: z.number(),
        percentage: z.number(),
        minAmount: z.number().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        try {
          const existing = await db.getCommissionConfigByLevel(input.level);
          if (existing) {
            await dbInstance.update(commissionConfigs)
              .set({
                percentage: input.percentage.toString(),
                minAmount: input.minAmount?.toString(),
                description: input.description,
              })
              .where(eq(commissionConfigs.level, input.level));
          } else {
            await dbInstance.insert(commissionConfigs).values({
              level: input.level,
              percentage: input.percentage.toString(),
              minAmount: input.minAmount?.toString() || "0",
              description: input.description,
              active: 1,
            });
          }
          await db.logAdminAction(ctx.user.id, "UPDATE_COMMISSION_CONFIG", "commission_config", input.level, `Updated level ${input.level}`);
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update commission config" });
        }
      }),
  }),

  // Network router
  network: router({
    getByAffiliate: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNetworkByAffiliate(input.userId);
      }),

    getDirectReferrals: adminProcedure
      .input(z.object({ sponsorId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDirectReferrals(input.sponsorId);
      }),
  }),

  // Payments router
  payments: router({
    list: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await db.getPayments(input.limit, input.offset);
      }),

    getByAffiliate: adminProcedure
      .input(z.object({ affiliateId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPaymentsByAffiliate(input.affiliateId);
      }),

    updateStatus: adminProcedure
      .input(z.object({
        paymentId: z.number(),
        status: z.enum(["pending", "approved", "paid", "rejected", "cancelled"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        try {
          await dbInstance.update(payments)
            .set({ status: input.status })
            .where(eq(payments.id, input.paymentId));
          await db.logAdminAction(ctx.user.id, "UPDATE_PAYMENT_STATUS", "payment", input.paymentId, `Changed status to ${input.status}`);
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update payment status" });
        }
      }),
  }),

  // Delinquents router
  delinquents: router({
    list: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await db.getDelinquents(input.limit, input.offset);
      }),

    getByAffiliate: adminProcedure
      .input(z.object({ affiliateId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDelinquentsByAffiliate(input.affiliateId);
      }),

    updateStatus: adminProcedure
      .input(z.object({
        delinquentId: z.number(),
        status: z.enum(["active", "resolved", "disputed"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        try {
          await dbInstance.update(delinquents)
            .set({ status: input.status })
            .where(eq(delinquents.id, input.delinquentId));
          await db.logAdminAction(ctx.user.id, "UPDATE_DELINQUENT_STATUS", "delinquent", input.delinquentId, `Changed status to ${input.status}`);
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update delinquent status" });
        }
      }),
  }),

  // Materials router
  materials: router({
    list: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await db.getMaterials(input.limit, input.offset);
      }),

    getByCategory: adminProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await db.getMaterialsByCategory(input.category);
      }),

    create: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string(),
        type: z.enum(["banner", "text", "link", "video", "image", "document"]),
        url: z.string().optional(),
        fileKey: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        try {
          const result = await dbInstance.insert(materials).values({
            title: input.title,
            description: input.description,
            category: input.category,
            type: input.type,
            url: input.url,
            fileKey: input.fileKey,
            status: "active",
          });
          await db.logAdminAction(ctx.user.id, "CREATE_MATERIAL", "material", undefined, `Created material: ${input.title}`);
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create material" });
        }
      }),

    updateStatus: adminProcedure
      .input(z.object({
        materialId: z.number(),
        status: z.enum(["active", "inactive", "archived"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        try {
          await dbInstance.update(materials)
            .set({ status: input.status })
            .where(eq(materials.id, input.materialId));
          await db.logAdminAction(ctx.user.id, "UPDATE_MATERIAL_STATUS", "material", input.materialId, `Changed status to ${input.status}`);
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update material status" });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
