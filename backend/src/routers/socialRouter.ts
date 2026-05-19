import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../config/trpc";
import { createNotification, getDb } from "../../../database/schemas/db";
import {
  socialAccounts,
  contentCalendar,
  trackingLinks,
  conversionEvents,
  affiliatePerformance,
  InsertSocialAccount,
  InsertContentCalendar,
  InsertTrackingLink,
  InsertConversionEvent,
} from "../../../database/schemas/banking-schema";
import { eq, and, desc, gte, lt, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Social Router - Posts Automatizados e Redes Sociais
 * Sistema de automação para WhatsApp, Instagram e Facebook
 */

// Plataformas suportadas
type Platform = "whatsapp" | "instagram" | "facebook" | "telegram" | "twitter";

// Configuração de ícones por plataforma
const platformIcons: Record<Platform, string> = {
  whatsapp: "📱",
  instagram: "📸",
  facebook: "👥",
  telegram: "✈️",
  twitter: "🐦",
};

// Horários de pico (exemplo para Brasil)
const peakHours = [
  { hour: 10, label: "10:00" },
  { hour: 12, label: "12:00" },
  { hour: 14, label: "14:00" },
  { hour: 19, label: "19:00" },
  { hour: 21, label: "21:00" },
];

export const socialRouter = router({
  // ============ SOCIAL ACCOUNTS ============

  /**
   * Listar contas sociais vinculadas
   */
  listSocialAccounts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    return await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, ctx.user.id))
      .orderBy(desc(socialAccounts.createdAt));
  }),

  /**
   * Adicionar conta social
   */
  addSocialAccount: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["whatsapp", "instagram", "facebook", "telegram", "twitter"]),
        accountId: z.string().optional(),
        accountName: z.string().optional(),
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const newAccount: InsertSocialAccount = {
        userId: ctx.user.id,
        platform: input.platform,
        accountId: input.accountId || null,
        accountName: input.accountName || null,
        accessToken: input.accessToken || null,
        refreshToken: input.refreshToken || null,
        status: "active",
      };

      const result = await db.insert(socialAccounts).values(newAccount);
      const accountId = (result as any).insertId;

      await createNotification({
        userId: ctx.user.id,
        type: "social_account_added",
        title: "Conta Social Vinculada",
        content: `${platformIcons[input.platform]} ${input.platform} foi vinculado com sucesso.`,
        read: 0,
      });

      return {
        id: accountId,
        ...newAccount,
      };
    }),

  /**
   * Atualizar status da conta social
   */
  updateSocialAccountStatus: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        status: z.enum(["active", "inactive", "expired", "error"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await db
        .update(socialAccounts)
        .set({ status: input.status })
        .where(
          and(
            eq(socialAccounts.id, input.accountId),
            eq(socialAccounts.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Remover conta social
   */
  removeSocialAccount: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await db
        .delete(socialAccounts)
        .where(
          and(
            eq(socialAccounts.id, input.accountId),
            eq(socialAccounts.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // ============ CONTENT CALENDAR ============

  /**
   * Listar posts agendados
   */
  listScheduledPosts: protectedProcedure
    .input(
      z.object({
        status: z.enum(["draft", "scheduled", "published", "failed", "cancelled"]).optional(),
        platform: z.string().optional(),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(contentCalendar.userId, ctx.user.id)];

      if (input?.status) {
        conditions.push(eq(contentCalendar.status, input.status));
      }

      const posts = await db
        .select()
        .from(contentCalendar)
        .where(and(...conditions))
        .orderBy(desc(contentCalendar.scheduledFor))
        .limit(input?.limit || 50);

      // Filtrar por plataforma se especificado
      if (input?.platform) {
        return posts.filter(post => {
          const platforms = post.platforms as string[];
          return platforms.includes(input.platform!);
        });
      }

      return posts;
    }),

  /**
   * Criar post agendado
   */
  createScheduledPost: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        content: z.string().min(1, "Conteúdo é obrigatório"),
        platforms: z.array(z.string()).min(1, "Selecione pelo menos uma plataforma"),
        scheduledFor: z.string(), // ISO date string
        timezone: z.string().default("America/Sao_Paulo"),
        mediaUrls: z.array(z.string()).optional(),
        hashtags: z.array(z.string()).optional(),
        mentions: z.array(z.string()).optional(),
        linkUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Validar plataformas
      const validPlatforms = ["whatsapp", "instagram", "facebook", "telegram", "twitter"];
      const invalidPlatforms = input.platforms.filter(p => !validPlatforms.includes(p));
      if (invalidPlatforms.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Plataformas inválidas: ${invalidPlatforms.join(", ")}`,
        });
      }

      const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newPost: InsertContentCalendar = {
        id: postId,
        userId: ctx.user.id,
        title: input.title || null,
        content: input.content,
        platforms: input.platforms,
        scheduledFor: new Date(input.scheduledFor),
        timezone: input.timezone,
        status: "scheduled",
        mediaUrls: input.mediaUrls || null,
        hashtags: input.hashtags || null,
        mentions: input.mentions || null,
        linkUrl: input.linkUrl || null,
      };

      await db.insert(contentCalendar).values(newPost);

      await createNotification({
        userId: ctx.user.id,
        type: "post_scheduled",
        title: "Post Agendado",
        content: `Seu post foi agendado para ${input.platforms.map(p => platformIcons[p as Platform] || "").join(" ")}`,
        read: 0,
      });

      return {
        id: postId,
        ...newPost,
      };
    }),

  /**
   * Atualizar post agendado
   */
  updateScheduledPost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().optional(),
        platforms: z.array(z.string()).optional(),
        scheduledFor: z.string().optional(),
        status: z.enum(["draft", "scheduled", "published", "failed", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const updates: Partial<InsertContentCalendar> = {};

      if (input.content) updates.content = input.content;
      if (input.platforms) updates.platforms = input.platforms;
      if (input.scheduledFor) updates.scheduledFor = new Date(input.scheduledFor);
      if (input.status) updates.status = input.status;

      await db
        .update(contentCalendar)
        .set(updates)
        .where(
          and(
            eq(contentCalendar.id, input.postId),
            eq(contentCalendar.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Cancelar post agendado
   */
  cancelScheduledPost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await db
        .update(contentCalendar)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(contentCalendar.id, input.postId),
            eq(contentCalendar.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Obter estatísticas de posts
   */
  getPostStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    // Contar posts por status
    const allPosts = await db
      .select()
      .from(contentCalendar)
      .where(eq(contentCalendar.userId, ctx.user.id));

    const stats = {
      total: allPosts.length,
      scheduled: allPosts.filter(p => p.status === "scheduled").length,
      published: allPosts.filter(p => p.status === "published").length,
      failed: allPosts.filter(p => p.status === "failed").length,
      cancelled: allPosts.filter(p => p.status === "cancelled").length,
      byPlatform: {} as Record<string, number>,
    };

    // Contar por plataforma
    allPosts.forEach(post => {
      const platforms = post.platforms as string[];
      platforms.forEach(platform => {
        stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
      });
    });

    return stats;
  }),

  /**
   * Obter horários de pico recomendados
   */
  getPeakHours: protectedProcedure.query(() => {
    return peakHours;
  }),

  // ============ TRACKING LINKS ============

  /**
   * Criar link de rastreamento
   */
  createTrackingLink: protectedProcedure
    .input(
      z.object({
        affiliateId: z.number().optional(),
        linkType: z.enum(["affiliate", "product", "landing", "promo", "social"]),
        source: z.string().optional(),
        medium: z.string().optional(),
        campaign: z.string().optional(),
        destinationUrl: z.string().url("URL de destino inválida"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Obter affiliateId se não fornecido
      let affiliateId = input.affiliateId;
      if (!affiliateId) {
        const affiliate = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.userId, ctx.user.id))
          .limit(1);
        affiliateId = affiliate[0]?.id;
      }

      if (!affiliateId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate profile not found",
        });
      }

      // Gerar short code
      const shortCode = Math.random().toString(36).substr(2, 8);
      const linkId = `link_${Date.now()}_${shortCode}`;

      const newLink: InsertTrackingLink = {
        id: linkId,
        affiliateId,
        linkType: input.linkType,
        source: input.source || null,
        medium: input.medium || null,
        campaign: input.campaign || null,
        destinationUrl: input.destinationUrl,
        shortCode,
      };

      await db.insert(trackingLinks).values(newLink);

      return {
        id: linkId,
        shortCode,
        destinationUrl: input.destinationUrl,
        trackingUrl: `/r/${shortCode}`,
      };
    }),

  /**
   * Listar links de rastreamento
   */
  listTrackingLinks: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.userId, ctx.user.id))
        .limit(1);

      if (affiliate.length === 0) return [];

      return await db
        .select()
        .from(trackingLinks)
        .where(eq(trackingLinks.affiliateId, affiliate[0].id))
        .orderBy(desc(trackingLinks.createdAt))
        .limit(input?.limit || 50);
    }),

  /**
   * Obter métricas de um link
   */
  getLinkMetrics: protectedProcedure
    .input(z.object({ linkId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const link = await db
        .select()
        .from(trackingLinks)
        .where(eq(trackingLinks.id, input.linkId))
        .limit(1);

      if (link.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tracking link not found",
        });
      }

      // Obter eventos de conversão
      const events = await db
        .select()
        .from(conversionEvents)
        .where(eq(conversionEvents.trackingLinkId, input.linkId));

      return {
        ...link[0],
        events: events.length,
        conversions: events.filter(e => e.eventType === "purchase").length,
        clicks: events.filter(e => e.eventType === "click").length,
      };
    }),

  // ============ CONVERSION EVENTS ============

  /**
   * Registrar evento de conversão
   */
  registerConversion: protectedProcedure
    .input(
      z.object({
        trackingLinkId: z.string(),
        visitorId: z.string().optional(),
        eventType: z.enum(["click", "view", "signup", "purchase", "lead"]),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const link = await db
        .select()
        .from(trackingLinks)
        .where(eq(trackingLinks.id, input.trackingLinkId))
        .limit(1);

      if (link.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tracking link not found",
        });
      }

      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newEvent: InsertConversionEvent = {
        id: eventId,
        trackingLinkId: input.trackingLinkId,
        affiliateId: link[0].affiliateId,
        eventType: input.eventType,
        visitorId: input.visitorId || null,
        metadata: input.metadata || null,
      };

      await db.insert(conversionEvents).values(newEvent);

      // Atualizar contadores do link
      await db
        .update(trackingLinks)
        .set({
          clickCount: link[0].clickCount + 1,
          uniqueClickCount: input.visitorId ? link[0].uniqueClickCount + 1 : link[0].uniqueClickCount,
        })
        .where(eq(trackingLinks.id, input.trackingLinkId));

      return { success: true, eventId };
    }),

  // ============ PERFORMANCE ============

  /**
   * Obter performance do afiliado
   */
  getPerformance: protectedProcedure
    .input(
      z.object({
        period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
        days: z.number().default(30),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.userId, ctx.user.id))
        .limit(1);

      if (affiliate.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate profile not found",
        });
      }

      const days = input?.days || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Buscar eventos de conversão no período
      const events = await db
        .select()
        .from(conversionEvents)
        .where(
          and(
            eq(conversionEvents.affiliateId, affiliate[0].id),
            gte(conversionEvents.createdAt, startDate)
          )
        );

      // Calcular métricas
      const clicks = events.filter(e => e.eventType === "click").length;
      const views = events.filter(e => e.eventType === "view").length;
      const conversions = events.filter(e => ["purchase", "signup", "lead"].includes(e.eventType)).length;
      const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

      // Agrupar por canal (source)
      const byChannel: Record<string, number> = {};
      events.forEach(event => {
        const source = event.referrer || "direct";
        byChannel[source] = (byChannel[source] || 0) + 1;
      });

      // Encontrar melhor canal
      let topChannel = "";
      let maxChannelCount = 0;
      Object.entries(byChannel).forEach(([channel, count]) => {
        if (count > maxChannelCount) {
          maxChannelCount = count;
          topChannel = channel;
        }
      });

      return {
        affiliateId: affiliate[0].id,
        period: input?.period || "daily",
        startDate,
        endDate: new Date(),
        totalClicks: clicks,
        uniqueClicks: events.filter(e => e.visitorId).length,
        conversions,
        conversionRate: conversionRate.toFixed(2),
        topChannel,
        byChannel,
        eventsCount: events.length,
      };
    }),

  // ============ ADMIN ============

  /**
   * Admin: Listar todos os posts agendados
   */
  adminListAllPosts: adminProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().default(100) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      if (input?.status) {
        return await db
          .select()
          .from(contentCalendar)
          .where(eq(contentCalendar.status, input.status as any))
          .orderBy(desc(contentCalendar.scheduledFor))
          .limit(input?.limit || 100);
      }

      return await db
        .select()
        .from(contentCalendar)
        .orderBy(desc(contentCalendar.scheduledFor))
        .limit(input?.limit || 100);
    }),

  /**
   * Admin: Obter estatísticas globais de tracking
   */
  adminGetGlobalStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const allLinks = await db.select().from(trackingLinks);
    const allEvents = await db.select().from(conversionEvents);

    const totalClicks = allEvents.filter(e => e.eventType === "click").length;
    const totalConversions = allEvents.filter(e => ["purchase", "signup", "lead"].includes(e.eventType)).length;

    return {
      totalLinks: allLinks.length,
      totalClicks,
      totalConversions,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : "0",
      topAffiliate: null, // Será implementado com agregação
      platformStats: {
        whatsapp: allLinks.filter(l => l.source === "whatsapp").length,
        instagram: allLinks.filter(l => l.source === "instagram").length,
        facebook: allLinks.filter(l => l.source === "facebook").length,
      },
    };
  }),
});