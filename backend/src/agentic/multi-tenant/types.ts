/**
 * Nexus Affil'IA'te · M8 · Multi-Tenant Federation Types
 *
 * Whitelabel auto-registra como nó Judge remoto e ganha trust gradualmente
 * por SLA (latência, uptime, accuracy de votos).
 *
 * @module agentic/multi-tenant/types
 * @author Niko Nexus · CEO/AI
 */
import { z } from "zod";

// ─── Tenant ────────────────────────────────────────────────────────────────

export const tenantTrustSchema = z.enum(["sandbox", "verified", "elite"]);
export type TenantTrust = z.infer<typeof tenantTrustSchema>;

export const tenantSchema = z.object({
  tenantId: z.string().min(3),
  name: z.string().min(1),
  operator: z.string().min(1),               // organização legal
  contactEmail: z.string().email(),
  endpoint: z.string().url(),                // URL pública do A2A do tenant
  publicKeyPem: z.string().min(40),          // chave ed25519
  apiKey: z.string().optional(),             // opcional, header Authorization
  trustLevel: tenantTrustSchema.default("sandbox"),
  active: z.boolean().default(true),
  registeredAt: z.string().datetime(),
  promotedAt: z.string().datetime().optional(),
  // SLA tracking
  totalPings: z.number().int().min(0).default(0),
  successfulPings: z.number().int().min(0).default(0),
  totalVotes: z.number().int().min(0).default(0),
  validVotes: z.number().int().min(0).default(0),
  avgLatencyMs: z.number().min(0).default(0),
  lastSeenAt: z.string().datetime().optional(),
  // Metadados livres
  metadata: z.record(z.any()).default({}),
});
export type Tenant = z.infer<typeof tenantSchema>;

// ─── Critérios de promoção ─────────────────────────────────────────────────

export interface PromotionCriteria {
  trustLevel: TenantTrust;
  minDays: number;            // dias desde registro
  minPings: number;           // pings totais
  minPingSuccessRate: number; // 0..1
  minVotes: number;           // votos totais
  minVoteValidityRate: number;// 0..1
  maxAvgLatencyMs: number;
}

export const PROMOTION_CRITERIA: Record<TenantTrust, PromotionCriteria | null> = {
  sandbox: null, // não tem critério, é o ponto de partida
  verified: {
    trustLevel: "verified",
    minDays: 7,
    minPings: 100,
    minPingSuccessRate: 0.95,
    minVotes: 20,
    minVoteValidityRate: 0.90,
    maxAvgLatencyMs: 1500,
  },
  elite: {
    trustLevel: "elite",
    minDays: 30,
    minPings: 500,
    minPingSuccessRate: 0.99,
    minVotes: 100,
    minVoteValidityRate: 0.97,
    maxAvgLatencyMs: 1000,
  },
};

// ─── Resultado de avaliação SLA ────────────────────────────────────────────

export interface SLAEvaluation {
  tenantId: string;
  currentTrust: TenantTrust;
  recommendedTrust: TenantTrust;
  promotionEligible: boolean;
  metrics: {
    daysSinceRegistration: number;
    pingSuccessRate: number;
    voteValidityRate: number;
    avgLatencyMs: number;
    totalPings: number;
    totalVotes: number;
  };
  blockers: string[];
}
