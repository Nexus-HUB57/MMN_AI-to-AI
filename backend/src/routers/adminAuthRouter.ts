import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";
import { z } from "zod";

import { publicProcedure, router } from "../trpc/trpc";

/**
 * Admin Auth Router
 * -----------------------------------------------------------------------------
 * Validação centralizada no backend para acesso ao Backoffice Admin do
 * Nexus Affil'IA'te (IOAID · SaaS).
 *
 * Regras operacionais:
 *  - Nenhuma credencial em texto puro vive no código ou no bundle do cliente.
 *  - O backend só aceita o login admin quando ADMIN_EMAIL_SHA256 e
 *    ADMIN_PASSWORD_SHA256 estão definidos via variáveis de ambiente.
 *  - A sessão emitida é assinada com ADMIN_SESSION_SECRET (HMAC-SHA256) e tem
 *    expiração padrão de 12 horas, podendo ser revalidada via `verify`.
 *  - O identificador `subject` é sempre genérico (`nexus-admin-core`) para
 *    preservar o mascaramento da Equipe Nexus Affil'IA'te na UI.
 */

const DEFAULT_TTL_SECONDS = 12 * 60 * 60; // 12h
const ADMIN_SUBJECT = "nexus-admin-core";
const ADMIN_DISPLAY_LABEL = "Lucas Thomaz";

interface AdminTokenPayload {
  sub: typeof ADMIN_SUBJECT;
  iat: number;
  exp: number;
  scope: "admin";
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function base64UrlEncode(input: Buffer | string): string {
  const buffer = typeof input === "string" ? Buffer.from(input) : input;
  return buffer
    .toString("base64")
    .replace(/=+$/u, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value: string): Buffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Backend ainda não configurado: defina ADMIN_SESSION_SECRET (>=16 caracteres) para habilitar o login administrativo.",
    });
  }
  return secret;
}

function getExpectedHashes(): { email: string; password: string } {
  const email = process.env.ADMIN_EMAIL_SHA256;
  const password = process.env.ADMIN_PASSWORD_SHA256;
  if (!email || !password || email.length !== 64 || password.length !== 64) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Backend ainda não configurado: defina ADMIN_EMAIL_SHA256 e ADMIN_PASSWORD_SHA256 (SHA-256 hex, 64 chars).",
    });
  }
  return { email, password };
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

function signAdminToken(ttlSeconds = DEFAULT_TTL_SECONDS): {
  token: string;
  expiresAt: string;
} {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminTokenPayload = {
    sub: ADMIN_SUBJECT,
    iat: now,
    exp: now + ttlSeconds,
    scope: "admin",
  };
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "NXS-ADM" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode(
    crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest(),
  );
  return {
    token: `${header}.${body}.${signature}`,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

function verifyAdminToken(token: string): AdminTokenPayload {
  if (!token || token.split(".").length !== 3) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Token administrativo inválido." });
  }
  const secret = getSecret();
  const [header, body, signature] = token.split(".");
  const expected = base64UrlEncode(
    crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest(),
  );
  if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Assinatura administrativa inválida." });
  }
  let payload: AdminTokenPayload;
  try {
    payload = JSON.parse(base64UrlDecode(body).toString("utf8")) as AdminTokenPayload;
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Token administrativo corrompido." });
  }
  if (payload.sub !== ADMIN_SUBJECT || payload.scope !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Escopo administrativo inválido." });
  }
  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão administrativa expirada." });
  }
  return payload;
}

export const adminAuthRouter = router({
  /**
   * Indica se o backend está configurado para autenticação administrativa.
   * Usado pelo frontend para decidir entre fluxo server-side ou fallback local.
   */
  status: publicProcedure.query(() => {
    const ready =
      Boolean(process.env.ADMIN_SESSION_SECRET) &&
      Boolean(process.env.ADMIN_EMAIL_SHA256) &&
      Boolean(process.env.ADMIN_PASSWORD_SHA256);
    return {
      ready,
      ttlSeconds: DEFAULT_TTL_SECONDS,
      subject: ADMIN_SUBJECT,
      displayLabel: ADMIN_DISPLAY_LABEL,
    };
  }),

  /**
   * Autentica credenciais administrativas. O cliente envia o e-mail e a senha
   * já normalizados (lower-case, sem espaços), o backend computa SHA-256 e
   * compara com os hashes esperados em variáveis de ambiente. Em caso de
   * sucesso retorna token assinado e timestamp de expiração.
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().min(5).max(254),
        password: z.string().min(8).max(256),
      }),
    )
    .mutation(({ input }) => {
      const { email, password } = getExpectedHashes();
      const emailHash = sha256(input.email.trim().toLowerCase());
      const passwordHash = sha256(input.password);

      const emailOk = timingSafeEqualHex(emailHash, email);
      const passwordOk = timingSafeEqualHex(passwordHash, password);

      if (!emailOk || !passwordOk) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Credenciais administrativas inválidas.",
        });
      }

      const { token, expiresAt } = signAdminToken();
      return {
        success: true,
        token,
        expiresAt,
        subject: ADMIN_SUBJECT,
        displayLabel: ADMIN_DISPLAY_LABEL,
        scope: "admin" as const,
      };
    }),

  /**
   * Revalida um token administrativo previamente emitido. Útil para o
   * frontend reidratar a sessão após reload sem reapresentar credenciais.
   */
  verify: publicProcedure
    .input(z.object({ token: z.string().min(20) }))
    .query(({ input }) => {
      const payload = verifyAdminToken(input.token);
      return {
        valid: true,
        subject: payload.sub,
        scope: payload.scope,
        issuedAt: new Date(payload.iat * 1000).toISOString(),
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        displayLabel: ADMIN_DISPLAY_LABEL,
      };
    }),
});
