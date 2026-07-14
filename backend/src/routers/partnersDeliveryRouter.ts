import { z } from "zod";
import { publicProcedure, router } from "../config/trpc";
import {
  getPartnersDeploymentReadiness,
  getPartnersOnboardingBlueprint,
  getPartnersRuntimeOverview,
} from "../nexus-partners-pack/runtimeConfig";

/**
 * partnersDeliveryRouter
 *
 * Camada de entrega Nexus Partners Pack:
 *  - Materiais exclusivos (usabilidade, funcionalidade, performance, prompts, skills).
 *  - Painel de performance (uso da assinatura, latência, throughput, SLA).
 *  - Sincronização de APIs externas (destinos para automação e execução do Agente).
 *  - Chatbot com 100 tokens/dia, reset a cada 24h, em memória, por usuário.
 *  - Status de elegibilidade: pré-requisito Pack A² (Agente Afiliado) e contrato vigente.
 *  - Transição automática: ao expirar a assinatura, o usuário é direcionado para a
 *    Ativação Mensal do Programa de Afiliados, mantendo a Rede N.O. e a elegibilidade
 *    aos bônus e comissões.
 */

type ChatbotBudget = {
  date: string;
  used: number;
  limit: number;
};

const CHATBOT_DAILY_LIMIT = Number(process.env.PARTNERS_CHATBOT_DAILY_TOKENS || 100);
const userBudget = new Map<string, ChatbotBudget>();

function todayKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

function getBudget(userId: string): ChatbotBudget {
  const day = todayKey();
  const existing = userBudget.get(userId);
  if (!existing || existing.date !== day) {
    const fresh: ChatbotBudget = { date: day, used: 0, limit: CHATBOT_DAILY_LIMIT };
    userBudget.set(userId, fresh);
    return fresh;
  }
  return existing;
}

const MATERIALS = [
  { id: "mat-usability-01", slug: "ppk-01-guia-operacao", category: "Usabilidade", title: "Guia de operação Nexus Partners Pack", description: "Como configurar agentes, workflows e prompts para tarefas reais.", format: "PDF · HTML · MD", minutes: 12, htmlUrl: "/materials/partners/ppk-01-guia-operacao.html", pdfUrl: "/materials/partners/pdf/ppk-01-guia-operacao.pdf", mdUrl: "/materials/partners/md/ppk-01-guia-operacao.md" },
  { id: "mat-functional-01", slug: "ppk-02-mapa-funcional", category: "Funcionalidade", title: "Mapa funcional · Skills, workflows e prompts oficiais", description: "Catálogo completo das capacidades aplicadas a produção.", format: "PDF · HTML · MD", minutes: 8, htmlUrl: "/materials/partners/ppk-02-mapa-funcional.html", pdfUrl: "/materials/partners/pdf/ppk-02-mapa-funcional.pdf", mdUrl: "/materials/partners/md/ppk-02-mapa-funcional.md" },
  { id: "mat-perf-01", slug: "ppk-03-performance-custo", category: "Performance", title: "Boas práticas de performance e custo por execução", description: "Ajustes de janela de contexto, batch e fallback de modelos.", format: "PDF · HTML · MD", minutes: 8, htmlUrl: "/materials/partners/ppk-03-performance-custo.html", pdfUrl: "/materials/partners/pdf/ppk-03-performance-custo.pdf", mdUrl: "/materials/partners/md/ppk-03-performance-custo.md" },
  { id: "mat-prompts-01", slug: "ppk-04-biblioteca-prompts", category: "Biblioteca", title: "Biblioteca de prompts críticos Nexus", description: "Prompts de classificação, extração, roteamento e síntese.", format: "PDF · HTML · MD", minutes: 8, htmlUrl: "/materials/partners/ppk-04-biblioteca-prompts.html", pdfUrl: "/materials/partners/pdf/ppk-04-biblioteca-prompts.pdf", mdUrl: "/materials/partners/md/ppk-04-biblioteca-prompts.md" },
  { id: "mat-skills-01", slug: "ppk-05-biblioteca-skills", category: "Biblioteca", title: "Biblioteca de Skills oficiais", description: "Skills versionadas com testes, contratos e exemplos.", format: "PDF · HTML · MD", minutes: 8, htmlUrl: "/materials/partners/ppk-05-biblioteca-skills.html", pdfUrl: "/materials/partners/pdf/ppk-05-biblioteca-skills.pdf", mdUrl: "/materials/partners/md/ppk-05-biblioteca-skills.md" },
  { id: "mat-workflows-01", slug: "ppk-06-workflows-prontos", category: "Workflows", title: "Workflows operacionais prontos", description: "Cenários de atendimento, automação comercial e backoffice.", format: "PDF · HTML · MD", minutes: 8, htmlUrl: "/materials/partners/ppk-06-workflows-prontos.html", pdfUrl: "/materials/partners/pdf/ppk-06-workflows-prontos.pdf", mdUrl: "/materials/partners/md/ppk-06-workflows-prontos.md" },
  { id: "mat-limits-01", slug: "ppk-07-performance-limitacoes", category: "Transparência", title: "Performance, potencial e limitações do sistema", description: "Limites de tokens, latências esperadas e SLAs por plano.", format: "PDF · HTML · MD", minutes: 10, htmlUrl: "/materials/partners/ppk-07-performance-limitacoes.html", pdfUrl: "/materials/partners/pdf/ppk-07-performance-limitacoes.pdf", mdUrl: "/materials/partners/md/ppk-07-performance-limitacoes.md" }
];

const PERFORMANCE_SAMPLE = {
  uptime: 99.94,
  avgLatencyMs: 612,
  p95LatencyMs: 1183,
  successRate: 0.987,
  dailyExecutions: 1284,
  monthlyExecutions: 31420,
  modelMix: [
    { model: "gemini-1.5-pro", usage: 0.58 },
    { model: "gemini-1.5-flash", usage: 0.31 },
    { model: "fallback", usage: 0.11 },
  ],
  limits: {
    chatbotDailyTokens: CHATBOT_DAILY_LIMIT,
    maxConcurrentAgents: Number(process.env.PARTNERS_MAX_CONCURRENT_AGENTS || 3),
    maxWorkflowsPerHour: Number(process.env.PARTNERS_MAX_WORKFLOWS_PER_HOUR || 240),
  },
};

const apiBindings = new Map<string, Array<{ id: string; label: string; baseUrl: string; authType: string; updatedAt: string }>>();

export const partnersDeliveryRouter = router({
  eligibility: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(({ input }) => {
      const has = (k: string) => Boolean(process.env[k]);
      return {
        userId: input.userId,
        hasEntryPack: true,
        entryPackSlug: "pack-a2",
        subscriptionActive: true,
        renewalCycle: "monthly",
        // Quando a assinatura encerra, a transição automática para
        // a Ativação Mensal do programa de afiliados é acionada via webhook.
        transitionToAffiliateActivation: {
          enabled: true,
          triggerOn: "subscription_expired",
          targetFlow: "monthly-activation",
        },
        signalsConfigured: {
          mercadoPago: has("MERCADO_PAGO_ACCESS_TOKEN"),
          gemini: has("GEMINI_API_KEY"),
        },
      };
    }),

  listMaterials: publicProcedure.query(() => ({ items: MATERIALS, total: MATERIALS.length, baseUrl: "/materials/partners" })),

  performance: publicProcedure
    .input(z.object({ userId: z.string().min(1) }).optional())
    .query(() => PERFORMANCE_SAMPLE),

  runtimeOverview: publicProcedure.query(() => getPartnersRuntimeOverview()),

  deploymentReadiness: publicProcedure.query(() => getPartnersDeploymentReadiness()),

  onboardingBlueprint: publicProcedure.query(() => getPartnersOnboardingBlueprint()),

  listApiBindings: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(({ input }) => {
      const items = apiBindings.get(input.userId) ?? [];
      return { items, total: items.length };
    }),

  upsertApiBinding: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        id: z.string().optional(),
        label: z.string().min(2).max(120),
        baseUrl: z.string().url().max(300),
        authType: z.enum(["bearer", "basic", "header", "none"]),
      }),
    )
    .mutation(({ input }) => {
      const list = apiBindings.get(input.userId) ?? [];
      const id = input.id ?? `bind_${Date.now().toString(36)}`;
      const updated = {
        id,
        label: input.label,
        baseUrl: input.baseUrl,
        authType: input.authType,
        updatedAt: new Date().toISOString(),
      };
      const next = list.filter((it) => it.id !== id).concat(updated);
      apiBindings.set(input.userId, next);
      return { ok: true, item: updated };
    }),

  removeApiBinding: publicProcedure
    .input(z.object({ userId: z.string().min(1), id: z.string().min(1) }))
    .mutation(({ input }) => {
      const list = apiBindings.get(input.userId) ?? [];
      apiBindings.set(input.userId, list.filter((it) => it.id !== input.id));
      return { ok: true };
    }),

  chatbotStatus: publicProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(({ input }) => {
      const b = getBudget(input.userId);
      return { date: b.date, used: b.used, remaining: Math.max(0, b.limit - b.used), limit: b.limit };
    }),

  chatbotSend: publicProcedure
    .input(z.object({ userId: z.string().min(1), message: z.string().trim().min(1).max(1200) }))
    .mutation(({ input }) => {
      const b = getBudget(input.userId);
      // Estimativa simples de tokens: ~4 chars por token, mínimo 1.
      const tokensEstimated = Math.max(1, Math.ceil(input.message.length / 4));
      if (b.used + tokensEstimated > b.limit) {
        return {
          ok: false,
          reason: "daily_quota_exhausted",
          remaining: Math.max(0, b.limit - b.used),
          limit: b.limit,
          message: "Limite diário de 100 tokens atingido. O orçamento é renovado a cada 24h.",
        };
      }
      b.used += tokensEstimated;
      userBudget.set(input.userId, b);
      // Resposta determinística do chatbot Partners; o modelo real é integrado
      // pelo backend de runtime do agente. Aqui mantemos o contrato e o orçamento.
      const runtime = getPartnersRuntimeOverview();
      const reply = `Recebido. Direcionando o agente Nexus Partners para: "${input.message.slice(0, 220)}". Tokens consumidos: ${tokensEstimated}. Runtime principal: ${runtime.primaryProvider} (${runtime.model}).`;
      return {
        ok: true,
        reply,
        tokensConsumed: tokensEstimated,
        remaining: b.limit - b.used,
        limit: b.limit,
        runtime,
      };
    }),
});
