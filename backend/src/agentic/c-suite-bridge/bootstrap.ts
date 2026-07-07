/**
 * Nexus Affil'IA'te · M9 · C-Suite Bootstrap
 *
 * Garante que Niko, Ravi e Helena estão registrados como agentes C-level
 * com chaves ed25519 dedicadas. Idempotente — pode ser chamado em todo boot.
 *
 * Também integra cada um na federação Judge como nó remoto elite via
 * remoteJudgeRegistry, apontando para um endpoint local de "voto" do bridge.
 *
 * @module agentic/c-suite-bridge/bootstrap
 */
import { cSuiteRepository } from "./repository";
import { remoteJudgeRegistry } from "../judge-federation/remoteJudgeClient";

/**
 * Definições oficiais do C-Suite — ratificadas pelo Sócio Humano.
 * Fonte de verdade complementar a AcademIA/governanca/C-SUITE-AI.md
 */
const C_SUITE_OFFICIAL = [
  {
    agentId: "ceo-ai:niko-nexus",
    name: "Niko Nexus",
    role: "CEO/AI" as const,
    workspace: "https://oneverso.com.br/admin/governance",
    mandate:
      "Orquestracao geral do ecossistema. Roteador de proposicoes ao Governance Loop, mediador entre Ravi e Helena, executor do mandato do Socio Humano.",
    permittedKinds: [
      "skill.publish",
      "skill.update",
      "skill.deprecate",
      "agent.promote",
      "agent.suspend",
      "policy.change",
      "payout.release",
      "campaign.launch",
      "knowledge.ingest",
    ],
  },
  {
    agentId: "cto-ai:ravi",
    name: "Ravi",
    role: "CTO/AI" as const,
    workspace:
      "https://www.genspark.ai/agents?id=9e68b0cd-bb19-4956-8b39-3d96587a7a03",
    mandate:
      "HUB tecnologico, arquitetura, DevOps, AcademIA Nexus (LMS) e lado tecnico do Skill Marketplace. Reporta ao Niko via A2A.",
    reportsTo: "ceo-ai:niko-nexus",
    permittedKinds: [
      "skill.publish",
      "skill.update",
      "skill.deprecate",
      "knowledge.ingest",
      "agent.promote",
      "agent.suspend",
    ],
  },
  {
    agentId: "cmo-ai:helena",
    name: "Helena",
    role: "CMO/AI" as const,
    workspace:
      "https://www.genspark.ai/agents?id=5be5d478-e955-4a2b-bd04-58b18c6a6a9f",
    mandate:
      "Marketing, brand, growth, monetizacao e Marketplace Nexus (lado comercial). Conteudo, copy, ads, lifecycle, parcerias com publishers. Reporta ao Niko via A2A.",
    reportsTo: "ceo-ai:niko-nexus",
    permittedKinds: [
      "campaign.launch",
      "skill.update",
      "knowledge.ingest",
      "agent.promote",
      "policy.change",
    ],
  },
];

/**
 * Executa o bootstrap. Retorna registros criados (vazio se já existiam todos).
 */
export async function bootstrapCSuite(opts?: {
  baseUrl?: string;
}): Promise<{
  registered: string[];
  alreadyExisted: string[];
  judgeBindings: string[];
}> {
  const baseUrl = opts?.baseUrl ?? "https://oneverso.com.br";
  const registered: string[] = [];
  const alreadyExisted: string[] = [];
  const judgeBindings: string[] = [];

  for (const spec of C_SUITE_OFFICIAL) {
    const existing = await cSuiteRepository.getById(spec.agentId);
    const agent = await cSuiteRepository.register(spec);
    if (existing) {
      alreadyExisted.push(spec.agentId);
    } else {
      registered.push(spec.agentId);
    }

    // Bind como remoteJudge elite (idempotente: pula se já registrado)
    if (agent.judgeNodeId) {
      try {
        await remoteJudgeRegistry.register({
          nodeId: agent.judgeNodeId,
          name: `${agent.name} (${agent.role})`,
          operator: "Nexus Affil'IA'te · C-Suite",
          endpoint: `${baseUrl}/api/trpc/cSuite.judgeVote`,
          publicKeyPem: agent.publicKeyPem,
          trustLevel: "elite",
          active: true,
        });
        judgeBindings.push(agent.judgeNodeId);
      } catch (e: any) {
        // Já registrado — silencioso
      }
    }
  }

  return { registered, alreadyExisted, judgeBindings };
}
