import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAvailableModels,
  getModelInfo,
  activateModel,
  deactivateModel,
  getModelStats,
  generateContent,
  aiModels,
  type ContentGenerationRequest,
} from "../../backend/src/services/genkit-integration";

describe("genkit-integration", () => {
  beforeEach(() => {
    // Reset models to initial state
    aiModels.forEach((model) => {
      model.isActive = model.id === "gemini-2.0-flash" || 
                       model.id === "gemini-1.5-pro" || 
                       model.id === "gpt-4.1-mini";
    });
  });

  describe("getAvailableModels", () => {
    it("should return only active models", () => {
      const models = getAvailableModels();
      expect(models.length).toBeGreaterThan(0);
      expect(models.every((m) => m.isActive)).toBe(true);
    });

    it("should return at least 3 models by default", () => {
      const models = getAvailableModels();
      expect(models.length).toBeGreaterThanOrEqual(3);
    });

    it("should include Google Gemini models", () => {
      const models = getAvailableModels();
      const hasGemini = models.some((m) => m.provider === "google");
      expect(hasGemini).toBe(true);
    });

    it("should include OpenAI models", () => {
      const models = getAvailableModels();
      const hasOpenAI = models.some((m) => m.provider === "openai");
      expect(hasOpenAI).toBe(true);
    });

    it("should not include inactive models", () => {
      deactivateModel("gemini-2.0-flash");
      const models = getAvailableModels();
      const hasDeactivated = models.some((m) => m.id === "gemini-2.0-flash");
      expect(hasDeactivated).toBe(false);
    });
  });

  describe("getModelInfo", () => {
    it("should return model info for valid modelId", () => {
      const model = getModelInfo("gemini-2.0-flash");
      expect(model).toBeDefined();
      expect(model?.id).toBe("gemini-2.0-flash");
      expect(model?.name).toBe("Gemini 2.0 Flash");
      expect(model?.provider).toBe("google");
    });

    it("should return undefined for invalid modelId", () => {
      const model = getModelInfo("invalid-model-id");
      expect(model).toBeUndefined();
    });

    it("should return correct model properties", () => {
      const model = getModelInfo("gpt-4.1-mini");
      expect(model?.provider).toBe("openai");
      expect(model?.capabilities).toContain("text");
      expect(model?.maxTokens).toBe(4096);
      expect(model?.temperature).toBe(0.7);
    });

    it("should return model even if inactive", () => {
      deactivateModel("mmn-copywriting-v1");
      const model = getModelInfo("mmn-copywriting-v1");
      expect(model).toBeDefined();
      expect(model?.isActive).toBe(false);
    });
  });

  describe("activateModel", () => {
    it("should activate an inactive model", () => {
      deactivateModel("mmn-copywriting-v1");
      const result = activateModel("mmn-copywriting-v1");
      expect(result).toBe(true);
      const model = getModelInfo("mmn-copywriting-v1");
      expect(model?.isActive).toBe(true);
    });

    it("should return false for invalid modelId", () => {
      const result = activateModel("invalid-model-id");
      expect(result).toBe(false);
    });

    it("should not affect already active models", () => {
      const result = activateModel("gemini-2.0-flash");
      expect(result).toBe(true);
      const model = getModelInfo("gemini-2.0-flash");
      expect(model?.isActive).toBe(true);
    });

    it("should add model to available models after activation", () => {
      deactivateModel("mmn-strategy-v1");
      let models = getAvailableModels();
      const hasModel = models.some((m) => m.id === "mmn-strategy-v1");
      expect(hasModel).toBe(false);

      activateModel("mmn-strategy-v1");
      models = getAvailableModels();
      const hasModelAfter = models.some((m) => m.id === "mmn-strategy-v1");
      expect(hasModelAfter).toBe(true);
    });
  });

  describe("deactivateModel", () => {
    it("should deactivate an active model", () => {
      const result = deactivateModel("gemini-2.0-flash");
      expect(result).toBe(true);
      const model = getModelInfo("gemini-2.0-flash");
      expect(model?.isActive).toBe(false);
    });

    it("should return false for invalid modelId", () => {
      const result = deactivateModel("invalid-model-id");
      expect(result).toBe(false);
    });

    it("should remove model from available models", () => {
      deactivateModel("gemini-2.0-flash");
      const models = getAvailableModels();
      const hasModel = models.some((m) => m.id === "gemini-2.0-flash");
      expect(hasModel).toBe(false);
    });

    it("should not affect already inactive models", () => {
      const result = deactivateModel("mmn-copywriting-v1");
      expect(result).toBe(true);
      const model = getModelInfo("mmn-copywriting-v1");
      expect(model?.isActive).toBe(false);
    });
  });

  describe("getModelStats", () => {
    it("should return stats object with required properties", () => {
      const stats = getModelStats();
      expect(stats).toHaveProperty("totalModels");
      expect(stats).toHaveProperty("activeModels");
      expect(stats).toHaveProperty("providers");
      expect(stats).toHaveProperty("models");
    });

    it("should return correct total model count", () => {
      const stats = getModelStats();
      expect(stats.totalModels).toBe(5);
    });

    it("should return correct active model count", () => {
      const stats = getModelStats();
      expect(stats.activeModels).toBeGreaterThanOrEqual(3);
    });

    it("should return provider breakdown", () => {
      const stats = getModelStats();
      expect(stats.providers.google).toBeGreaterThan(0);
      expect(stats.providers.openai).toBeGreaterThan(0);
      expect(stats.providers.proprietary).toBeGreaterThan(0);
    });

    it("should return models array with id, name, provider, isActive", () => {
      const stats = getModelStats();
      expect(stats.models.length).toBe(5);
      stats.models.forEach((model) => {
        expect(model).toHaveProperty("id");
        expect(model).toHaveProperty("name");
        expect(model).toHaveProperty("provider");
        expect(model).toHaveProperty("isActive");
      });
    });

    it("should update stats when model is activated/deactivated", () => {
      deactivateModel("mmn-copywriting-v1");
      let stats = getModelStats();
      const initialActive = stats.activeModels;

      activateModel("mmn-copywriting-v1");
      stats = getModelStats();
      expect(stats.activeModels).toBe(initialActive + 1);
    });
  });

  describe("generateContent", () => {
    it("should throw error for non-existent model", async () => {
      const request: ContentGenerationRequest = {
        prompt: "Generate marketing content",
        modelId: "non-existent-model",
      };

      await expect(generateContent(request)).rejects.toThrow(
        "Modelo non-existent-model não encontrado"
      );
    });

    it("should throw error for inactive model", async () => {
      deactivateModel("gemini-2.0-flash");
      const request: ContentGenerationRequest = {
        prompt: "Generate marketing content",
        modelId: "gemini-2.0-flash",
      };

      await expect(generateContent(request)).rejects.toThrow(
        "Modelo gemini-2.0-flash não está ativo"
      );
    });

    it("should generate content with Google model", async () => {
      const request: ContentGenerationRequest = {
        prompt: "Create a marketing post about AI",
        modelId: "gemini-2.0-flash",
        platform: "instagram",
        tone: "professional",
      };

      const response = await generateContent(request);
      expect(response.success).toBe(true);
      expect(response.content).toBeDefined();
      expect(response.modelUsed).toBe("Gemini 2.0 Flash");
      expect(response.provider).toBe("google");
      expect(response.tokensUsed).toBeGreaterThan(0);
      expect(response.generatedAt).toBeInstanceOf(Date);
      expect(response.platform).toBe("instagram");
      expect(response.tone).toBe("professional");
    });

    it("should generate content with OpenAI model", async () => {
      const request: ContentGenerationRequest = {
        prompt: "Create a Twitter post about technology",
        modelId: "gpt-4.1-mini",
        platform: "twitter",
        tone: "casual",
      };

      const response = await generateContent(request);
      expect(response.success).toBe(true);
      expect(response.content).toBeDefined();
      expect(response.modelUsed).toBe("GPT-4 Mini");
      expect(response.provider).toBe("openai");
    });

    it("should throw error for proprietary models", async () => {
      activateModel("mmn-copywriting-v1");
      const request: ContentGenerationRequest = {
        prompt: "Generate marketing content",
        modelId: "mmn-copywriting-v1",
      };

      await expect(generateContent(request)).rejects.toThrow(
        "ainda não está disponível"
      );
    });

    it("should respect temperature parameter", async () => {
      const request: ContentGenerationRequest = {
        prompt: "Generate content",
        modelId: "gemini-2.0-flash",
        temperature: 0.5,
      };

      const response = await generateContent(request);
      expect(response.success).toBe(true);
    });

    it("should respect maxLength parameter", async () => {
      const request: ContentGenerationRequest = {
        prompt: "Generate content",
        modelId: "gemini-2.0-flash",
        maxLength: 100,
      };

      const response = await generateContent(request);
      expect(response.success).toBe(true);
    });

    it("should include hashtags when requested", async () => {
      const request: ContentGenerationRequest = {
        prompt: "Generate Instagram post",
        modelId: "gemini-2.0-flash",
        platform: "instagram",
        includeHashtags: true,
      };

      const response = await generateContent(request);
      expect(response.success).toBe(true);
    });

    it("should include emojis when requested", async () => {
      const request: ContentGenerationRequest = {
        prompt: "Generate Instagram post",
        modelId: "gemini-2.0-flash",
        platform: "instagram",
        includeEmojis: true,
      };

      const response = await generateContent(request);
      expect(response.success).toBe(true);
    });

    it("should handle all platform options", async () => {
      const platforms = ["instagram", "tiktok", "twitter", "linkedin", "blog", "whatsapp"] as const;

      for (const platform of platforms) {
        const request: ContentGenerationRequest = {
          prompt: `Generate content for ${platform}`,
          modelId: "gemini-2.0-flash",
          platform,
        };

        const response = await generateContent(request);
        expect(response.success).toBe(true);
        expect(response.platform).toBe(platform);
      }
    });

    it("should handle all tone options", async () => {
      const tones = ["professional", "casual", "persuasive", "humorous"] as const;

      for (const tone of tones) {
        const request: ContentGenerationRequest = {
          prompt: `Generate ${tone} content`,
          modelId: "gemini-2.0-flash",
          tone,
        };

        const response = await generateContent(request);
        expect(response.success).toBe(true);
        expect(response.tone).toBe(tone);
      }
    });
  });

  describe("Model Configuration", () => {
    it("should have correct model costs", () => {
      const model = getModelInfo("gemini-2.0-flash");
      expect(model?.costPerRequest).toBe(0.0001);
    });

    it("should have correct max tokens", () => {
      const model = getModelInfo("gemini-1.5-pro");
      expect(model?.maxTokens).toBe(100000);
    });

    it("should have correct capabilities", () => {
      const model = getModelInfo("gemini-2.0-flash");
      expect(model?.capabilities).toContain("text");
      expect(model?.capabilities).toContain("image");
    });

    it("should have response time estimates", () => {
      const model = getModelInfo("gemini-2.0-flash");
      expect(model?.responseTime).toBeDefined();
      expect(model?.responseTime).toContain("ms");
    });
  });
});
