import type { ToolExecutionInput, ToolExecutionOutput } from "../types";

export class WhatsAppTool {
  readonly name = "whatsapp-tool";
  readonly channel = "whatsapp" as const;

  async run(input: ToolExecutionInput): Promise<ToolExecutionOutput> {
    const draft = {
      headline: `Mensagem pronta para ${input.audience}`,
      body: [
        `Oi! Estou entrando em contato porque a meta é ${input.goal.toLowerCase()}.`,
        `Separei uma oferta objetiva: ${input.offer}.`,
        "Se fizer sentido, posso te mandar os detalhes e próximos passos agora mesmo.",
      ].join(" "),
      cta: input.cta || "Responder SIM para receber a proposta.",
      hashtags: [],
      tone: input.brandVoice || "consultivo",
      channel: "whatsapp" as const,
    };

    return {
      success: true,
      toolName: this.name,
      draft,
      previewUrl: `https://preview.local/whatsapp/${input.sessionId}`,
      warnings: input.constraints?.length ? [`Restrições aplicadas: ${input.constraints.join(", ")}`] : [],
      metadata: {
        format: "conversation-starter",
        recommendedAssets: ["catalog-link", "quick-reply", "testimonial"],
      },
    };
  }
}

export const whatsappTool = new WhatsAppTool();
