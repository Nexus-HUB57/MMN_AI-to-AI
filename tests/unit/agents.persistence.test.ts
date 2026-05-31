import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

/**
 * Testes de persistência para os endpoints novos do agentsRouter:
 *  - getRecommendedProducts
 *  - getAgentSkills
 *  - getEvolutionHistory
 *  - getScheduledPosts
 *  - getGeneratedImages
 *
 * Verifica:
 *  - Comportamento de fallback quando DB ausente (retorna []).
 *  - Mapeamento correto dos campos retornados.
 *  - Compatibilidade com contratos consumidos pelo frontend.
 */

const mocks = vi.hoisted(() => ({
  mockLimit: vi.fn(),
  mockOrderBy: vi.fn(),
  mockWhere: vi.fn(),
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  getDbMock: vi.fn(),
  getAgentByUserIdMock: vi.fn(),
  createAgentMock: vi.fn(),
}));

vi.mock("../../database/schemas/db", () => ({
  getDb: mocks.getDbMock,
}));

vi.mock("../../backend/src/database/schemas/db", () => ({
  getDb: mocks.getDbMock,
}));

vi.mock("../../backend/src/routers/db", () => ({
  getAgentByUserId: mocks.getAgentByUserIdMock,
  createAgent: mocks.createAgentMock,
  updateAgent: vi.fn(),
}));

import { appRouter } from "./routers";

function createAuthContext(userId = 1): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: {
      id: userId,
      openId: `test-user-${userId}`,
      email: `test${userId}@example.com`,
      name: `Test User ${userId}`,
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
  return { ctx };
}

function buildDb() {
  const { mockLimit, mockOrderBy, mockWhere, mockFrom, mockSelect } = mocks;

  mockLimit.mockReset();
  mockOrderBy.mockReset();
  mockWhere.mockReset();
  mockFrom.mockReset();
  mockSelect.mockReset();

  const chain = {
    select: mockSelect,
    from: mockFrom,
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
  } as any;

  mockSelect.mockReturnValue(chain);
  mockFrom.mockReturnValue(chain);
  mockWhere.mockReturnValue(chain);
  // Algumas queries terminam em .orderBy() (sem .limit()), outras em .limit().
  // Por isso ambos são thenables/Promise por padrão e retornáveis como chain.
  mockOrderBy.mockImplementation(() => {
    const p: any = Promise.resolve([]);
    p.limit = mockLimit;
    return p;
  });
  mockLimit.mockResolvedValue([]);
  return chain;
}

describe("agents router persistence queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDbMock.mockResolvedValue(buildDb());
    mocks.getAgentByUserIdMock.mockResolvedValue({
      id: 77,
      userId: 1,
      name: "Agent",
      status: "learning",
      contentStrategy: null,
      performanceScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("retorna [] quando DB indisponível em getRecommendedProducts", async () => {
    mocks.getDbMock.mockResolvedValueOnce(null);
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.getRecommendedProducts();
    expect(result).toEqual([]);
  });

  it("retorna [] quando DB indisponível em getAgentSkills", async () => {
    mocks.getDbMock.mockResolvedValueOnce(null);
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.getAgentSkills();
    expect(result).toEqual([]);
  });

  it("retorna [] quando DB indisponível em getEvolutionHistory", async () => {
    mocks.getDbMock.mockResolvedValueOnce(null);
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.getEvolutionHistory();
    expect(result).toEqual([]);
  });

  it("retorna [] quando DB indisponível em getScheduledPosts", async () => {
    mocks.getDbMock.mockResolvedValueOnce(null);
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.getScheduledPosts();
    expect(result).toEqual([]);
  });

  it("retorna [] quando DB indisponível em getGeneratedImages", async () => {
    mocks.getDbMock.mockResolvedValueOnce(null);
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.getGeneratedImages();
    expect(result).toEqual([]);
  });

  it("retorna registros persistidos em getRecommendedProducts", async () => {
    const fakeRows = [
      { id: 1, agentId: 77, productName: "Produto A", marketplace: "shopee", relevanceScore: 90, affiliateLink: "https://a", createdAt: new Date() },
      { id: 2, agentId: 77, productName: "Produto B", marketplace: "amazon", relevanceScore: 70, affiliateLink: "https://b", createdAt: new Date() },
    ];
    // getRecommendedProducts termina em .orderBy(), sem .limit()
    mocks.mockOrderBy.mockImplementationOnce(() => {
      const p: any = Promise.resolve(fakeRows);
      p.limit = mocks.mockLimit;
      return p;
    });

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.getRecommendedProducts();
    expect(result).toHaveLength(2);
    expect(result[0].productName).toBe("Produto A");
  });

  it("retorna skills persistidas em getAgentSkills", async () => {
    const fakeRows = [
      { id: 1, agentId: 77, skillName: "Copywriting", status: "active", proficiency: 80, cost: 100, createdAt: new Date(), updatedAt: new Date() },
    ];
    // getAgentSkills termina em .orderBy()
    mocks.mockOrderBy.mockImplementationOnce(() => {
      const p: any = Promise.resolve(fakeRows);
      p.limit = mocks.mockLimit;
      return p;
    });

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.getAgentSkills();
    expect(result).toHaveLength(1);
    expect(result[0].skillName).toBe("Copywriting");
  });

  it("retorna histórico de evolução em ordem decrescente", async () => {
    const now = new Date();
    const fakeRows = [
      { id: 3, agentId: 77, eventType: "skill_active", description: "Skill X ativada", createdAt: now },
      { id: 2, agentId: 77, eventType: "skill_unlocked", description: "Skill X desbloqueada", createdAt: new Date(now.getTime() - 1000) },
    ];
    mocks.mockLimit.mockResolvedValueOnce(fakeRows);

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.getEvolutionHistory();
    expect(result.map((r) => r.eventType)).toEqual(["skill_active", "skill_unlocked"]);
  });

  it("mapeia platforms array para string em getScheduledPosts", async () => {
    const fakeRows = [
      { id: "1", content: "A", platforms: ["instagram", "facebook"], scheduledFor: new Date("2026-06-01T10:00:00.000Z"), status: "scheduled", mediaUrls: ["https://img.example/1.png"] },
      { id: "2", content: "B", platforms: [], scheduledFor: new Date("2026-06-02T10:00:00.000Z"), status: "scheduled", mediaUrls: null },
    ];
    mocks.mockLimit.mockResolvedValueOnce(fakeRows);

    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.getScheduledPosts();
    expect(result[0].platform).toBe("instagram");
    expect(result[0].imageUrl).toBe("https://img.example/1.png");
    expect(result[1].platform).toBe("instagram"); // fallback default
    expect(result[1].imageUrl).toBeUndefined();
  });
});
