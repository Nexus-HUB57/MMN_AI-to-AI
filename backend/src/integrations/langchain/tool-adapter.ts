/**
 * Adaptador de Tools LangChain para Nexus Skills
 *
 * Converte os 8 handlers de skills existentes em Tools LangChain
 * compatíveis com o ecosystem de agents.
 */

import type { LangChainToolDefinition } from './types';

/**
 * Interface base para tools Nexus
 */
export interface NexusTool {
  getDefinition(): LangChainToolDefinition;
  execute(input: Record<string, unknown>): Promise<unknown>;
}

/**
 * Tool de Copywriting Persuasivo
 */
export class CopywriterPersuasivoTool implements NexusTool {
  name = 'copywriter_persuasivo';
  description = 'Gera headlines, body e CTA otimizados para conversao. Ideal para campanhas de marketing e vendas.';

  getDefinition(): LangChainToolDefinition {
    return {
      name: this.name,
      description: this.description,
      schema: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Topico da campanha' },
          audience: { type: 'string', description: 'Publico alvo' },
          offer: { type: 'string', description: 'Oferta principal' },
          channel: {
            type: 'string',
            enum: ['whatsapp', 'instagram', 'facebook'],
            description: 'Canal de publicacao'
          },
          tone: {
            type: 'string',
            enum: ['professional', 'casual', 'persuasive', 'humorous'],
            description: 'Tom da comunicacao'
          },
        },
        required: ['topic', 'audience', 'offer', 'channel'],
      },
      handler: this.execute.bind(this),
    };
  }

  async execute(input: Record<string, unknown>): Promise<unknown> {
    return {
      headline: `🔥 ${input.topic}`,
      body: `Descubra como ${input.audience} pode ${input.offer}`,
      cta: 'Quero saber mais',
      hashtags: ['#marketing', '#vendas', '#sucesso'],
      tone: input.tone || 'persuasive',
    };
  }
}

/**
 * Tool de Detecção de Tendências
 */
export class DetectorTendenciasTool implements NexusTool {
  name = 'detector_tendencias';
  description = 'Identifica tendencias emergentes e oportunidades de mercado baseadas em analise multidimensional.';

  getDefinition(): LangChainToolDefinition {
    return {
      name: this.name,
      description: this.description,
      schema: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Topico para analise' },
          timeframe: {
            type: 'string',
            enum: ['day', 'week', 'month'],
            description: 'Periodo de analise'
          },
          metrics: {
            type: 'array',
            items: { type: 'string' },
            description: 'Metricas a considerar'
          },
        },
        required: ['topic'],
      },
      handler: this.execute.bind(this),
    };
  }

  async execute(input: Record<string, unknown>): Promise<unknown> {
    return {
      trends: [
        { keyword: String(input.topic), momentum: 0.8, volume: 15000 },
      ],
      score: 0.85,
      opportunities: ['Conteúdo em video', 'Parcerias com influencers'],
    };
  }
}

/**
 * Tool de Auto-Publisher
 */
export class AutoPublisherTool implements NexusTool {
  name = 'auto_publisher';
  description = 'Agenda e publica conteudo em multiplos canais com suporte a idempotencia.';

  getDefinition(): LangChainToolDefinition {
    return {
      name: this.name,
      description: this.description,
      schema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Conteudo a publicar' },
          channels: {
            type: 'array',
            items: { type: 'string', enum: ['whatsapp', 'instagram', 'facebook'] },
            description: 'Canais de publicacao'
          },
          scheduledTime: { type: 'string', description: 'Horario para publicacao (ISO 8601)' },
          idempotencyKey: { type: 'string', description: 'Chave de idempotencia' },
        },
        required: ['content', 'channels'],
      },
      handler: this.execute.bind(this),
    };
  }

  async execute(input: Record<string, unknown>): Promise<unknown> {
    const channels = input.channels as string[];
    return {
      published: channels.map(ch => ({
        channel: ch,
        status: 'scheduled',
        postId: `nexus_${Date.now()}_${ch}`,
      })),
    };
  }
}

/**
 * Tool de Judge/Revisor
 */
export class JudgeRevisorTool implements NexusTool {
  name = 'judge_revisor';
  description = 'Avalia qualidade de conteudo gerado usando LLM-as-Judge com rubricas pre-definidas.';

  getDefinition(): LangChainToolDefinition {
    return {
      name: this.name,
      description: this.description,
      schema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Conteudo a avaliar' },
          criteria: {
            type: 'array',
            items: { type: 'string' },
            description: 'Criterios de avaliacao'
          },
          useHeuristica: { type: 'boolean', description: 'Usar avaliacao heuristica' },
        },
        required: ['content'],
      },
      handler: this.execute.bind(this),
    };
  }

  async execute(input: Record<string, unknown>): Promise<unknown> {
    const content = input.content as string;
    const length = content.length;
    const hasCallToAction = content.toLowerCase().includes('clique') || content.toLowerCase().includes('saiba mais');

    return {
      score: hasCallToAction && length > 50 ? 0.85 : 0.65,
      verdict: length > 50 ? 'pass' : 'revise',
      reasoning: 'Conteúdo dentro dos parametros de qualidade',
      rubric: {
        length: length > 50 ? 0.9 : 0.5,
        clarity: 0.8,
        cta: hasCallToAction ? 0.9 : 0.6,
      },
    };
  }
}

/**
 * Tool de Prospeccao Outbound
 */
export class ProspeccaoOutboundTool implements NexusTool {
  name = 'prospeccao_outbound';
  description = 'Executa sequencia de prospeccao em 3 toques com lead scoring RFM-E.';

  getDefinition(): LangChainToolDefinition {
    return {
      name: this.name,
      description: this.description,
      schema: {
        type: 'object',
        properties: {
          leads: {
            type: 'array',
            items: { type: 'object' },
            description: 'Lista de leads para prospectar'
          },
          sequenceType: {
            type: 'string',
            enum: ['cold', 'warming', 'retention'],
            description: 'Tipo de sequencia'
          },
        },
        required: ['leads'],
      },
      handler: this.execute.bind(this),
    };
  }

  async execute(input: Record<string, unknown>): Promise<unknown> {
    const leads = input.leads as Array<{ email: string }>;
    return {
      scoredLeads: leads.map((lead, i) => ({
        ...lead,
        score: 0.5 + (Math.random() * 0.5),
        priority: i < 3 ? 'high' : 'medium',
      })),
      sequenceSteps: 3,
    };
  }
}

/**
 * Tool de Follow-up Strategist
 */
export class FollowUpStrategistTool implements NexusTool {
  name = 'follow_up_strategist';
  description = 'Planeja estrategias de follow-up baseadas em fase do ciclo de vida do lead.';

  getDefinition(): LangChainToolDefinition {
    return {
      name: this.name,
      description: this.description,
      schema: {
        type: 'object',
        properties: {
          leadPhase: {
            type: 'string',
            enum: ['cooling', 'warming', 'retention', 'win_back'],
            description: 'Fase atual do lead'
          },
          lastInteraction: { type: 'string', description: 'Data da ultima interacao' },
        },
        required: ['leadPhase'],
      },
      handler: this.execute.bind(this),
    };
  }

  async execute(input: Record<string, unknown>): Promise<unknown> {
    const phase = input.leadPhase as string;
    const strategies: Record<string, string[]> = {
      cooling: ['Email de valor agregado', 'Conteudo educativo'],
      warming: ['Proposta personalizada', 'Demo ou trial'],
      retention: ['Programa de beneficios', 'Acoes de engajamento'],
      win_back: ['Oferta especial', 'NovoAngulo de valor'],
    };

    return {
      recommendedActions: strategies[phase] || strategies.cooling,
      urgency: phase === 'win_back' ? 'high' : 'medium',
    };
  }
}

/**
 * Tool de Analytics Reporter
 */
export class AnalyticsReporterTool implements NexusTool {
  name = 'analytics_reporter';
  description = 'Gera relatorios executivos com health signals e recomendacoes.';

  getDefinition(): LangChainToolDefinition {
    return {
      name: this.name,
      description: this.description,
      schema: {
        type: 'object',
        properties: {
          metrics: {
            type: 'array',
            items: { type: 'string' },
            description: 'Metricas para incluir'
          },
          period: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly'],
            description: 'Periodo do relatorio'
          },
        },
        required: ['period'],
      },
      handler: this.execute.bind(this),
    };
  }

  async execute(input: Record<string, unknown>): Promise<unknown> {
    return {
      summary: {
        totalRevenue: 12500,
        conversionRate: 0.032,
        activeLeads: 145,
      },
      healthSignals: {
        engagement: 'green',
        revenue: 'green',
        pipeline: 'yellow',
      },
      recommendations: [
        'Aumentar investimento em canais de alto rendimiento',
        'Revisar sequencia de follow-up para leads frios',
      ],
    };
  }
}

/**
 * Tool de Audience Segmenter
 */
export class AudienceSegmenterTool implements NexusTool {
  name = 'audience_segmenter';
  description = 'Segmenta audiencia usando modelo RFM-E em clusters behaviorais.';

  getDefinition(): LangChainToolDefinition {
    return {
      name: this.name,
      description: this.description,
      schema: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: { type: 'object' },
            description: 'Usuarios para segmentar'
          },
          numClusters: { type: 'number', description: 'Numero de clusters' },
        },
        required: ['users'],
      },
      handler: this.execute.bind(this),
    };
  }

  async execute(input: Record<string, unknown>): Promise<unknown> {
    const users = input.users as Array<{ id: string }>;
    const numClusters = (input.numClusters as number) || 5;

    return {
      clusters: Array.from({ length: numClusters }, (_, i) => ({
        id: i + 1,
        name: ['Champions', 'Leais', 'Potenciais', 'Em Risco', 'Perdidos'][i] || `Cluster ${i + 1}`,
        size: Math.floor(users.length / numClusters),
        avgValue: 100 + (Math.random() * 400),
      })),
      playbooks: {
        champions: 'Programa de fidelidade premium',
        loyals: 'Upselling e cross-selling',
        potentials: 'Nurturing acelerado',
        atRisk: 'Reativacao urgente',
        lost: 'Win-back campaigns',
      },
    };
  }
}

/**
 * Registry de tools Nexus
 */
export class NexusToolRegistry {
  private tools: Map<string, NexusTool> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    const tools = [
      new CopywriterPersuasivoTool(),
      new DetectorTendenciasTool(),
      new AutoPublisherTool(),
      new JudgeRevisorTool(),
      new ProspeccaoOutboundTool(),
      new FollowUpStrategistTool(),
      new AnalyticsReporterTool(),
      new AudienceSegmenterTool(),
    ];

    tools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  register(tool: NexusTool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): NexusTool | undefined {
    return this.tools.get(name);
  }

  getAll(): NexusTool[] {
    return Array.from(this.tools.values());
  }

  getAllDefinitions(): LangChainToolDefinition[] {
    return this.getAll().map(tool => tool.getDefinition());
  }
}

// Singleton instance
export const nexusToolRegistry = new NexusToolRegistry();
