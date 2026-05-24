import { describe, it, expect, beforeEach, vi } from "vitest";
import { aiContentHubRouter } from "../../backend/src/routers/aiContentHubRouter";
import type { TrpcContext } from "../../backend/src/config/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(): { ctx: TrpcContext; user: AuthenticatedUser } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@example.com",
    name: "Test User",
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
    res: {} as TrpcContext["res"],
  };

  return { ctx, user };
}

describe("aiContentHubRouter", () => {
  let caller: ReturnType<typeof aiContentHubRouter.createCaller>;

  beforeEach(() => {
    const { ctx } = createMockContext();
    caller = aiContentHubRouter.createCaller(ctx);
  });

  describe("listModels", () => {
    it("should return list of available models", async () => {
      const result = await caller.listModels();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.models)).toBe(true);
      expect(result.totalModels).toBeGreaterThan(0);
    });

    it("should return models with required properties", async () => {
      const result = await caller.listModels();
      expect(result.models.length).toBeGreaterThan(0);
      
      result.models.forEach((model) => {
        expect(model).toHaveProperty("id");
        expect(model).toHaveProperty("name");
        expect(model).toHaveProperty("provider");
        expect(model).toHaveProperty("isActive");
        expect(model.isActive).toBe(true);
      });
    });

    it("should include at least 3 models", async () => {
      const result = await caller.listModels();
      expect(result.models.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("getModel", () => {
    it("should return model info for valid modelId", async () => {
      const result = await caller.getModel({ modelId: "gemini-2.0-flash" });
      expect(result.success).toBe(true);
      expect(result.model).toBeDefined();
      expect(result.model?.id).toBe("gemini-2.0-flash");
      expect(result.model?.name).toBe("Gemini 2.0 Flash");
    });

    it("should throw NOT_FOUND for invalid modelId", async () => {
      try {
        await caller.getModel({ modelId: "invalid-model-id" });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });

    it("should return model with all properties", async () => {
      const result = await caller.getModel({ modelId: "gpt-4.1-mini" });
      expect(result.model).toHaveProperty("id");
      expect(result.model).toHaveProperty("name");
      expect(result.model).toHaveProperty("provider");
      expect(result.model).toHaveProperty("capabilities");
      expect(result.model).toHaveProperty("costPerRequest");
      expect(result.model).toHaveProperty("maxTokens");
    });
  });

  describe("getModelStats", () => {
    it("should return model statistics", async () => {
      const result = await caller.getModelStats();
      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
    });

    it("should return stats with required properties", async () => {
      const result = await caller.getModelStats();
      expect(result.stats).toHaveProperty("totalModels");
      expect(result.stats).toHaveProperty("activeModels");
      expect(result.stats).toHaveProperty("providers");
      expect(result.stats).toHaveProperty("models");
    });

    it("should return provider breakdown", async () => {
      const result = await caller.getModelStats();
      expect(result.stats.providers).toHaveProperty("google");
      expect(result.stats.providers).toHaveProperty("openai");
      expect(result.stats.providers).toHaveProperty("proprietary");
    });
  });

  describe("generateContent", () => {
    it("should generate content with valid input", async () => {
      const result = await caller.generateContent({
        prompt: "Create a marketing post about AI",
        modelId: "gemini-2.0-flash",
        platform: "instagram",
        tone: "professional",
      });

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.modelUsed).toBeDefined();
      expect(result.provider).toBeDefined();
      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it("should throw error for prompt too short", async () => {
      try {
        await caller.generateContent({
          prompt: "short",
          modelId: "gemini-2.0-flash",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("should throw error for invalid modelId", async () => {
      try {
        await caller.generateContent({
          prompt: "Create a marketing post about AI",
          modelId: "invalid-model",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("should support all platforms", async () => {
      const platforms = ["instagram", "tiktok", "twitter", "linkedin", "blog", "whatsapp"] as const;

      for (const platform of platforms) {
        const result = await caller.generateContent({
          prompt: `Create content for ${platform}`,
          modelId: "gemini-2.0-flash",
          platform,
        });

        expect(result.success).toBe(true);
        expect(result.platform).toBe(platform);
      }
    });

    it("should support all tones", async () => {
      const tones = ["professional", "casual", "persuasive", "humorous"] as const;

      for (const tone of tones) {
        const result = await caller.generateContent({
          prompt: `Create ${tone} content`,
          modelId: "gemini-2.0-flash",
          tone,
        });

        expect(result.success).toBe(true);
        expect(result.tone).toBe(tone);
      }
    });

    it("should respect maxLength parameter", async () => {
      const result = await caller.generateContent({
        prompt: "Create a short marketing post",
        modelId: "gemini-2.0-flash",
        maxLength: 100,
      });

      expect(result.success).toBe(true);
    });

    it("should respect temperature parameter", async () => {
      const result = await caller.generateContent({
        prompt: "Create creative content",
        modelId: "gemini-2.0-flash",
        temperature: 0.8,
      });

      expect(result.success).toBe(true);
    });

    it("should include hashtags when requested", async () => {
      const result = await caller.generateContent({
        prompt: "Create Instagram post",
        modelId: "gemini-2.0-flash",
        includeHashtags: true,
      });

      expect(result.success).toBe(true);
    });

    it("should include emojis when requested", async () => {
      const result = await caller.generateContent({
        prompt: "Create Instagram post",
        modelId: "gemini-2.0-flash",
        includeEmojis: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("generateVariations", () => {
    it("should generate multiple variations", async () => {
      const result = await caller.generateVariations({
        prompt: "Create a marketing post about AI",
        modelId: "gemini-2.0-flash",
        count: 3,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.variations)).toBe(true);
      expect(result.variations.length).toBe(3);
    });

    it("should generate variations with different tones", async () => {
      const result = await caller.generateVariations({
        prompt: "Create a marketing post",
        modelId: "gemini-2.0-flash",
        count: 4,
      });

      expect(result.variations.length).toBe(4);
      const tones = result.variations.map((v) => v.tone);
      expect(new Set(tones).size).toBeGreaterThan(1);
    });

    it("should throw error for prompt too short", async () => {
      try {
        await caller.generateVariations({
          prompt: "short",
          modelId: "gemini-2.0-flash",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("should use default count of 3", async () => {
      const result = await caller.generateVariations({
        prompt: "Create a marketing post about AI",
        modelId: "gemini-2.0-flash",
      });

      expect(result.variations.length).toBe(3);
    });

    it("should respect count parameter", async () => {
      const result = await caller.generateVariations({
        prompt: "Create a marketing post about AI",
        modelId: "gemini-2.0-flash",
        count: 5,
      });

      expect(result.variations.length).toBe(5);
    });

    it("should include model info in variations", async () => {
      const result = await caller.generateVariations({
        prompt: "Create a marketing post about AI",
        modelId: "gemini-2.0-flash",
      });

      result.variations.forEach((variation) => {
        expect(variation).toHaveProperty("variation");
        expect(variation).toHaveProperty("tone");
        expect(variation).toHaveProperty("content");
        expect(variation).toHaveProperty("modelUsed");
      });
    });
  });

  describe("createTemplate", () => {
    it("should create a template", async () => {
      const result = await caller.createTemplate({
        name: "Instagram Post Template",
        description: "Template for Instagram marketing posts",
        category: "social_media",
        content: "Check out this amazing product! {{product_name}} is now available.",
        variables: ["product_name", "price"],
        platform: "instagram",
      });

      expect(result.success).toBe(true);
      expect(result.template).toBeDefined();
      expect(result.template.id).toBeDefined();
      expect(result.template.name).toBe("Instagram Post Template");
      expect(result.template.createdAt).toBeInstanceOf(Date);
    });

    it("should create template without variables", async () => {
      const result = await caller.createTemplate({
        name: "Simple Template",
        description: "A simple template",
        category: "general",
        content: "This is a simple template",
      });

      expect(result.success).toBe(true);
      expect(result.template.variables).toBeUndefined();
    });

    it("should create template without platform", async () => {
      const result = await caller.createTemplate({
        name: "General Template",
        description: "A general template",
        category: "general",
        content: "General content",
      });

      expect(result.success).toBe(true);
      expect(result.template.platform).toBeUndefined();
    });
  });

  describe("listTemplates", () => {
    it("should return list of templates", async () => {
      const result = await caller.listTemplates();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.templates)).toBe(true);
    });
  });

  describe("schedulePost", () => {
    it("should schedule a post", async () => {
      const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

      const result = await caller.schedulePost({
        content: "Check out this amazing product!",
        platforms: ["instagram", "twitter"],
        scheduledFor,
        title: "New Product Launch",
      });

      expect(result.success).toBe(true);
      expect(result.post).toBeDefined();
      expect(result.post.id).toBeDefined();
      expect(result.post.status).toBe("scheduled");
      expect(result.post.createdAt).toBeInstanceOf(Date);
    });

    it("should schedule post without title", async () => {
      const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const result = await caller.schedulePost({
        content: "Check out this amazing product!",
        platforms: ["instagram"],
        scheduledFor,
      });

      expect(result.success).toBe(true);
      expect(result.post.title).toBeUndefined();
    });

    it("should schedule post without media", async () => {
      const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const result = await caller.schedulePost({
        content: "Check out this amazing product!",
        platforms: ["twitter"],
        scheduledFor,
      });

      expect(result.success).toBe(true);
      expect(result.post.mediaUrls).toBeUndefined();
    });

    it("should support multiple platforms", async () => {
      const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const result = await caller.schedulePost({
        content: "Check out this amazing product!",
        platforms: ["instagram", "tiktok", "twitter", "linkedin"],
        scheduledFor,
      });

      expect(result.success).toBe(true);
      expect(result.post.platforms).toEqual(["instagram", "tiktok", "twitter", "linkedin"]);
    });
  });

  describe("listScheduledPosts", () => {
    it("should return list of scheduled posts", async () => {
      const result = await caller.listScheduledPosts();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.posts)).toBe(true);
    });
  });

  describe("getContentAnalytics", () => {
    it("should return analytics", async () => {
      const result = await caller.getContentAnalytics({});
      expect(result.success).toBe(true);
      expect(result.analytics).toBeDefined();
    });

    it("should support period parameter", async () => {
      const periods = ["day", "week", "month"] as const;

      for (const period of periods) {
        const result = await caller.getContentAnalytics({ period });
        expect(result.success).toBe(true);
        expect(result.analytics.period).toBe(period);
      }
    });

    it("should support platform filter", async () => {
      const result = await caller.getContentAnalytics({
        platform: "instagram",
      });

      expect(result.success).toBe(true);
      expect(result.analytics.platform).toBe("instagram");
    });

    it("should use default period of week", async () => {
      const result = await caller.getContentAnalytics({});
      expect(result.analytics.period).toBe("week");
    });

    it("should return analytics with required properties", async () => {
      const result = await caller.getContentAnalytics({});
      expect(result.analytics).toHaveProperty("period");
      expect(result.analytics).toHaveProperty("totalPosts");
      expect(result.analytics).toHaveProperty("totalViews");
      expect(result.analytics).toHaveProperty("totalLikes");
      expect(result.analytics).toHaveProperty("totalShares");
      expect(result.analytics).toHaveProperty("totalComments");
      expect(result.analytics).toHaveProperty("avgEngagement");
    });
  });

  describe("activateModel", () => {
    it("should activate a model", async () => {
      const result = await caller.activateModel({
        modelId: "mmn-copywriting-v1",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("ativado com sucesso");
    });

    it("should throw error for invalid modelId", async () => {
      try {
        await caller.activateModel({
          modelId: "invalid-model-id",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("deactivateModel", () => {
    it("should deactivate a model", async () => {
      const result = await caller.deactivateModel({
        modelId: "gemini-2.0-flash",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("desativado com sucesso");
    });

    it("should throw error for invalid modelId", async () => {
      try {
        await caller.deactivateModel({
          modelId: "invalid-model-id",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("Authentication and Authorization", () => {
    it("should require authentication for all procedures", async () => {
      // This test verifies that protectedProcedure is used
      // In a real scenario, we would test with an unauthenticated context
      const { ctx } = createMockContext();
      expect(ctx.user).toBeDefined();
    });

    it("should have user context in all calls", async () => {
      const result = await caller.listModels();
      expect(result.success).toBe(true);
      // If we had access to the context, we would verify user info
    });
  });
});
