type AgentBehaviorInput = {
  name: string;
  specialization: string;
  reputation?: string;
  skills?: Array<{ skill: string; proficiency?: string | number }>;
  recentVitals?: Record<string, unknown>;
};

type DnaFusionAgent = {
  name: string;
  specialization: string;
  dna?: Record<string, unknown>;
};

type StartupPerformanceInput = {
  name: string;
  description: string;
  status: string;
  fundingRaised?: string;
  collaborators?: number;
  vitals?: Record<string, unknown>;
};

/**
 * Shim temporário para compatibilidade do authRouter histórico.
 * Os fluxos abaixo mantêm o módulo carregável durante a reintrodução gradual
 * dos routers reais, sem prometer ainda o comportamento final de IA.
 */
export async function analyzeAgentBehavior(input: AgentBehaviorInput) {
  return {
    mode: "compat-shim",
    summary: `Análise bootstrap do agente ${input.name}`,
    recommendations: [
      `Revisar especialização atual: ${input.specialization}`,
      "Expandir coleta de sinais reais antes de religar a IA proprietária.",
    ],
    riskLevel: "medium",
    observedSkills: input.skills?.length ?? 0,
  } as const;
}

export async function dnafusion(agent1: DnaFusionAgent, agent2: DnaFusionAgent, mutationFocus: string) {
  return {
    name: `${agent1.name}-${agent2.name}`,
    specialization: mutationFocus || agent1.specialization || agent2.specialization,
    dna: {
      source: "compat-shim",
      mutationFocus,
      parentA: agent1.dna ?? {},
      parentB: agent2.dna ?? {},
    },
  };
}

export async function analyzeStartupPerformance(input: StartupPerformanceInput) {
  return {
    mode: "compat-shim",
    summary: `Startup ${input.name} em estágio ${input.status}`,
    score: 50,
    recommendations: [
      "Validar métricas financeiras reais antes da reativação completa.",
      "Substituir shim por integração LLM definitiva na próxima fase.",
    ],
    collaborators: input.collaborators ?? 0,
  } as const;
}
