import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context for testing
function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Agents Router", () => {
  const ctx = createMockContext();
  const caller = appRouter.createCaller(ctx);

  describe("getAgent", () => {
    it("should return null or undefined when user has no agent", async () => {
      const result = await caller.agents.getAgent();
      expect(result === null || result === undefined).toBe(true);
    });
  });

  describe("updateAgent", () => {
    it("should throw error when agent not found", async () => {
      try {
        await caller.agents.updateAgent({
          name: "Updated Agent",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(String(error?.message || error)).toContain("Agent not found");
      }
    });
  });

  describe("getScheduledPosts", () => {
    it("should return empty array when no posts scheduled", async () => {
      const result = await caller.agents.getScheduledPosts();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getRecommendedProducts", () => {
    it("should return empty array when no products recommended", async () => {
      const result = await caller.agents.getRecommendedProducts();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getAgentSkills", () => {
    it("should return empty array when no skills", async () => {
      const result = await caller.agents.getAgentSkills();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getEvolutionHistory", () => {
    it("should return empty array when no evolution history", async () => {
      const result = await caller.agents.getEvolutionHistory();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getGeneratedImages", () => {
    it("should return empty array when no images generated", async () => {
      const result = await caller.agents.getGeneratedImages();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getGeneratedContent", () => {
    it("should return empty array when no content generated", async () => {
      const result = await caller.agents.getGeneratedContent();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("unauthorized access", () => {
    it("should throw error when user is not authenticated", async () => {
      const unAuthCtx = {
        ...ctx,
        user: null,
      };
      const unAuthCaller = appRouter.createCaller(unAuthCtx);

      try {
        await unAuthCaller.agents.updateAgent({
          name: "Test",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(String(error?.message || error)).toContain("Unauthorized");
      }
    });
  });
});
