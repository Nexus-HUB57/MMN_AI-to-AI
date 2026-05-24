import { z } from "zod";
import { protectedProcedure, router } from "../config/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../services/llm-v2";

/**
 * Content Generation Router
 * Handles AI-powered content creation for social media platforms
 */

export const contentGenerationRouter = router({
  /**
   * Generate optimized text for a specific platform
   */
  generateText: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["whatsapp", "instagram", "facebook"]),
        topic: z.string(),
        tone: z.enum(["professional", "casual", "persuasive", "humorous"]),
        maxLength: z.number().optional().default(280),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const platformGuidelines: Record<string, string> = {
          whatsapp: "WhatsApp messages should be personal and conversational",
          instagram:
            "Instagram captions should be engaging with relevant hashtags",
          facebook: "Facebook posts should encourage engagement and sharing",
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert social media content creator. Create engaging content for ${input.platform}. 
Guidelines: ${platformGuidelines[input.platform]}
Tone: ${input.tone}
Maximum length: ${input.maxLength} characters
Always include relevant emojis and hashtags where appropriate.`,
            },
            {
              role: "user",
              content: `Create a ${input.tone} post about: ${input.topic}`,
            },
          ],
        });

        const content =
          response.content || "Failed to generate content";

        return {
          success: true,
          platform: input.platform,
          content: content.toString().substring(0, input.maxLength),
          tone: input.tone,
          generatedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate content",
        });
      }
    }),

  /**
   * Generate multiple variations of content
   */
  generateVariations: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["whatsapp", "instagram", "facebook"]),
        topic: z.string(),
        count: z.number().min(1).max(5).default(3),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const variations = [];

        for (let i = 0; i < input.count; i++) {
          const tones: Array<"professional" | "casual" | "persuasive" | "humorous"> = [
            "professional",
            "casual",
            "persuasive",
            "humorous",
          ];
          const tone = tones[i % tones.length];

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `Create a ${tone} social media post for ${input.platform} about: ${input.topic}`,
              },
              {
                role: "user",
                content: `Generate variation ${i + 1} with tone: ${tone}`,
              },
            ],
          });

          variations.push({
            variation: i + 1,
            tone,
            content: response.content || "",
          });
        }

        return {
          success: true,
          platform: input.platform,
          topic: input.topic,
          variations,
          generatedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate variations",
        });
      }
    }),

  /**
   * Generate hashtags for content
   */
  generateHashtags: protectedProcedure
    .input(
      z.object({
        topic: z.string(),
        platform: z.enum(["whatsapp", "instagram", "facebook"]),
        count: z.number().min(1).max(30).default(10),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Generate ${input.count} relevant hashtags for ${input.platform} about: ${input.topic}
Return only hashtags separated by spaces, no explanations.`,
            },
            {
              role: "user",
              content: `Generate hashtags for: ${input.topic}`,
            },
          ],
        });

        const hashtags =
          response.content?.toString().split(/\s+/) || [];

        return {
          success: true,
          topic: input.topic,
          platform: input.platform,
          hashtags: hashtags.slice(0, input.count),
          generatedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate hashtags",
        });
      }
    }),

  /**
   * Analyze sentiment of content
   */
  analyzeSentiment: protectedProcedure
    .input(
      z.object({
        content: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Analyze the sentiment of the given text. Return a JSON object with: sentiment (positive/negative/neutral), score (0-100), and brief explanation.",
            },
            {
              role: "user",
              content: `Analyze sentiment: ${input.content}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "sentiment_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  sentiment: {
                    type: "string",
                    enum: ["positive", "negative", "neutral"],
                  },
                  score: { type: "number", minimum: 0, maximum: 100 },
                  explanation: { type: "string" },
                },
                required: ["sentiment", "score", "explanation"],
                additionalProperties: false,
              },
            },
          },
        });

        const result = JSON.parse(
          response.content?.toString() || "{}"
        );

        return {
          success: true,
          ...result,
          analyzedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze sentiment",
        });
      }
    }),

  /**
   * Generate product description
   */
  generateProductDescription: protectedProcedure
    .input(
      z.object({
        productName: z.string(),
        productCategory: z.string(),
        features: z.array(z.string()),
        targetAudience: z.string(),
        platform: z.enum(["whatsapp", "instagram", "facebook"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Create an engaging product description for ${input.platform} that converts.
Product: ${input.productName}
Category: ${input.productCategory}
Features: ${input.features.join(", ")}
Target Audience: ${input.targetAudience}

Make it persuasive, include benefits, and add appropriate emojis and call-to-action.`,
            },
            {
              role: "user",
              content: `Generate a compelling description for this product`,
            },
          ],
        });

        return {
          success: true,
          productName: input.productName,
          platform: input.platform,
          description: response.content || "",
          generatedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate product description",
        });
      }
    }),

  /**
   * Generate email sequence for sales funnel
   */
  generateEmailSequence: protectedProcedure
    .input(
      z.object({
        productName: z.string(),
        productPrice: z.number(),
        targetAudience: z.string(),
        emailCount: z.number().min(1).max(5).default(3),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const emails = [];

        for (let i = 1; i <= input.emailCount; i++) {
          const emailType =
            i === 1
              ? "introduction"
              : i === input.emailCount
                ? "final call to action"
                : "value proposition";

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `Generate an email (${emailType}) for a sales funnel.
Product: ${input.productName}
Price: R$ ${input.productPrice}
Target Audience: ${input.targetAudience}
Email ${i} of ${input.emailCount}

Include: subject line, greeting, body, and CTA.`,
              },
              {
                role: "user",
                content: `Generate email ${i}`,
              },
            ],
          });

          emails.push({
            emailNumber: i,
            type: emailType,
            content: response.content || "",
          });
        }

        return {
          success: true,
          productName: input.productName,
          emailSequence: emails,
          generatedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate email sequence",
        });
      }
    }),
});
