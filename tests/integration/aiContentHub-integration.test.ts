import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { aiContentHubRouter } from "../../backend/src/routers/aiContentHubRouter";
import {
  generateContent,
  getAvailableModels,
  activateModel,
  deactivateModel,
} from "../../backend/src/services/genkit-integration";
import type { TrpcContext } from "../../backend/src/config/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(): { ctx: TrpcContext; user: AuthenticatedUser } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-integration",
    email: "integration@test.com",
    name: "Integration Test User",
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

describe("AI Content Hub - Integration Tests", () => {
  let caller: ReturnType<typeof aiContentHubRouter.createCaller>;

  beforeEach(() => {
    const { ctx } = createMockContext();
    caller = aiContentHubRouter.createCaller(ctx);
  });

  describe("Complete Content Generation Flow", () => {
    it("should complete full content generation workflow", async () => {
      // Step 1: List available models
      const modelsResult = await caller.listModels();
      expect(modelsResult.success).toBe(true);
      expect(modelsResult.models.length).toBeGreaterThan(0);

      const modelId = modelsResult.models[0]?.id;
      expect(modelId).toBeDefined();

      // Step 2: Get model details
      const modelResult = await caller.getModel({ modelId: modelId! });
      expect(modelResult.success).toBe(true);
      expect(modelResult.model?.id).toBe(modelId);

      // Step 3: Generate content
      const contentResult = await caller.generateContent({
        prompt: "Create an engaging Instagram post about sustainable fashion",
        modelId: modelId!,
        platform: "instagram",
        tone: "persuasive",
        includeHashtags: true,
        includeEmojis: true,
      });

      expect(contentResult.success).toBe(true);
      expect(contentResult.content).toBeDefined();
      expect(contentResult.content.length).toBeGreaterThan(0);
      expect(contentResult.modelUsed).toBe(modelResult.model?.name);

      // Step 4: Generate variations
      const variationsResult = await caller.generateVariations({
        prompt: "Create an engaging Instagram post about sustainable fashion",
        modelId: modelId!,
        count: 3,
        platform: "instagram",
      });

      expect(variationsResult.success).toBe(true);
      expect(variationsResult.variations.length).toBe(3);
      variationsResult.variations.forEach((variation) => {
        expect(variation.content).toBeDefined();
        expect(variation.tone).toBeDefined();
      });
    });

    it("should handle content generation across multiple platforms", async () => {
      const platforms = ["instagram", "twitter", "linkedin"] as const;
      const results = [];

      for (const platform of platforms) {
        const result = await caller.generateContent({
          prompt: `Create a ${platform} post about technology trends`,
          modelId: "gemini-2.0-flash",
          platform,
          tone: "professional",
        });

        expect(result.success).toBe(true);
        expect(result.platform).toBe(platform);
        results.push(result);
      }

      expect(results.length).toBe(3);
    });

    it("should generate content with different tones and compare", async () => {
      const prompt = "Create a marketing post about a new product launch";
      const tones = ["professional", "casual", "persuasive", "humorous"] as const;
      const contents = [];

      for (const tone of tones) {
        const result = await caller.generateContent({
          prompt,
          modelId: "gemini-2.0-flash",
          tone,
        });

        expect(result.success).toBe(true);
        expect(result.tone).toBe(tone);
        contents.push(result.content);
      }

      // Verify that different tones produce different content
      const uniqueContents = new Set(contents);
      expect(uniqueContents.size).toBeGreaterThan(1);
    });
  });

  describe("Template Management Flow", () => {
    it("should create and retrieve templates", async () => {
      // Create template
      const createResult = await caller.createTemplate({
        name: "Product Launch Template",
        description: "Template for product launch announcements",
        category: "product_launch",
        content: "🎉 Exciting news! {{product_name}} is now available! {{description}}",
        variables: ["product_name", "description"],
        platform: "instagram",
      });

      expect(createResult.success).toBe(true);
      expect(createResult.template.id).toBeDefined();

      // List templates
      const listResult = await caller.listTemplates();
      expect(listResult.success).toBe(true);
      expect(Array.isArray(listResult.templates)).toBe(true);
    });

    it("should create templates for different platforms", async () => {
      const platforms = ["instagram", "twitter", "linkedin", "tiktok"] as const;

      for (const platform of platforms) {
        const result = await caller.createTemplate({
          name: `${platform} Template`,
          description: `Template for ${platform}`,
          category: "general",
          content: `Content for ${platform}`,
          platform,
        });

        expect(result.success).toBe(true);
        expect(result.template.platform).toBe(platform);
      }
    });
  });

  describe("Post Scheduling Flow", () => {
    it("should schedule posts for multiple platforms", async () => {
      const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const result = await caller.schedulePost({
        title: "Multi-Platform Campaign",
        content: "Check out our new collection! Limited time offer.",
        platforms: ["instagram", "twitter", "facebook"],
        scheduledFor,
        mediaUrls: ["https://example.com/image1.jpg"],
      });

      expect(result.success).toBe(true);
      expect(result.post.id).toBeDefined();
      expect(result.post.status).toBe("scheduled");
      expect(result.post.platforms.length).toBe(3);
    });

    it("should schedule posts at different times", async () => {
      const posts = [];

      for (let i = 0; i < 3; i++) {
        const scheduledFor = new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000);

        const result = await caller.schedulePost({
          content: `Post ${i + 1}`,
          platforms: ["instagram"],
          scheduledFor,
        });

        expect(result.success).toBe(true);
        posts.push(result.post);
      }

      expect(posts.length).toBe(3);
    });
  });

  describe("Analytics and Reporting Flow", () => {
    it("should retrieve analytics for different periods", async () => {
      const periods = ["day", "week", "month"] as const;

      for (const period of periods) {
        const result = await caller.getContentAnalytics({ period });
        expect(result.success).toBe(true);
        expect(result.analytics.period).toBe(period);
        expect(result.analytics).toHaveProperty("totalPosts");
        expect(result.analytics).toHaveProperty("totalViews");
        expect(result.analytics).toHaveProperty("totalLikes");
        expect(result.analytics).toHaveProperty("avgEngagement");
      }
    });

    it("should retrieve analytics by platform", async () => {
      const platforms = ["instagram", "twitter", "linkedin"] as const;

      for (const platform of platforms) {
        const result = await caller.getContentAnalytics({ platform });
        expect(result.success).toBe(true);
        expect(result.analytics.platform).toBe(platform);
      }
    });

    it("should combine period and platform filters", async () => {
      const result = await caller.getContentAnalytics({
        period: "week",
        platform: "instagram",
      });

      expect(result.success).toBe(true);
      expect(result.analytics.period).toBe("week");
      expect(result.analytics.platform).toBe("instagram");
    });
  });

  describe("Model Management Flow", () => {
    it("should activate proprietary models", async () => {
      const result = await caller.activateModel({
        modelId: "mmn-copywriting-v1",
      });

      expect(result.success).toBe(true);

      // Verify model is now available
      const modelsResult = await caller.listModels();
      const hasModel = modelsResult.models.some(
        (m) => m.id === "mmn-copywriting-v1"
      );
      expect(hasModel).toBe(true);
    });

    it("should deactivate models", async () => {
      // First activate
      await caller.activateModel({
        modelId: "mmn-strategy-v1",
      });

      // Then deactivate
      const result = await caller.deactivateModel({
        modelId: "mmn-strategy-v1",
      });

      expect(result.success).toBe(true);
    });

    it("should get model statistics", async () => {
      const result = await caller.getModelStats();
      expect(result.success).toBe(true);
      expect(result.stats.totalModels).toBeGreaterThan(0);
      expect(result.stats.activeModels).toBeGreaterThan(0);
      expect(result.stats.providers).toHaveProperty("google");
      expect(result.stats.providers).toHaveProperty("openai");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle invalid model gracefully", async () => {
      try {
        await caller.generateContent({
          prompt: "Generate content",
          modelId: "non-existent-model-12345",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain("Modelo");
      }
    });

    it("should handle very long prompts", async () => {
      const longPrompt =
        "Generate content about AI. " +
        "AI is transforming industries. ".repeat(50);

      const result = await caller.generateContent({
        prompt: longPrompt,
        modelId: "gemini-2.0-flash",
      });

      expect(result.success).toBe(true);
    });

    it("should handle special characters in content", async () => {
      const specialPrompt =
        'Generate content with special chars: @#$%^&*()_+-=[]{}|;:",.<>?/~`';

      const result = await caller.generateContent({
        prompt: specialPrompt,
        modelId: "gemini-2.0-flash",
      });

      expect(result.success).toBe(true);
    });

    it("should handle concurrent requests", async () => {
      const requests = Array(5)
        .fill(null)
        .map((_, i) =>
          caller.generateContent({
            prompt: `Generate content ${i}`,
            modelId: "gemini-2.0-flash",
          })
        );

      const results = await Promise.all(requests);
      expect(results.length).toBe(5);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should handle rapid successive requests", async () => {
      const results = [];

      for (let i = 0; i < 5; i++) {
        const result = await caller.generateContent({
          prompt: `Request ${i}`,
          modelId: "gemini-2.0-flash",
        });
        results.push(result);
      }

      expect(results.length).toBe(5);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Data Consistency", () => {
    it("should maintain consistency across multiple operations", async () => {
      // Generate content
      const contentResult = await caller.generateContent({
        prompt: "Create marketing content",
        modelId: "gemini-2.0-flash",
      });

      expect(contentResult.success).toBe(true);

      // Create template
      const templateResult = await caller.createTemplate({
        name: "Test Template",
        description: "Test",
        category: "test",
        content: contentResult.content,
      });

      expect(templateResult.success).toBe(true);

      // Schedule post
      const scheduleResult = await caller.schedulePost({
        content: contentResult.content,
        platforms: ["instagram"],
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      expect(scheduleResult.success).toBe(true);
    });
  });

  describe("Performance Metrics", () => {
    it("should generate content within acceptable time", async () => {
      const startTime = Date.now();

      const result = await caller.generateContent({
        prompt: "Generate marketing content",
        modelId: "gemini-2.0-flash",
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });

    it("should handle batch operations efficiently", async () => {
      const startTime = Date.now();

      const results = await Promise.all([
        caller.generateContent({
          prompt: "Content 1",
          modelId: "gemini-2.0-flash",
        }),
        caller.generateContent({
          prompt: "Content 2",
          modelId: "gemini-2.0-flash",
        }),
        caller.generateContent({
          prompt: "Content 3",
          modelId: "gemini-2.0-flash",
        }),
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.length).toBe(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });

      // Batch should complete within 10 seconds
      expect(duration).toBeLessThan(10000);
    });
  });
});
