/**
 * Webinar Engine - Skill para planejamento e execução de webinars de vendas
 *
 * Categoria: sales
 * Status: operational
 * Versão: 1.0.0
 *
 * Funcionalidades:
 * - Planejamento estruturado de webinars
 * - Geração de slides outline
 * - Sequência de follow-up pós-webinar
 * - Scripts de apresentação
 * - Análise de métricas de sucesso
 */

import { z } from "zod";
import { nanoid } from "nanoid";
import type { SkillHandler, SkillExecutionContext, SkillExecutionResult } from "./types";

// ============================================
// INPUT VALIDATION
// ============================================

const GoalType = z.enum([
  "lead_capture",
  "product_demo",
  "launch",
  "education",
  "training",
  "community",
]);

const ToneType = z.enum(["professional", "casual", "energetic", "educational"]);

export const webinarEngineInputSchema = z.object({
  topic: z.string().min(5, "Tópico deve ter pelo menos 5 caracteres"),
  targetAudience: z.string().min(3, "Público-alvo é obrigatório"),
  duration: z.number().min(15).max(180).default(60), // minutos
  goal: GoalType.default("lead_capture"),
  presenterName: z.string().min(2, "Nome do apresentador é obrigatório"),
  presenterTitle: z.string().optional(),
  keyMessage: z.string().optional(),
  productName: z.string().optional(),
  includeQASession: z.boolean().default(true),
  tone: ToneType.default("professional"),
});

export type WebinarEngineInput = z.infer<typeof webinarEngineInputSchema>;

// ============================================
// OUTPUT TYPES
// ============================================

export interface WebinarStructure {
  preWebinar: string[];
  opening: {
    duration: number;
    steps: string[];
  };
  agenda: {
    duration: number;
    items: Array<{ title: string; time: number; keyPoints: string[] }>;
  };
  coreContent: Array<{
    section: number;
    title: string;
    duration: number;
    bulletPoints: string[];
    visualSuggestion: string;
    transition: string;
  }>;
  qaScript: {
    duration: number;
    anticipatedQuestions: Array<{
      question: string;
      answer: string;
      difficulty: "easy" | "medium" | "hard";
    }>;
  };
  closing: {
    duration: number;
    steps: string[];
    ctaSequence: string[];
  };
}

export interface WebinarEngineOutput {
  webinarId: string;
  structure: WebinarStructure;
  slidesOutline: Array<{
    slide: number;
    title: string;
    bulletPoints: string[];
    visualSuggestion: string;
    speakerNotes: string;
  }>;
  followUpSequence: Array<{
    day: number;
    channel: "email" | "whatsapp" | "sms";
    subject: string;
    message: string;
    objective: string;
  }>;
  metrics: {
    estimatedAttendees: string;
    expectedConversion: string;
    avgWatchTime: string;
    successFactors: string[];
  };
}

// ============================================
// CONTENT GENERATORS
// ============================================

function generatePreWebinarSteps(topic: string, presenterName: string): string[] {
  return [
    "Enviar email de confirmação 24h antes com link e instruções técnicas",
    "Enviar reminder 1h antes com checklist de preparação",
    "Preparar ambiente: luz, som, fundo limpo",
    "Testar microfone e câmera",
    "Fechar abas desnecessárias no navegador",
    "Ter água por perto",
    "Revisar principais pontos do conteúdo",
    "Abrir link do webinar 15min antes",
  ];
}

function generateOpening(presenterName: string, topic: string, tone: string): {
  duration: number;
  steps: string[];
} {
  const toneSteps: Record<string, string[]> = {
    professional: [
      `🎤 Bem-vindos! ${presenterName} aqui, vamos começar.`,
      "Verificar áudio dos participantes",
      "Fazer简介 rápida (30 segundos)",
      `Apresentar o tema: "${topic}"`,
      "Estabelecer expectativa de duração",
      "Explicar como funcionará a sessão (Q&A no final)",
      "Criar urgência: 'Gravarei esta sessão, mas vagas ao vivo são limitadas'",
    ],
    casual: [
      `🔥 E aí, pessoal! ${presenterName} aqui, preparado pra essa conversa?`,
      "Greeting animado",
      "Breack-the-ice: 'Me conta nos comentários de onde vocês estão!'",
      `Topic intro com entusiasmo`,
      "Duration overview",
      "Interactive question: 'Pra quem é essa sessão? Deixe nos comentários!'",
    ],
    energetic: [
      "🚀 Vamos lá, pessoal! Está transmissão vai ser D+!",
      "High energy opening",
      "Presenter credentials highlight",
      `Topic reveal com impacto: "${topic}"`,
      "Promise of high value",
      "Urgency creation",
      "Community building",
    ],
    educational: [
      "📚 Bom dia/tarde a todos! Vamos começar nossa sessão educacional.",
      "Formal greeting",
      "Presenter background",
      "Learning objectives overview",
      "Structure explanation",
      "Engagement expectations",
    ],
  };

  return {
    duration: 5,
    steps: toneSteps[tone] || toneSteps.professional,
  };
}

function generateAgenda(
  topic: string,
  duration: number,
  goal: string
): { duration: number; items: Array<{ title: string; time: number; keyPoints: string[] }> } {
  const totalMinutes = duration - 15; // reserve 15min for Q&A/closing
  const agendaItems: Array<{ title: string; time: number; keyPoints: string[] }> = [];

  if (goal === "lead_capture") {
    agendaItems.push(
      { title: "Aquecimento e conexão", time: 5, keyPoints: ["Conexão emocional", "Identificação de dor"] },
      { title: "O problema que você enfrenta", time: 10, keyPoints: ["Estatísticas de mercado", "Relatos de similares"] },
      { title: "A solução existente", time: 15, keyPoints: ["Abordagens tradicionais", "Limitações e frustrações"] },
      { title: "Sua metodologia", time: 20, keyPoints: ["Passo a passo", "Cases de sucesso"] },
      { title: "Transformação possível", time: 10, keyPoints: ["Resultados mensuráveis", "Depoimentos"] }
    );
  } else if (goal === "product_demo") {
    agendaItems.push(
      { title: "Introdução e contexto", time: 5, keyPoints: ["Problema do mercado", "Sua solução"] },
      { title: "Visão geral do produto", time: 10, keyPoints: ["Arquitetura", "Diferenciais"] },
      { title: "Demo ao vivo", time: 25, keyPoints: ["Feature principal", "Feature secundária", "Integrações"] },
      { title: "FAQ rápido", time: 5, keyPoints: ["Dúvidas comuns"] },
      { title: "Próximos passos", time: 5, keyPoints: ["Como começar", "Oferta especial"] }
    );
  } else if (goal === "launch") {
    agendaItems.push(
      { title: "Build-up e expectativa", time: 10, keyPoints: ["Preview do que vem", "Escassez"] },
      { title: "Apresentação do produto", time: 20, keyPoints: ["O que é", "Como funciona", "Por que importa"] },
      { title: "Oferta de lançamento", time: 10, keyPoints: ["Preço especial", "Bônus", "Garantia"] },
      { title: "Depoimentos e provas", time: 10, keyPoints: ["Beta testers", "Resultados"] },
      { title: "CTAs finais", time: 5, keyPoints: ["Urgência", "Link de compra"] }
    );
  } else {
    // Default para education
    agendaItems.push(
      { title: "Contextualização", time: 10, keyPoints: ["Por que este tema importa"] },
      { title: "Conceitos fundamentais", time: 15, keyPoints: ["Teoria", "Exemplos"] },
      { title: "Aplicação prática", time: 15, keyPoints: ["Como aplicar", "Exercícios"] },
      { title: "Recursos adicionais", time: 5, keyPoints: ["Materiais", "Próximos passos"] }
    );
  }

  return {
    duration: totalMinutes,
    items: agendaItems,
  };
}

function generateCoreContent(
  topic: string,
  goal: string,
  duration: number
): Array<{
  section: number;
  title: string;
  duration: number;
  bulletPoints: string[];
  visualSuggestion: string;
  transition: string;
}> {
  const sections: Array<{
    section: number;
    title: string;
    duration: number;
    bulletPoints: string[];
    visualSuggestion: string;
    transition: string;
  }> = [];

  if (goal === "lead_capture") {
    sections.push(
      {
        section: 1,
        title: "O Problema",
        duration: 10,
        bulletPoints: [
          "92% das empresas enfrentam este desafio",
          "Custo de oportunidade: R$XXk/mês",
          "Sinais de que você está neste cenário",
        ],
        visualSuggestion: "Gráfico de estatísticas + foto de frustração",
        transition: "E você, já passou por isso?",
      },
      {
        section: 2,
        title: "Por Que Soluções Tradicionais Falham",
        duration: 8,
        bulletPoints: [
          "Abordagem genérica",
          "Falta de personalização",
          "Resultados inconsistentes",
        ],
        visualSuggestion: "Comparativo antes/depois",
        transition: "Existe uma forma melhor...",
      },
      {
        section: 3,
        title: "A Solução",
        duration: 12,
        bulletPoints: [
          "Metodologia testada e comprovada",
          "Case de sucesso #1",
          "Case de sucesso #2",
          "Resultado médio dos clientes",
        ],
        visualSuggestion: "Logo + screenshot de resultados",
        transition: "Quer ver como funciona na prática?",
      }
    );
  } else if (goal === "launch") {
    sections.push(
      {
        section: 1,
        title: "Apresentação do Producto",
        duration: 15,
        bulletPoints: [
          "O que é (em uma frase)",
          "Para quem é",
          "Problema que resolve",
        ],
        visualSuggestion: "Hero image do produto",
        transition: "Vamos ver como funciona...",
      },
      {
        section: 2,
        title: "Features Principais",
        duration: 10,
        bulletPoints: [
          "Feature 1 + demo",
          "Feature 2 + demo",
          "Feature 3 + demo",
        ],
        visualSuggestion: "Screenshots interativos",
        transition: "E tem mais...",
      },
      {
        section: 3,
        title: "Oferta Especial de Lançamento",
        duration: 8,
        bulletPoints: [
          "Preço normal vs. preço lançamento",
          "Bônus exclusivos",
          "Garantia de 30 dias",
        ],
        visualSuggestion: "Card de preço com urgência",
        transition: "Quer garantir sua vaga?",
      }
    );
  }

  return sections;
}

function generateQAScript(goal: string): {
  duration: number;
  anticipatedQuestions: Array<{ question: string; answer: string; difficulty: "easy" | "medium" | "hard" }>;
} {
  const questions: Record<string, Array<{ question: string; answer: string; difficulty: "easy" | "medium" | "hard" }>> = {
    lead_capture: [
      {
        question: "Quanto tempo preciso para implementar?",
        answer: "Depende do seu ponto de partida, mas nossos clientes veem resultados em 4-8 semanas.",
        difficulty: "easy",
      },
      {
        question: "Funciona para meu nicho específico?",
        answer: "Já trabalhamos com +50 nichos diferentes. Posso personalizar a abordagem para você.",
        difficulty: "medium",
      },
      {
        question: "Qual o investimento mínimo?",
        answer: "Temos opções a partir de R$XX/mês, com tudo que você precisa para começar.",
        difficulty: "easy",
      },
    ],
    product_demo: [
      {
        question: "Preciso ter algum conhecimento técnico?",
        answer: "Não! A plataforma foi projetada para ser intuitiva. Você consegue usar sem suporte.",
        difficulty: "easy",
      },
      {
        question: "Posso testar antes de comprar?",
        answer: "Sim! Oferecemos 14 dias grátis para você experimentar.",
        difficulty: "easy",
      },
      {
        question: "Como funciona a integração com outras ferramentas?",
        answer: "Temos +50 integrações nativas. Vou mostrar na prática.",
        difficulty: "medium",
      },
    ],
    launch: [
      {
        question: "O preço vai aumentar depois do lançamento?",
        answer: "Sim, após o período de lançamento o preço sobe. Esta é sua melhor oportunidade.",
        difficulty: "easy",
      },
      {
        question: "E se eu não gostar?",
        answer: "Garantia incondicional de 30 dias. Se não ficar satisfeito, devolvemos seu dinheiro.",
        difficulty: "easy",
      },
      {
        question: "Posso parcelar?",
        answer: "Sim, parcelamos em até 12x sem juros.",
        difficulty: "medium",
      },
    ],
    default: [
      {
        question: "Posso tirar dúvidas depois?",
        answer: "Sim! Teremos grupo VIP no Telegram para suporte pós-webinar.",
        difficulty: "easy",
      },
    ],
  };

  return {
    duration: 10,
    anticipatedQuestions: questions[goal] || questions.default,
  };
}

function generateClosing(
  presenterName: string,
  goal: string
): { duration: number; steps: string[]; ctaSequence: string[] } {
  const baseSteps = [
    "Resumir os 3 principais aprendizados",
    "Agradecer participação",
    "Apresentar próximos passos",
  ];

  const ctaMap: Record<string, string[]> = {
    lead_capture: [
      "Baixar material complementar (lead magnet)",
      "Agendar call estratégica",
      "Entrar no grupo VIP",
    ],
    product_demo: [
      "Testar grátis por 14 dias",
      "Escolher plano ideal",
      "Garantir desconto de lançamento",
    ],
    launch: [
      "Comprar agora (preço especial)",
      "Garantir bônus exclusivos",
      "Confirmar no link",
    ],
    default: [
      "Baixar apresentação",
      "Entrar no grupo",
      "Implementar aprendizado",
    ],
  };

  return {
    duration: 5,
    steps: baseSteps,
    ctaSequence: ctaMap[goal] || ctaMap.default,
  };
}

function generateSlidesOutline(
  topic: string,
  structure: WebinarStructure
): Array<{
  slide: number;
  title: string;
  bulletPoints: string[];
  visualSuggestion: string;
  speakerNotes: string;
}> {
  const slides: Array<{
    slide: number;
    title: string;
    bulletPoints: string[];
    visualSuggestion: string;
    speakerNotes: string;
  }> = [];

  // Slide de abertura
  slides.push({
    slide: 1,
    title: `Webinar: ${topic}`,
    bulletPoints: ["Bem-vindos", "Apresentador", "Duração"],
    visualSuggestion: "Logo + imagem de capa",
    speakerNotes: "Cumprimente calorosamente, apresente-se",
  });

  // Slides da agenda
  slides.push({
    slide: 2,
    title: "O Que Vamos Ver Hoje",
    bulletPoints: structure.agenda.items.map((item) => `${item.title} (${item.time}min)`),
    visualSuggestion: "Timeline visual",
    speakerNotes: "Percorra rapidamente cada tópico",
  });

  // Slides do conteúdo
  structure.coreContent.forEach((section, idx) => {
    slides.push({
      slide: 3 + idx,
      title: section.title,
      bulletPoints: section.bulletPoints,
      visualSuggestion: section.visualSuggestion,
      speakerNotes: `Dedique ${section.duration}min nesta seção. Use transições.`,
    });
  });

  // Slide de Q&A
  slides.push({
    slide: slides.length + 1,
    title: "Perguntas e Respostas",
    bulletPoints: ["Faça suas perguntas no chat", "Selecionaremos as melhores"],
    visualSuggestion: "Ícone de interrogação",
    speakerNotes: "Espere 10min para perguntas, priorize as mais relevantes",
  });

  // Slides de encerramento
  slides.push({
    slide: slides.length + 1,
    title: "Próximos Passos",
    bulletPoints: structure.closing.ctaSequence,
    visualSuggestion: "CTAs com botões",
    speakerNotes: "Guie para ação imediata",
  });

  // Slide final
  slides.push({
    slide: slides.length + 1,
    title: "Obrigado!",
    bulletPoints: ["A recording será enviada", "Grupo VIP no Telegram", "Até a próxima!"],
    visualSuggestion: "Contato e redes sociais",
    speakerNotes: "Despedida calorosa, aguarde perguntas finais",
  });

  return slides;
}

function generateFollowUpSequence(
  topic: string,
  presenterName: string,
  goal: string
): Array<{
  day: number;
  channel: "email" | "whatsapp" | "sms";
  subject: string;
  message: string;
  objective: string;
}> {
  const sequence: Array<{
    day: number;
    channel: "email" | "whatsapp" | "sms";
    subject: string;
    message: string;
    objective: string;
  }> = [];

  // Dia 0 - Imediato pós-webinar
  sequence.push({
    day: 0,
    channel: "email",
    subject: `Recording: ${topic} - ${presenterName}`,
    message: `Olá!\n\nAqui está a recording completa do webinar de hoje.\n\n[LINK DA RECORDING]\n\nNos vemos no próximo evento!\n\nAbraços,\n${presenterName}`,
    objective: "Entregar valor + recording",
  });

  // Dia 1 - Material complementar
  sequence.push({
    day: 1,
    channel: "email",
    subject: "Material complementar do webinar",
    message: `Olá!\n\nAlém da recording, preparei este material exclusivo:\n\n- Checklist de implementação\n- Templates mencionados\n- Slides em PDF\n\n[LINK DO MATERIAL]\n\nDúvidas? Me chama!\n\n${presenterName}`,
    objective: "Aumentar valor percebido",
  });

  // Dia 3 - Follow-up com pergunta
  sequence.push({
    day: 3,
    channel: "email",
    subject: "Uma pergunta rápida...",
    message: `Oi!\n\nVocê teve chance de assistir a recording?\n\nUma dúvida: qual foi o maior aprendizado do webinar para você?\n\nMe conta aqui, adoraria saber!\n\n${presenterName}`,
    objective: "Engajamento + feedback",
  });

  // Dia 5 - Urgência (se aplicável)
  if (goal === "launch") {
    sequence.push({
      day: 5,
      channel: "email",
      subject: "⚡ Última chance: Preço especial encerrando",
      message: `Olá!\n\nLembrete: a oferta especial de lançamento encerra em 48h.\n\n[LINK DA OFERTA]\n\nGarantir condições especiais:\n- Preço diferenciado\n- Bônus exclusivos\n- Garantia de 30 dias\n\nNão deixe passar!\n\n${presenterName}`,
      objective: "Conversão por urgência",
    });
  }

  // Dia 7 - Caso de sucesso / Social proof
  sequence.push({
    day: 7,
    channel: "email",
    subject: "O que nossos clientes estão dizendo...",
    message: `Olá!\n\nCompartilho alguns depoimentos de quem participou do webinar:\n\n"[Depoimento 1]"\n\n"[Depoimento 2]"\n\nQuer fazer parte desse grupo?\n\n[LINK DE INSCRIÇÃO]\n\n${presenterName}`,
    objective: "Social proof + conversão",
  });

  // Dia 14 - Último contato
  sequence.push({
    day: 14,
    channel: "email",
    subject: "Antes de eu ir...",
    message: `Olá!\n\nEsta será minha última mensagem sobre o webinar.\n\nSe ficou alguma dúvida ou quer conversar mais, estou à disposição.\n\nCaso já tenha tomado sua decisão, maravilha! Qualquer coisa, pode me chamar.\n\nUm abraço,\n${presenterName}`,
    objective: "Última chance + boa impressão",
  });

  return sequence;
}

// ============================================
// HANDLER
// ============================================

export const webinarEngineHandler: SkillHandler<WebinarEngineInput, WebinarEngineOutput> = {
  slug: "webinar-engine",
  title: "Motor de Webinars",
  category: "sales",
  version: "1.0.0",
  supportsAutonomous: true,

  parseInput: (raw: unknown) => {
    return webinarEngineInputSchema.parse(raw);
  },

  execute: async (
    input: WebinarEngineInput,
    context: SkillExecutionContext
  ): Promise<SkillExecutionResult<WebinarEngineOutput>> => {
    const startTime = Date.now();
    const webinarId = `webinar-${nanoid(10)}`;

    try {
      const { topic, targetAudience, duration, goal, presenterName, presenterTitle, tone } = input;

      // Gerar estrutura completa
      const preWebinar = generatePreWebinarSteps(topic, presenterName);
      const opening = generateOpening(presenterName, topic, tone);
      const agenda = generateAgenda(topic, duration, goal);
      const coreContent = generateCoreContent(topic, goal, duration);
      const qaScript = generateQAScript(goal);
      const closing = generateClosing(presenterName, goal);

      const structure: WebinarStructure = {
        preWebinar,
        opening,
        agenda,
        coreContent,
        qaScript,
        closing,
      };

      // Gerar outline de slides
      const slidesOutline = generateSlidesOutline(topic, structure);

      // Gerar sequência de follow-up
      const followUpSequence = generateFollowUpSequence(topic, presenterName, goal);

      // Calcular métricas
      const estimatedAttendees = duration > 60 ? "150-300" : "50-100";
      const expectedConversion = goal === "launch" ? "5-10%" : "2-5%";
      const avgWatchTime = duration > 60 ? "45-55 min" : "20-30 min";

      const output: WebinarEngineOutput = {
        webinarId,
        structure,
        slidesOutline,
        followUpSequence,
        metrics: {
          estimatedAttendees,
          expectedConversion,
          avgWatchTime,
          successFactors: [
            "Mínimo 100 inscrições",
            "Taxa de comparecimento > 40%",
            "Tempo médio de visualização > 50%",
            "Engajamento no chat > 10 mensagens",
            "CTAs com taxa de clique > 3%",
          ],
        },
      };

      return {
        executionId: webinarId,
        skill: "webinar-engine",
        success: true,
        decision: "auto",
        latencyMs: Date.now() - startTime,
        output,
        message: `Webinar planejado: "${topic}" - ${duration}min para ${targetAudience}. ${slidesOutline.length} slides gerados.`,
      };
    } catch (error) {
      return {
        executionId: webinarId,
        skill: "webinar-engine",
        success: false,
        decision: "needs_review",
        latencyMs: Date.now() - startTime,
        output: {} as WebinarEngineOutput,
        message: error instanceof Error ? `Erro: ${error.message}` : "Erro desconhecido",
      };
    }
  },
};

// ============================================
// EXPORTS
// ============================================

// Tipos e schema já são exportados nas declarações acima.
