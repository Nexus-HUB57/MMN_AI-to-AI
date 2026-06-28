/**
 * Nexus Affil'IA'te · A2A Handshake Protocol
 *
 * Implementa o handshake assinado entre agentes (AI-to-AI):
 *   1. Cliente envia `A2AHandshakeRequest` com nonce + capability filter.
 *   2. Servidor responde com `A2AHandshakeResponse` incluindo Agent Card assinado.
 *   3. Cliente verifica assinatura JWS e estabelece sessão.
 *
 * Versão MVP: assinatura HMAC-SHA256 (compatível com a especificação JWS HS256).
 * Próxima fase (M3): troca para EdDSA com chaves ed25519 por nó.
 *
 * @module agentic/a2a/handshake
 */
import crypto from "node:crypto";
import { z } from "zod";
import { a2aAgentCardSchema, type A2AAgentCard } from "./agentCard";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas de mensagem
// ─────────────────────────────────────────────────────────────────────────────

export const handshakeRequestSchema = z.object({
  specVersion: z.literal("1.0").default("1.0"),
  callerAgentId: z.string().min(1),
  callerTenantId: z.string().default("anonymous"),
  nonce: z.string().min(16).max(128),
  requestedSkills: z.array(z.string()).optional(),
  timestamp: z.string().datetime(),
});

export const handshakeResponseSchema = z.object({
  specVersion: z.literal("1.0").default("1.0"),
  agentCard: a2aAgentCardSchema,
  signature: z.string().min(20),
  nonceEcho: z.string(),
  sessionId: z.string().min(8),
  validUntil: z.string().datetime(),
});

export type A2AHandshakeRequest = z.infer<typeof handshakeRequestSchema>;
export type A2AHandshakeResponse = z.infer<typeof handshakeResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Assinatura JWS-HS256 (MVP)
// ─────────────────────────────────────────────────────────────────────────────

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Cria um JWS HS256 sobre o payload (Agent Card + nonce + session).
 * Em produção (M3) trocar HMAC por EdDSA.
 */
export function signHandshakePayload(
  payload: object,
  secret: string,
): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWS" }));
  const body = b64url(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest();
  return `${signingInput}.${b64url(sig)}`;
}

export function verifyHandshakePayload(
  token: string,
  secret: string,
): { ok: true; payload: any } | { ok: false; reason: string } {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed-jws" };
  const [h, b, s] = parts;
  const signingInput = `${h}.${b}`;
  const expected = b64url(
    crypto.createHmac("sha256", secret).update(signingInput).digest(),
  );
  if (s !== expected) return { ok: false, reason: "bad-signature" };
  try {
    const payload = JSON.parse(
      Buffer.from(b, "base64").toString("utf8"),
    );
    return { ok: true, payload };
  } catch {
    return { ok: false, reason: "malformed-payload" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Núcleo do handshake
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SESSION_TTL_MIN = 30;

export interface HandshakeContext {
  agentCard: A2AAgentCard;
  secret: string;
  sessionTtlMinutes?: number;
}

/**
 * Processa uma requisição de handshake.
 * Retorna a resposta assinada + sessionId.
 */
export function processHandshake(
  raw: unknown,
  ctx: HandshakeContext,
): A2AHandshakeResponse {
  const request = handshakeRequestSchema.parse(raw);
  const ttl = ctx.sessionTtlMinutes ?? DEFAULT_SESSION_TTL_MIN;
  const sessionId = crypto.randomBytes(12).toString("hex");
  const validUntil = new Date(Date.now() + ttl * 60_000).toISOString();

  // Filtrar skills se o caller pediu subset específico
  let scopedCard = ctx.agentCard;
  if (request.requestedSkills?.length) {
    const requested = new Set(request.requestedSkills);
    scopedCard = {
      ...ctx.agentCard,
      skills: ctx.agentCard.skills.filter((s) => requested.has(s.slug)),
    };
  }

  const payloadToSign = {
    agentCard: scopedCard,
    nonceEcho: request.nonce,
    sessionId,
    validUntil,
    callerAgentId: request.callerAgentId,
    callerTenantId: request.callerTenantId,
  };

  const signature = signHandshakePayload(payloadToSign, ctx.secret);

  return handshakeResponseSchema.parse({
    specVersion: "1.0",
    agentCard: scopedCard,
    signature,
    nonceEcho: request.nonce,
    sessionId,
    validUntil,
  });
}

/**
 * Verifica uma resposta de handshake recebida de outro agente.
 */
export function verifyHandshakeResponse(
  response: A2AHandshakeResponse,
  expectedNonce: string,
  secret: string,
): { ok: true } | { ok: false; reason: string } {
  if (response.nonceEcho !== expectedNonce) {
    return { ok: false, reason: "nonce-mismatch" };
  }
  if (new Date(response.validUntil).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  const verified = verifyHandshakePayload(response.signature, secret);
  if (!verified.ok) return verified;
  if (verified.payload.nonceEcho !== expectedNonce) {
    return { ok: false, reason: "payload-nonce-mismatch" };
  }
  return { ok: true };
}
