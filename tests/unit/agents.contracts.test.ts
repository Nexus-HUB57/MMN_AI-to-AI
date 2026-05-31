import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  mockInsertReturning: vi.fn(),
  mockUpdateReturning: vi.fn(),
  mockLimit: vi.fn(),
  mockOrderBy: vi.fn(),
  mockWhere: vi.fn(),
  mockFrom: vi.fn(),
  mockSelect: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
  getDbMock: vi.fn(),
  getAgentByUserIdMock: vi.fn(),
  createAgentMock: vi.fn(),
  updateAgentMock: vi.fn(),
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
  updateAgent: mocks.updateAgentMock,
}));

import { appRouter } from "./routers";

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
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
  const {
    mockInsertReturning,
    mockUpdateReturning,
    mockLimit,
    mockOrderBy,
    mockWhere,
    mockFrom,
    mockSelect,
    mockInsert,
    mockUpdate,
  } = mocks;

  mockInsertReturning.mockReset();
  mockUpdateReturning.mockReset();
  mockLimit.mockReset();
  mockOrderBy.mockReset();
  mockWhere.mockReset();
  mockFrom.mockReset();
  mockSelect.mockReset();
  mockInsert.mockReset();
  mockUpdate.mockReset();

  const chain = {
    select: mockSelect,
    from: mockFrom,
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
    insert: mockInsert,
    update: mockUpdate,
  } as any;

  mockSelect.mockReturnValue(chain);
  mockFrom.mockReturnValue(chain);
  mockWhere.mockReturnValue(chain);
  mockOrderBy.mockReturnValue(chain);
  mockLimit.mockResolvedValue([]);
  mockInsert.mockImplementation(() => ({
    values: vi.fn(() => ({ returning: mockInsertReturning })),
  }));
  mockUpdate.mockImplementation(() => ({
    set: vi.fn(() => ({ where: vi.fn(() => ({ returning: mockUpdateReturning })) })),
  }));

  return chain;
}

describe("agents router contract compatibility", () => {
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
    mocks.createAgentMock.mockResolvedValue({
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

  it("aceita updateAgentSkill com campo id do frontend", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    mocks.mockUpdateReturning.mockResolvedValueOnce([{ id: 10, skillName: "Copy", status: "active" }]);
    mocks.mockInsertReturning.mockResolvedValueOnce([{ id: 1 }]);

    const result = await caller.agents.updateAgentSkill({ id: 10, status: "active", proficiency: 50 });
    expect(result.success).toBe(true);
    expect(result.skill.id).toBe(10);
  });

  it("aceita createScheduledPost com scheduledAt em ISO string", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    mocks.mockInsertReturning.mockResolvedValueOnce([
      {
        id: "sp_1",
        content: "teste",
        platforms: ["instagram"],
        scheduledFor: new Date("2026-06-01T10:00:00.000Z"),
        status: "scheduled",
        mediaUrls: null,
      },
    ]);

    const result = await caller.agents.createScheduledPost({
      content: "teste",
      platform: "instagram",
      scheduledAt: "2026-06-01T10:00:00.000Z",
    });

    expect(result.success).toBe(true);
    expect(result.post.id).toBe("sp_1");
  });

  it("aceita updateScheduledPost com campo id do frontend", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    mocks.mockUpdateReturning.mockResolvedValueOnce([{ id: "sp_2", status: "published" }]);

    const result = await caller.agents.updateScheduledPost({ id: "sp_2", status: "publicado" });
    expect(result.success).toBe(true);
    expect(result.post.id).toBe("sp_2");
  });

  it("retorna status de posts no formato esperado pelo frontend", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    mocks.mockLimit.mockResolvedValueOnce([
      { id: "1", content: "A", platforms: ["instagram"], scheduledFor: new Date("2026-06-01T10:00:00.000Z"), status: "scheduled", mediaUrls: null },
      { id: "2", content: "B", platforms: ["instagram"], scheduledFor: new Date("2026-06-01T11:00:00.000Z"), status: "published", mediaUrls: null },
      { id: "3", content: "C", platforms: ["instagram"], scheduledFor: new Date("2026-06-01T12:00:00.000Z"), status: "failed", mediaUrls: null },
    ]);

    const result = await caller.agents.getScheduledPosts();
    expect(result.map((item) => item.status)).toEqual(["agendado", "publicado", "falhou"]);
  });

  it("aceita createRecommendedProduct com productUrl vazio", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    mocks.mockInsertReturning.mockResolvedValueOnce([{ id: 1, productUrl: null }]);

    const result = await caller.agents.createRecommendedProduct({
      productName: "Produto",
      affiliateLink: "https://example.com/aff",
      productUrl: "",
      relevanceScore: 85,
      marketplace: "mercado-livre",
    });

    expect(result.success).toBe(true);
    expect(result.product.id).toBe(1);
  });
});
