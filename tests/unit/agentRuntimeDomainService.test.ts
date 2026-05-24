import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AgentNotFoundError,
  buildGenerateSystemPrompt,
  bumpAgentRuntimePerformance,
  generateAgentContent,
  generateAgentContentBatch,
  getAgentRuntimeProfile,
  normalizeTone,
  parseContentStrategy,
  registerAgentRuntimeAction,
} from "../../backend/src/domains/agent-runtime/service";
import {
  DomainEventType,
  eventBus,
} from "../../backend/src/_core/events/eventBus";

function buildDeps(overrides: Record<string, unknown> = {}) {
  let idSequence = 0;
  const audits: Array<Record<string, unknown>> = [];
  const agent = {
    id: 5,
    userId: 7,
    name: "Agent Prime",
    status: "active",
    performanceScore: 91,
    contentStrategy: JSON.stringify({
      platforms: ["facebook"],
      tone: "casual",
      postingFrequency: "daily",
      targetAudience: "creators",
    }),
    createdAt: new Date("2026-05-24T00:00:00.000Z"),
    updatedAt: new Date("2026-05-24T00:00:00.000Z"),
  };

  const deps = {
    findAgentByUserId: vi.fn(async () => agent),
    listActiveUpgradesByAgentId: vi.fn(async () => [
      {
        id: 1,
        upgradeId: 101,
        status: "active",
        activatedAt: new Date("2026-05-24T00:00:00.000Z"),
        expiresAt: null,
        upgrade: { id: 101, name: "Analytics Booster" },
      },
      {
        id: 2,
        upgradeId: 102,
        status: "active",
        activatedAt: new Date("2026-05-24T00:00:00.000Z"),
        expiresAt: null,
        upgrade: { id: 102, name: "Copy Sprint" },
      },
    ]),
    updateAgentPerformanceScore: vi.fn(async (_agentId: number, performanceScore: number) => ({
      ...agent,
      performanceScore,
    })),
    insertAudit: vi.fn(async (audit: Record<string, unknown>) => {
      audits.push(audit);
      return audit;
    }),
    invokeLlm: vi.fn(async () => ({
      content:
        "Campanha evergreen para creators com CTA forte e prova social. #creator #growth #nexus #mmn #ia #conteudo",
      modelUsed: "stub-llm",
      tokensUsed: 128,
    })),
    generateId: vi.fn(() => `runtime-id-${++idSequence}`),
    onAuditFailure: vi.fn(),
  };

  return {
    agent,
    audits,
    deps: {
      ...deps,
      ...overrides,
    },
  };
}

describe("agent-runtime domain service", () => {
  let publishedTypes: string[];
  let subscriptionIds: string[];

  beforeEach(() => {
    publishedTypes = [];
    subscriptionIds = [
      eventBus.subscribe(DomainEventType.AGENT_SESSION_STARTED, (event) => {
        publishedTypes.push(event.type);
      }),
      eventBus.subscribe(DomainEventType.AGENT_SESSION_COMPLETED, (event) => {
        publishedTypes.push(event.type);
      }),
      eventBus.subscribe(DomainEventType.AGENT_SESSION_FAILED, (event) => {
        publishedTypes.push(event.type);
      }),
      eventBus.subscribe(DomainEventType.AGENT_CONTENT_GENERATED, (event) => {
        publishedTypes.push(event.type);
      }),
    ];
  });

  afterEach(() => {
    subscriptionIds.forEach((id) => eventBus.unsubscribe(id));
    vi.clearAllMocks();
  });

  it("normaliza strategy, tom e prompt de geração", () => {
    expect(parseContentStrategy('{"platforms":["instagram"],"tone":"persuasive"}')).toEqual({
      platforms: ["instagram"],
      tone: "persuasive",
    });
    expect(parseContentStrategy("{invalid-json}")).toEqual({});
    expect(normalizeTone("humorous")).toBe("humorous");
    expect(normalizeTone("not-supported")).toBe("professional");

    const prompt = buildGenerateSystemPrompt({
      agentName: "Agent Prime",
      strategy: { platforms: ["facebook"], tone: "casual" },
      platform: "facebook",
      tone: "casual",
      maxLength: 180,
      includeHashtags: true,
    });

    expect(prompt).toContain("Plataforma alvo: facebook.");
    expect(prompt).toContain("Inclua hashtags relevantes ao final.");
  });

  it("monta o perfil consolidado do agente com strategy parseada", async () => {
    const { deps } = buildDeps();
    const result = await getAgentRuntimeProfile(7, deps as any);

    expect(result.agent.name).toBe("Agent Prime");
    expect(result.agent.contentStrategy).toMatchObject({
      platforms: ["facebook"],
      tone: "casual",
    });
    expect(result.activeUpgrades).toHaveLength(2);
    expect(result.skillsCount).toBe(2);
  });

  it("gera conteúdo, persiste auditoria e publica eventos de sucesso", async () => {
    const { deps, audits } = buildDeps();
    const result = await generateAgentContent(
      {
        userId: 7,
        input: {
          topic: "Lançamento da nova campanha",
          includeHashtags: true,
          maxLength: 90,
        },
      },
      deps as any,
    );

    expect(result.success).toBe(true);
    expect(result.platform).toBe("facebook");
    expect(result.tone).toBe("casual");
    expect(result.content.length).toBeLessThanOrEqual(90);
    expect(audits[0]).toMatchObject({
      action: "agent.generate",
      sessionId: "agent-runtime-7",
    });
    expect(publishedTypes).toEqual(
      expect.arrayContaining([
        "AgentSessionStarted",
        "AgentSessionCompleted",
        "AgentContentGenerated",
      ]),
    );

    const llmCall = (deps.invokeLlm as any).mock.calls[0][0];
    expect(llmCall.messages[0].content).toContain("Tom de voz: casual.");
  });

  it("publica evento de falha quando a geração quebra", async () => {
    const { deps } = buildDeps({
      invokeLlm: vi.fn(async () => {
        throw new Error("LLM offline");
      }),
    });

    await expect(
      generateAgentContent(
        {
          userId: 7,
          input: {
            topic: "Falha controlada",
          },
        },
        deps as any,
      ),
    ).rejects.toThrow("LLM offline");

    expect(publishedTypes).toContain("AgentSessionFailed");
  });

  it("gera batch com múltiplas variações e tons previsíveis", async () => {
    const { deps, audits } = buildDeps();
    const result = await generateAgentContentBatch(
      {
        userId: 7,
        input: {
          topic: "Oferta de aquisição",
          count: 3,
        },
      },
      deps as any,
    );

    expect(result.variations).toHaveLength(3);
    expect(result.variations.map((item) => item.tone)).toEqual([
      "professional",
      "persuasive",
      "casual",
    ]);
    expect(audits[0]).toMatchObject({ action: "agent.generateBatch" });
  });

  it("ajusta performance, registra ação manual e trata ausência de agente", async () => {
    const { deps, audits } = buildDeps();
    const bump = await bumpAgentRuntimePerformance(
      {
        userId: 7,
        delta: 20,
      },
      deps as any,
    );

    expect(bump.previousScore).toBe(91);
    expect(bump.currentScore).toBe(100);
    expect((deps.updateAgentPerformanceScore as any).mock.calls[0]).toEqual([5, 100]);

    const action = await registerAgentRuntimeAction(
      {
        userId: 7,
        input: {
          action: "agent.external-post",
          metadata: { platform: "instagram" },
        },
      },
      deps as any,
    );

    expect(action).toEqual({ success: true });
    expect(audits.at(-1)).toMatchObject({ action: "agent.external-post" });

    const missingDeps = buildDeps({
      findAgentByUserId: vi.fn(async () => null),
    }).deps;

    await expect(getAgentRuntimeProfile(404, missingDeps as any)).rejects.toBeInstanceOf(
      AgentNotFoundError,
    );
  });
});
