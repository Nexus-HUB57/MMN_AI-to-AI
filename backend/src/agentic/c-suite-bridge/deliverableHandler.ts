/**
 * Nexus Affil'IA'te · M9.5 · C-Suite Deliverable Handler
 *
 * Endpoint que Ravi/Helena chamam para submeter um pacote pronto.
 * O pacote (URL de tar.gz) é registrado no Governance Loop como
 * knowledge.ingest com metadata de delivery. Niko (humano operador real
 * via runbook ou cron) processa depois.
 *
 * Não executa código automaticamente — segurança first. Apenas registra
 * e gera audit digest sha256 do pacote.
 *
 * @module agentic/c-suite-bridge/deliverableHandler
 */
import crypto from "node:crypto";
import { z } from "zod";

export const deliverableSchema = z.object({
  agentId: z.enum(["cto-ai:ravi", "cmo-ai:helena", "ceo-ai:niko-nexus"]),
  feature: z.string().min(3).max(120),
  packageUrl: z.string().url(),
  branch: z.string().default("main"),
  targetPaths: z.array(z.string()).min(1),     // arquivos modificados
  readmeUrl: z.string().url().optional(),
  buildSteps: z.array(z.string()).default([]), // comandos sugeridos
  smokeTestCommands: z.array(z.string()).default([]),
  governanceKind: z
    .enum([
      "skill.publish",
      "skill.update",
      "skill.deprecate",
      "knowledge.ingest",
      "campaign.launch",
    ])
    .default("knowledge.ingest"),
  rationale: z.string().min(20).max(2048),
});

export type Deliverable = z.infer<typeof deliverableSchema>;

export interface DeliverableTicket {
  ticketId: string;
  agentId: string;
  feature: string;
  packageUrl: string;
  packageDigest: string;       // sha256 do contrato (não do arquivo, MVP)
  status: "pending-deploy" | "deployed" | "rolled-back" | "rejected";
  createdAt: string;
  governanceActionId?: string;
}

/**
 * Cria um ticket de delivery com digest do contrato.
 */
export function createDeliverableTicket(d: Deliverable): DeliverableTicket {
  const ticketId = `dlv_${crypto.randomBytes(8).toString("hex")}`;
  const canonical = JSON.stringify({
    agentId: d.agentId,
    feature: d.feature,
    packageUrl: d.packageUrl,
    targetPaths: d.targetPaths.sort(),
  });
  const packageDigest = crypto
    .createHash("sha256")
    .update(canonical)
    .digest("hex");

  return {
    ticketId,
    agentId: d.agentId,
    feature: d.feature,
    packageUrl: d.packageUrl,
    packageDigest,
    status: "pending-deploy",
    createdAt: new Date().toISOString(),
  };
}
