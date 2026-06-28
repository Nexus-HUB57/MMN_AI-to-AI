/**
 * Nexus Affil'IA'te · A2A tRPC Router
 *
 * Expõe endpoints públicos para descoberta e handshake AI-to-AI.
 *
 * @module agentic/a2a/router
 */
import { z } from "zod";
import { publicProcedure, router } from "../../config/trpc";
import { buildRootAgentCard, DEFAULT_ROOT_SKILLS } from "./agentCard";
import {
  processHandshake,
  handshakeRequestSchema,
} from "./handshake";

// Em produção: chave pública vinda de KMS, secret do env.
const PUBLIC_KEY =
  process.env.NEXUS_A2A_PUBLIC_KEY ??
  "nexus-root-pub-key-MVP-replace-in-production-kms";
const HMAC_SECRET =
  process.env.NEXUS_A2A_HMAC_SECRET ??
  "nexus-root-hmac-secret-MVP-replace-in-production";
const BASE_URL =
  process.env.NEXUS_BASE_URL ?? "https://oneverso.com.br";

function rootCard() {
  return buildRootAgentCard({
    publicKey: PUBLIC_KEY,
    baseUrl: BASE_URL,
    skills: DEFAULT_ROOT_SKILLS,
    expiresInDays: 30,
  });
}

export const a2aRouter = router({
  // GET equivalent — retorna o agent card público do nó raiz.
  getAgentCard: publicProcedure.query(() => {
    return {
      ok: true,
      agentCard: rootCard(),
    };
  }),

  // Lista resumida das skills publicadas.
  listSkills: publicProcedure.query(() => {
    return {
      ok: true,
      count: DEFAULT_ROOT_SKILLS.length,
      skills: DEFAULT_ROOT_SKILLS.map((s) => ({
        slug: s.slug,
        version: s.version,
        description: s.description,
        pricing: s.pricing,
      })),
    };
  }),

  // Handshake AI-to-AI.
  handshake: publicProcedure
    .input(handshakeRequestSchema)
    .mutation(({ input }) => {
      const response = processHandshake(input, {
        agentCard: rootCard(),
        secret: HMAC_SECRET,
        sessionTtlMinutes: 30,
      });
      return { ok: true, ...response };
    }),

  // Health específico do subsistema A2A
  health: publicProcedure.query(() => ({
    ok: true,
    service: "a2a-protocol",
    specVersion: "1.0",
    skillsPublished: DEFAULT_ROOT_SKILLS.length,
    timestamp: new Date().toISOString(),
  })),
});
