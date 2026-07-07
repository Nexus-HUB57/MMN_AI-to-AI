/**
 * Nexus Affil'IA'te · M9 · C-Suite Bridge · Types
 *
 * Modelo de identidade dos agentes C-level (Niko, Ravi, Helena)
 * para integração na federação Judge como nós elite com workspace próprio.
 *
 * @module agentic/c-suite-bridge/types
 * @author Niko Nexus · CEO/AI
 */
import { z } from "zod";

// ─── Identidade C-Level ─────────────────────────────────────────────────────

export const cLevelRoleSchema = z.enum(["CEO/AI", "CTO/AI", "CMO/AI"]);
export type CLevelRole = z.infer<typeof cLevelRoleSchema>;

export const cLevelAgentSchema = z.object({
  agentId: z.string().min(3),                  // ex: ceo-ai:niko-nexus
  name: z.string().min(1),                     // ex: Niko Nexus
  role: cLevelRoleSchema,
  workspace: z.string().url().optional(),      // URL do workspace Genspark
  publicKeyPem: z.string().min(40),
  privateKeyPem: z.string().min(40).optional(),
  trustLevel: z.literal("elite"),
  active: z.boolean().default(true),
  mandate: z.string().min(20),                 // mandato resumido
  reportsTo: z.string().optional(),
  permittedKinds: z.array(z.string()).default([]),
  joinedAt: z.string().datetime(),
  judgeNodeId: z.string().optional(),          // ID quando registrado como Judge node
  metadata: z.record(z.any()).default({}),
});
export type CLevelAgent = z.infer<typeof cLevelAgentSchema>;

// ─── Skill perfil para A2A discovery ────────────────────────────────────────

export interface CLevelSkillCard {
  agentId: string;
  name: string;
  role: CLevelRole;
  publicKeyPem: string;
  endpoint: string;                            // endpoint local do bridge
  trustLevel: "elite";
  capabilities: string[];                      // ex: ["judge.vote", "ceo.orchestrate"]
}
