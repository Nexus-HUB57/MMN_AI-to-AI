import type { ToolExecutionInput, ToolExecutionOutput } from "../types";

function hashtagify(parts: string[]) {
  return parts
    .flatMap((part) => part.split(/\s+/))
    .map((token) => token.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((token) => token.length > 3)
    .slice(0, 5)
    .map((token) => `#${token.charAt(0).toUpperCase()}${token.slice(1)}`);
}

export class InstagramTool {
  readonly name = "instagram-tool";
  readonly channel = "instagram" as const;

  async run(input: ToolExecutionInput): Promise<ToolExecutionOutput> {
    const hashtags = Array.from(new Set(hashtagify([input.goal, input.audience, input.offer])));
    const draft = {
      headline: `Transforme ${input.goal.toLowerCase()} com ${input.offer}`,
      body: [
        `Se você fala com ${input.audience}, esta campanha foi pensada para gerar atenção rápida e intenção de compra.`,
        `Oferta em destaque: ${input.offer}.`,
        input.brandVoice ? `Tom da marca: ${input.brandVoice}.` : "Tom visual: aspiracional, direto e orientado para ação.",
      ].join(" "),
      cta: input.cta || "Comente QUERO para receber o próximo passo.",
      hashtags,
      tone: input.brandVoice || "confiante",
      channel: "instagram" as const,
    };

    return {
      success: true,
      toolName: this.name,
      draft,
      previewUrl: `https://preview.local/instagram/${input.sessionId}`,
      warnings: input.constraints?.length ? [`Restrições aplicadas: ${input.constraints.join(", ")}`] : [],
      metadata: {
        format: "feed-caption",
        recommendedAssets: ["hero-image", "social-proof-card", "cta-slide"],
      },
    };
  }
}

export const instagramTool = new InstagramTool();
