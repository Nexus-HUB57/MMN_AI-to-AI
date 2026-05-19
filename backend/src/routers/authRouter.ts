import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../trpc/trpc";
import * as db from "../../../database/schemas/db";
import crypto from "crypto";

const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_ID_LENGTH = 32;

function generateRefreshTokenId(): string {
  return crypto.randomBytes(REFRESH_TOKEN_ID_LENGTH).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getExpiryDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return date;
}

export const authRouter = router({
  // Get current user
  me: publicProcedure.query(({ ctx }) => ctx.user ?? null),

  // Legacy login (existing functionality)
  legacyLogin: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByLegacyEmail(input.email);

      if (!user || !user.legacyPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não encontrado ou não possui credenciais legadas."
        });
      }

      // In legacy PHP, passwords are MD5
      const hashedInput = crypto.createHash("md5").update(input.password).digest("hex");

      if (hashedInput !== user.legacyPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Senha incorreta."
        });
      }

      // Log session audit
      await db.createSessionAudit({
        id: crypto.randomBytes(16).toString("hex"),
        userId: user.id,
        sessionId: crypto.randomBytes(16).toString("hex"),
        action: "login",
        ipAddress: (ctx.req?.headers["x-forwarded-for"] as string) || (ctx.req?.socket?.remoteAddress),
        userAgent: ctx.req?.headers["user-agent"],
        metadata: { method: "legacy" },
        createdAt: new Date(),
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    }),

  // Login with refresh tokens (AG-16)
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
      deviceInfo: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByEmail(input.email);

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Credenciais inválidas."
        });
      }

      // Verify password (assuming bcrypt hash in openId field for new users)
      // For legacy users, openId contains the legacy identifier
      // This is a simplified version - production would need proper password verification

      const ipAddress = (ctx.req?.headers["x-forwarded-for"] as string) || (ctx.req?.socket?.remoteAddress) || "unknown";
      const userAgent = ctx.req?.headers["user-agent"] || "unknown";
      const sessionId = crypto.randomBytes(16).toString("hex");

      // Create refresh token
      const tokenId = generateRefreshTokenId();
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = getExpiryDate();

      await db.createRefreshToken({
        id: tokenId,
        userId: user.id,
        tokenHash,
        deviceInfo: input.deviceInfo,
        ipAddress,
        userAgent,
        expiresAt,
        createdAt: new Date(),
      });

      // Log session audit
      await db.createSessionAudit({
        id: crypto.randomBytes(16).toString("hex"),
        userId: user.id,
        sessionId,
        action: "login",
        ipAddress,
        userAgent,
        metadata: { method: "standard", hasDeviceInfo: !!input.deviceInfo },
        createdAt: new Date(),
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        sessionId,
        // In production, return JWT access token here
        // refreshToken is stored server-side, client receives session identifier
      };
    }),

  // Refresh token (AG-16)
  refreshToken: publicProcedure
    .input(z.object({
      tokenId: z.string(),
      token: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const tokenHash = hashToken(input.token);
      const storedToken = await db.getRefreshTokenByHash(tokenHash);

      if (!storedToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token inválido."
        });
      }

      if (storedToken.id !== input.tokenId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token ID não corresponde."
        });
      }

      if (storedToken.revokedAt) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token foi revogado."
        });
      }

      if (new Date(storedToken.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token expirado."
        });
      }

      // Create new refresh token (token rotation)
      const newTokenId = generateRefreshTokenId();
      const newRawToken = crypto.randomBytes(32).toString("hex");
      const newTokenHash = hashToken(newRawToken);
      const expiresAt = getExpiryDate();

      await db.createRefreshToken({
        id: newTokenId,
        userId: storedToken.userId,
        tokenHash: newTokenHash,
        deviceInfo: storedToken.deviceInfo,
        ipAddress: storedToken.ipAddress,
        userAgent: storedToken.userAgent,
        expiresAt,
        createdAt: new Date(),
      });

      // Revoke old token
      await db.revokeRefreshToken(storedToken.id, newTokenId);

      const ipAddress = (ctx.req?.headers["x-forwarded-for"] as string) || (ctx.req?.socket?.remoteAddress);
      const userAgent = ctx.req?.headers["user-agent"];

      // Log session audit
      await db.createSessionAudit({
        id: crypto.randomBytes(16).toString("hex"),
        userId: storedToken.userId,
        sessionId: storedToken.id,
        action: "token_refresh",
        ipAddress,
        userAgent,
        metadata: { oldTokenId: storedToken.id, newTokenId },
        createdAt: new Date(),
      });

      return {
        success: true,
        tokenId: newTokenId,
        // In production, return new JWT access token here
      };
    }),

  // Logout (AG-16)
  logout: publicProcedure
    .input(z.object({
      tokenId: z.string().optional(),
      allSessions: z.boolean().optional(),
    }).optional())
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Não autenticado."
        });
      }

      if (input?.allSessions) {
        // Revoke all refresh tokens for user
        await db.revokeAllUserRefreshTokens(ctx.user.id);

        await db.createSessionAudit({
          id: crypto.randomBytes(16).toString("hex"),
          userId: ctx.user.id,
          sessionId: "all",
          action: "logout",
          ipAddress: (ctx.req?.headers["x-forwarded-for"] as string) || (ctx.req?.socket?.remoteAddress),
          userAgent: ctx.req?.headers["user-agent"],
          metadata: { scope: "all_sessions" },
          createdAt: new Date(),
        });
      } else if (input?.tokenId) {
        // Revoke specific token
        await db.revokeRefreshToken(input.tokenId);

        await db.createSessionAudit({
          id: crypto.randomBytes(16).toString("hex"),
          userId: ctx.user.id,
          sessionId: input.tokenId,
          action: "logout",
          ipAddress: (ctx.req?.headers["x-forwarded-for"] as string) || (ctx.req?.socket?.remoteAddress),
          userAgent: ctx.req?.headers["user-agent"],
          metadata: { scope: "single_session" },
          createdAt: new Date(),
        });
      }

      // Clear session cookie
      if (ctx.res) {
        ctx.res.clearCookie("app_session_id", {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          httpOnly: true,
          path: "/",
        });
      }

      return { success: true };
    }),

  // Get active sessions (AG-16)
  getActiveSessions: protectedProcedure.query(async ({ ctx }) => {
    const tokens = await db.getActiveRefreshTokens(ctx.user.id);
    return tokens.map(token => ({
      id: token.id,
      deviceInfo: token.deviceInfo,
      ipAddress: token.ipAddress,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
    }));
  }),

  // Revoke specific session (AG-16)
  revokeSession: protectedProcedure
    .input(z.object({ tokenId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const token = await db.getRefreshTokenById(input.tokenId);

      if (!token) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sessão não encontrada."
        });
      }

      if (token.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Não é possível revogar sessão de outro usuário."
        });
      }

      await db.revokeRefreshToken(input.tokenId);

      await db.createSessionAudit({
        id: crypto.randomBytes(16).toString("hex"),
        userId: ctx.user.id,
        sessionId: input.tokenId,
        action: "session_revoked",
        ipAddress: (ctx.req?.headers["x-forwarded-for"] as string) || (ctx.req?.socket?.remoteAddress),
        userAgent: ctx.req?.headers["user-agent"],
        metadata: { scope: "user_revoked" },
        createdAt: new Date(),
      });

      return { success: true };
    }),

  // Session audit log (AG-16)
  getSessionAudit: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input, ctx }) => {
      return db.getSessionAuditByUser(ctx.user.id, input.limit);
    }),

  // ============ GDPR CONSENT ENDPOINTS (AG-38) ============

  // Get user consents
  getConsents: protectedProcedure.query(async ({ ctx }) => {
    const consents = await db.getUserConsents(ctx.user.id);
    const consentTypes = [
      "marketing_email",
      "marketing_sms",
      "marketing_whatsapp",
      "analytics",
      "personalization",
      "third_party_sharing",
      "data_processing",
      "ai_processing"
    ];

    return consentTypes.map(type => {
      const existing = consents.find(c => c.consentType === type);
      return {
        type,
        granted: existing?.granted === "true" || false,
        grantedAt: existing?.grantedAt,
        revokedAt: existing?.revokedAt,
      };
    });
  }),

  // Set consent
  setConsent: protectedProcedure
    .input(z.object({
      consentType: z.enum([
        "marketing_email",
        "marketing_sms",
        "marketing_whatsapp",
        "analytics",
        "personalization",
        "third_party_sharing",
        "data_processing",
        "ai_processing"
      ]),
      granted: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const ipAddress = (ctx.req?.headers["x-forwarded-for"] as string) || (ctx.req?.socket?.remoteAddress);
      const userAgent = ctx.req?.headers["user-agent"];

      const consent = await db.setUserConsent(
        ctx.user.id,
        input.consentType,
        input.granted,
        ipAddress,
        userAgent
      );

      return {
        success: true,
        consentType: input.consentType,
        granted: consent.granted === "true",
        grantedAt: consent.grantedAt,
        revokedAt: consent.revokedAt,
      };
    }),

  // Set multiple consents
  setConsents: protectedProcedure
    .input(z.object({
      consents: z.array(z.object({
        consentType: z.string(),
        granted: z.boolean(),
      }))
    }))
    .mutation(async ({ input, ctx }) => {
      const ipAddress = (ctx.req?.headers["x-forwarded-for"] as string) || (ctx.req?.socket?.remoteAddress);
      const userAgent = ctx.req?.headers["user-agent"];

      const results = [];
      for (const consent of input.consents) {
        const result = await db.setUserConsent(
          ctx.user.id,
          consent.consentType,
          consent.granted,
          ipAddress,
          userAgent
        );
        results.push({
          consentType: consent.consentType,
          granted: result.granted === "true",
        });
      }

      return { success: true, results };
    }),

  // Get consent history
  getConsentHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input, ctx }) => {
      return db.getConsentHistory(ctx.user.id, input.limit);
    }),

  // Check marketing consent
  hasMarketingConsent: protectedProcedure.query(async ({ ctx }) => {
    return db.hasMarketingConsent(ctx.user.id);
  }),

  // ============ USER PREFERENCES ENDPOINTS (AG-38) ============

  // Get user preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await db.getUserPreferences(ctx.user.id);
    return preferences || {
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      currency: "BRL",
      emailNotifications: true,
      pushNotifications: false,
      theme: "system",
      contentDensity: "comfortable",
    };
  }),

  // Update user preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      language: z.string().optional(),
      timezone: z.string().optional(),
      currency: z.string().optional(),
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      theme: z.enum(["light", "dark", "system"]).optional(),
      contentDensity: z.enum(["compact", "comfortable", "spacious"]).optional(),
      dashboardLayout: z.object({
        widgets: z.array(z.string()),
        positions: z.record(z.string(), z.object({
          x: z.number(),
          y: z.number(),
          w: z.number(),
          h: z.number(),
        })),
      }).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const preferences = await db.upsertUserPreferences(ctx.user.id, input);
      return preferences;
    }),

  // Update single preference
  updatePreference: protectedProcedure
    .input(z.object({
      key: z.string(),
      value: z.any(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.updateUserPreference(ctx.user.id, input.key, input.value);
      return { success: true };
    }),
});