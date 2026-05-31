import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
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

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;
type AgentRecord = {
  id: number;
  userId: number;
  name: string;
  status: string;
  contentStrategy: string | null;
  performanceScore: number;
  createdAt: Date;
  updatedAt: Date;
};

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("agents router", () => {
  let store: Map<number, AgentRecord>;
  let nextId: number;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDbMock.mockResolvedValue(null);
    store = new Map();
    nextId = 1;

    mocks.getAgentByUserIdMock.mockImplementation(async (userId: number) => {
      return store.get(userId);
    });

    mocks.createAgentMock.mockImplementation(async (data: Omit<AgentRecord, "id" | "createdAt" | "updatedAt">) => {
      const agent: AgentRecord = {
        id: nextId++,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.set(agent.userId, agent);
      return agent;
    });

    mocks.updateAgentMock.mockImplementation(async (agentId: number, updates: Partial<AgentRecord>) => {
      const agent = Array.from(store.values()).find((item) => item.id === agentId);
      if (!agent) return undefined;
      const updated: AgentRecord = {
        ...agent,
        ...updates,
        updatedAt: new Date(),
      };
      store.set(updated.userId, updated);
      return updated;
    });
  });

  describe("initialize", () => {
    it("deve inicializar um novo agente para o usuário", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agents.initialize();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.created).toBe(true);
      expect(result.agent.userId).toBe(ctx.user.id);
      expect(result.agent.status).toBe("learning");
    });

    it("deve retornar o agente existente quando já inicializado", async () => {
      const { ctx } = createAuthContext(2);
      const caller = appRouter.createCaller(ctx);

      const result1 = await caller.agents.initialize();
      const result2 = await caller.agents.initialize();

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result2.created).toBe(false);
      expect(result1.agent.id).toBe(result2.agent.id);
    });
  });

  describe("get", () => {
    it("deve recuperar o agente do usuário atual", async () => {
      const { ctx } = createAuthContext(3);
      const caller = appRouter.createCaller(ctx);

      await caller.agents.initialize();
      const result = await caller.agents.get();

      expect(result).toBeDefined();
      expect(result.userId).toBe(ctx.user.id);
      expect(result.name).toBeDefined();
    });
  });

  describe("configure", () => {
    it("deve atualizar o nome do agente", async () => {
      const { ctx } = createAuthContext(4);
      const caller = appRouter.createCaller(ctx);

      await caller.agents.initialize();
      const result = await caller.agents.configure({
        name: "Custom Agent Name",
      });

      expect(result.success).toBe(true);
      expect(result.agent.name).toBe("Custom Agent Name");
    });

    it("deve atualizar o status do agente", async () => {
      const { ctx } = createAuthContext(5);
      const caller = appRouter.createCaller(ctx);

      await caller.agents.initialize();
      const result = await caller.agents.configure({
        status: "active",
      });

      expect(result.success).toBe(true);
      expect(result.agent.status).toBe("active");
    });

    it("deve atualizar o performance score", async () => {
      const { ctx } = createAuthContext(6);
      const caller = appRouter.createCaller(ctx);

      await caller.agents.initialize();
      const result = await caller.agents.configure({
        performanceScore: 85,
      });

      expect(result.success).toBe(true);
      expect(result.agent.performanceScore).toBe(85);
    });
  });

  describe("getState", () => {
    it("deve recuperar o estado completo do agente", async () => {
      const { ctx } = createAuthContext(7);
      const caller = appRouter.createCaller(ctx);

      await caller.agents.initialize();
      const result = await caller.agents.getState();

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(ctx.user.id);
      expect(result.name).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.performanceScore).toBeDefined();
      expect(result.contentStrategy).toBeDefined();
    });
  });

  describe("updateState", () => {
    it("deve atualizar performance score e content strategy", async () => {
      const { ctx } = createAuthContext(8);
      const caller = appRouter.createCaller(ctx);

      await caller.agents.initialize();
      const newStrategy = {
        platforms: ["instagram", "tiktok"],
        postingFrequency: "twice-daily",
        tone: "casual",
        targetAudience: "youth",
      };

      const result = await caller.agents.updateState({
        performanceScore: 92,
        contentStrategy: newStrategy,
      });

      expect(result.success).toBe(true);
      expect(result.agent.performanceScore).toBe(92);
      expect(result.agent.contentStrategy).toEqual(newStrategy);
    });
  });
});
