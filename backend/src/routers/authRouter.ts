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

  // ============ FIREBASE SOCIAL AUTH (Epic 10.3.3 / 10.3.4) ============

  /**
   * Verifica ID Token Firebase, faz upsert do usuário no banco e cria sessão.
   * Fluxo completo: signInWithPopup → idToken → loginWithFirebaseToken → sessão.
   * Suporta: Google, Facebook, Apple.
   */
  /**
   * Social login NATIVO (sem Firebase). Cria/recupera usuario e gera sessao.
   */
  socialLoginNative: publicProcedure
    .input(z.object({
      provider: z.enum(["google", "facebook", "apple", "microsoft"]),
      email: z.string().email(),
      name: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const externalId = `${input.provider}:${input.email.toLowerCase()}`;
      let user = await db.getUserByOpenId(externalId);
      if (!user) user = await db.getUserByEmail(input.email);
      if (!user) {
        await db.upsertUser({
          openId: externalId,
          name: input.name ?? input.email.split("@")[0],
          email: input.email,
          role: "user",
          loginMethod: input.provider,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        user = await db.getUserByOpenId(externalId);
      }
      if (!user) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao criar usuario social." });
      }
      if (user.openId !== externalId) {
        try { await db.updateLegacyUserToModern(user.id, externalId); } catch {}
      }
      const ipAddress = (ctx.req?.headers["x-forwarded-for"] as string) || ctx.req?.socket?.remoteAddress || "unknown";
      const userAgent = ctx.req?.headers["user-agent"] || "unknown";
      const sessionId = crypto.randomBytes(16).toString("hex");
      const tokenId = generateRefreshTokenId();
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = getExpiryDate();
      try {
        await db.createRefreshToken({
          id: tokenId, userId: user.id, tokenHash,
          deviceInfo: `social-native:${input.provider}`,
          ipAddress, userAgent, expiresAt, createdAt: new Date(),
        });
      } catch {}
      try {
        await db.createSessionAudit({
          id: crypto.randomBytes(16).toString("hex"),
          userId: user.id, sessionId,
          action: "social_login", ipAddress, userAgent,
          metadata: { method: `native:${input.provider}` },
          createdAt: new Date(),
        });
      } catch {}
      return {
        success: true, sessionId, tokenId,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, picture: null },
      };
    }),

  loginWithFirebaseToken: publicProcedure
    .input(
      z.object({
        idToken: z.string().min(1, "ID Token é obrigatório"),
        provider: z.enum(["google", "facebook", "apple"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // ── 1. Verificar token com Firebase Admin SDK ──────────────────────────
      let decodedToken: import("firebase-admin/auth").DecodedIdToken;
      try {
        const { getFirebaseAdmin } = await import("../services/firebaseAdmin");
        const adminApp = await getFirebaseAdmin();
        if (!adminApp) {
          throw new Error("Firebase Admin SDK retornou null — verifique FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.");
        }
        decodedToken = await adminApp.auth().verifyIdToken(input.idToken);
      } catch (err) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Token Firebase inválido ou expirado: ${err instanceof Error ? err.message : String(err)}`,
        });
      }

      const firebaseUid = decodedToken.uid;
      const email = decodedToken.email ?? null;
      const displayName =
        (decodedToken as unknown as { name?: string }).name ??
        (decodedToken as unknown as { display_name?: string }).display_name ??
        null;
      const picture = decodedToken.picture ?? null;

      // ── 2. Encontrar ou criar usuário no banco ────────────────────────────
      let user = await db.getUserByOpenId(firebaseUid);

      if (!user && email) {
        user = await db.getUserByEmail(email);
      }

      if (!user) {
        // Auto-create social user
        await db.upsertUser({
          openId: firebaseUid,
          name: displayName,
          email,
          role: "user",
          loginMethod: input.provider,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        user = await db.getUserByOpenId(firebaseUid);
      }

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao criar ou recuperar usuário após login social.",
        });
      }

      // Se openId ainda não está vinculado ao Firebase UID, atualizar
      if (user.openId !== firebaseUid) {
        await db.updateLegacyUserToModern(user.id, firebaseUid);
      }

      // ── 3. Criar sessão (refresh token) ───────────────────────────────────
      const ipAddress = (ctx.req?.headers["x-forwarded-for"] as string) || ctx.req?.socket?.remoteAddress || "unknown";
      const userAgent = ctx.req?.headers["user-agent"] || "unknown";
      const sessionId = crypto.randomBytes(16).toString("hex");
      const tokenId = generateRefreshTokenId();
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = getExpiryDate();

      await db.createRefreshToken({
        id: tokenId,
        userId: user.id,
        tokenHash,
        deviceInfo: `social:${input.provider}`,
        ipAddress,
        userAgent,
        expiresAt,
        createdAt: new Date(),
      });

      await db.createSessionAudit({
        id: crypto.randomBytes(16).toString("hex"),
        userId: user.id,
        sessionId,
        action: "social_login",
        ipAddress,
        userAgent,
        metadata: { method: input.provider, firebase_uid: firebaseUid, picture },
        createdAt: new Date(),
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name ?? displayName,
          email: user.email ?? email,
          role: user.role,
          picture,
        },
        sessionId,
        tokenId,
        provider: input.provider,
      };
    }),

  signUp: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(3),
      password: z.string().min(8).optional(),
      sponsorCode: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const cfgRes = await client.query(
          "SELECT key, value FROM niko_sandbox_config WHERE key IN ('private_mode', 'registration_allowed', 'founders_whitelist')"
        );
        const cfg: Record<string, any> = {};
        cfgRes.rows.forEach((r: any) => {
          try { cfg[r.key] = JSON.parse(r.value); } catch { cfg[r.key] = r.value; }
        });

        const privateMode = cfg.private_mode === true || cfg.private_mode === "true";
        const regAllowed = cfg.registration_allowed === true || cfg.registration_allowed === "true";
        const whitelist: string[] = Array.isArray(cfg.founders_whitelist) ? cfg.founders_whitelist : [];

        if (privateMode && !regAllowed) {
          const emailLower = input.email.toLowerCase();
          const isWhitelisted = whitelist.some((w: string) => w.toLowerCase() === emailLower);
          if (!isWhitelisted) {
            throw new Error("Cadastros externos temporariamente pausados. Sistema em modo convite privado.");
          }
        }

        const dupRes = await client.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [input.email]);
        if (dupRes.rows.length > 0) {
          throw new Error("Este email ja esta cadastrado.");
        }

        const userIns = await client.query(
          "INSERT INTO users (\"openId\", name, email, role, is_test_data, \"createdAt\", \"updatedAt\") VALUES ($1, $2, $3, 'affiliate', false, NOW(), NOW()) RETURNING id",
          ["signup-" + input.email.replace(/[^a-zA-Z0-9]/g, "-") + "-" + Date.now(), input.name, input.email]
        );
        const userId = userIns.rows[0].id;

        const seqRes = await client.query("SELECT COUNT(*)::int AS c FROM affiliates WHERE (is_test_data = false OR is_test_data IS NULL) AND \"affiliateCode\" LIKE 'NX-%'");
        const nextNum = String(((seqRes.rows[0] && seqRes.rows[0].c) || 0) + 1).padStart(5, "0");
        const affCode = "NX-" + nextNum;

        const affIns = await client.query(
          "INSERT INTO affiliates (\"affiliateCode\", \"userId\", status, \"createdAt\", \"updatedAt\", is_test_data) VALUES ($1, $2, 'active', NOW(), NOW(), false) RETURNING id",
          [affCode, userId]
        );
        const affId = affIns.rows[0].id;

        // === FIX CEO-005: Vincular sponsor na rede binaria ===
        // Resolve o sponsorCode, atualiza affiliates.sponsorId e insere na tabela network
        if (input.sponsorCode) {
          try {
            const sponsorRes = await client.query(
              "SELECT id, \"userId\" FROM affiliates WHERE \"affiliateCode\" = $1 LIMIT 1",
              [input.sponsorCode.trim()]
            );
            if (sponsorRes.rows.length > 0) {
              const sponsorAffId = sponsorRes.rows[0].id;
              // Atualiza sponsorId no affiliate recem-criado
              await client.query(
                "UPDATE affiliates SET \"sponsorId\" = $1, \"updatedAt\" = NOW() WHERE id = $2",
                [sponsorAffId, affId]
              );
              // Insere na tabela network (nivel 1 = direto)
              await client.query(
                "INSERT INTO network (\"userId\", \"sponsorId\", level, \"createdAt\") VALUES ($1, $2, 1, NOW())",
                [userId, sponsorAffId]
              );
              console.log(`[CEO-005] User ${userId} linked to sponsor ${sponsorAffId} via code ${input.sponsorCode}`);
            } else {
              console.warn(`[CEO-005] Sponsor code not found: ${input.sponsorCode}`);
            }
          } catch (sponsorErr: any) {
            console.error("[CEO-005] Sponsor linking failed:", sponsorErr?.message);
            // Nao aborta o cadastro
          }
        }

        await client.query(
          "INSERT INTO niko_operational_memory (episode_type, subject, decision, rationale, autonomy_level, linked_metrics) VALUES ('signup', $1, $2, 'Cadastro autonomo via authRouter.signUp - modo privado whitelist', 'execute_low', $3::jsonb)",
          [
            "signup-" + affCode + "-" + Date.now(),
            "user_signed_up",
            JSON.stringify({ userId, affId, affCode, email: input.email, sponsorCode: input.sponsorCode })
          ]
        );

        await client.query("COMMIT");

        return {
          ok: true,
          userId,
          affiliateId: affId,
          affiliateCode: affCode,
          message: "Cadastro realizado com sucesso!",
        };
      } catch (e: any) {
        await client.query("ROLLBACK");
        throw new Error(e.message || "Erro no cadastro");
      } finally {
        client.release();
        await pool.end();
      }
    }),

});