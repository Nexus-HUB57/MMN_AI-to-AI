/**
 * Nexus Affil'IA'te · A2A Agent Card
 *
 * Especificação do Agent Card — o "passaporte" assinado de cada agente da rede.
 * Padroniza identidade, capacidades e endereço, permitindo descoberta e
 * negociação automática entre agentes (AI-to-AI).
 *
 * Inspirado na proposta `.well-known/agent-card` da W3C Agentic Web.
 *
 * @module agentic/a2a/agentCard
 */
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const a2aSkillSchema = z.object({
  slug: z.string().min(1).max(80),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default("1.0.0"),
  description: z.string().max(280),
  inputContentTypes: z.array(z.string()).default(["application/json"]),
  outputContentTypes: z.array(z.string()).default(["application/json"]),
  pricing: z
    .object({
      model: z.enum(["free", "per-call", "subscription"]).default("free"),
      currency: z.enum(["BRL", "USD", "BTC"]).default("BRL"),
      amountCents: z.number().int().min(0).default(0),
    })
    .optional(),
  rateLimit: z
    .object({
      requestsPerMinute: z.number().int().min(1).default(60),
      burst: z.number().int().min(1).default(10),
    })
    .optional(),
});

export const a2aEndpointSchema = z.object({
  url: z.string().url(),
  protocol: z.enum(["https", "wss"]).default("https"),
  authScheme: z.enum(["none", "jws", "bearer", "mtls"]).default("jws"),
});

export const a2aIdentitySchema = z.object({
  agentId: z.string().min(1),
  agentName: z.string().min(1).max(80),
  operator: z.string().min(1).max(120),
  tenantId: z.string().min(1).default("nexus-root"),
  publicKey: z.string().min(32),
  keyAlgorithm: z.enum(["EdDSA", "ES256", "RS256"]).default("EdDSA"),
});

export const a2aGovernanceSchema = z.object({
  trustLevel: z.enum(["sandbox", "verified", "elite"]).default("sandbox"),
  judgeRequired: z.boolean().default(true),
  zeroTrust: z.boolean().default(true),
  observabilityEndpoint: z.string().url().optional(),
});

export const a2aAgentCardSchema = z.object({
  specVersion: z.literal("1.0").default("1.0"),
  identity: a2aIdentitySchema,
  description: z.string().max(560),
  skills: z.array(a2aSkillSchema).min(1),
  endpoints: z.object({
    invoke: a2aEndpointSchema,
    discover: a2aEndpointSchema,
    health: a2aEndpointSchema,
  }),
  governance: a2aGovernanceSchema,
  metadata: z.object({
    network: z.literal("nexus-affil-iate").default("nexus-affil-iate"),
    region: z.string().default("br-sa1"),
    issuedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
    tags: z.array(z.string()).default([]),
  }),
});

export type A2AAgentCard = z.infer<typeof a2aAgentCardSchema>;
export type A2ASkill = z.infer<typeof a2aSkillSchema>;
export type A2AIdentity = z.infer<typeof a2aIdentitySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Constrói um Agent Card padrão para o nó raiz Nexus Affil'IA'te.
 * Em produção, os campos identity/publicKey vêm do KMS do tenant.
 */
export function buildRootAgentCard(opts: {
  publicKey: string;
  baseUrl: string;
  skills: A2ASkill[];
  expiresInDays?: number;
}): A2AAgentCard {
  const now = new Date();
  const exp = new Date(now.getTime() + (opts.expiresInDays ?? 30) * 86400_000);

  return a2aAgentCardSchema.parse({
    specVersion: "1.0",
    identity: {
      agentId: "nexus-root-orchestrator",
      agentName: "Nexus Root Orchestrator",
      operator: "Nexus Affil'IA'te",
      tenantId: "nexus-root",
      publicKey: opts.publicKey,
      keyAlgorithm: "EdDSA",
    },
    description:
      "Agente raiz do ecossistema Nexus Affil'IA'te. Roteia requisições A2A para skills especializadas e coordena execução com governança SHO + Judge federado.",
    skills: opts.skills,
    endpoints: {
      invoke: {
        url: `${opts.baseUrl}/api/a2a/invoke`,
        protocol: "https",
        authScheme: "jws",
      },
      discover: {
        url: `${opts.baseUrl}/api/a2a/.well-known/agent-card`,
        protocol: "https",
        authScheme: "none",
      },
      health: {
        url: `${opts.baseUrl}/api/health`,
        protocol: "https",
        authScheme: "none",
      },
    },
    governance: {
      trustLevel: "verified",
      judgeRequired: true,
      zeroTrust: true,
      observabilityEndpoint: `${opts.baseUrl}/api/a2a/observability`,
    },
    metadata: {
      network: "nexus-affil-iate",
      region: "br-sa1",
      issuedAt: now.toISOString(),
      expiresAt: exp.toISOString(),
      tags: ["root", "orchestrator", "verified"],
    },
  });
}

/**
 * Skills mínimas que o nó raiz Nexus publica como capability default.
 * Pode ser expandido dinamicamente conforme o catálogo agentic evolui.
 */
export const DEFAULT_ROOT_SKILLS: A2ASkill[] = [
  {
    slug: "copywriter-persuasivo",
    version: "1.0.0",
    description:
      "Gera copy persuasivo calibrado para afiliados em múltiplos canais (WhatsApp, e-mail, landing).",
    inputContentTypes: ["application/json"],
    outputContentTypes: ["application/json"],
    pricing: { model: "per-call", currency: "BRL", amountCents: 5 },
    rateLimit: { requestsPerMinute: 120, burst: 30 },
  },
  {
    slug: "audience-segmenter",
    version: "1.0.0",
    description:
      "Segmenta audiência por intenção (frio, morno, quente) usando sinais comportamentais e tags semânticas.",
    pricing: { model: "per-call", currency: "BRL", amountCents: 3 },
  },
  {
    slug: "judge-revisor",
    version: "1.0.0",
    description:
      "Avalia qualidade e risco de outputs IA antes do envio, retornando score e decisão (aprovar | revisar | bloquear).",
    pricing: { model: "free", currency: "BRL", amountCents: 0 },
  },
  {
    slug: "funnel-architect",
    version: "1.0.0",
    description:
      "Constrói funil ponta a ponta (lead → conversão) integrando WhatsApp, e-mail e landing.",
    pricing: { model: "per-call", currency: "BRL", amountCents: 12 },
  },
  {
    slug: "follow-up-strategist",
    version: "1.0.0",
    description:
      "Orquestra sequências de follow-up personalizadas com timing otimizado por agente downstream.",
    pricing: { model: "per-call", currency: "BRL", amountCents: 4 },
  },
];
