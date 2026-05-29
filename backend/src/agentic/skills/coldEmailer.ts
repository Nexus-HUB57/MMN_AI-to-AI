import { z } from "zod";
import { nanoid } from "nanoid";
import type {
  SkillHandler,
  SkillExecutionContext,
  SkillExecutionResult,
} from "./types";

/**
 * Skill: Cold Emailer (E-mail Marketing Outbound)
 * -----------------------------------------------------------------------------
 * Gera sequências de cold emails personalizados com:
 *  - Recherche de prospect
 *  - Copywriting persuasivo
 *  - Sequenciamento (3-5 emails)
 *  - A/B testing headlines
 *  - follow-ups automáticos
 */
const slug = "cold-emailer" as const;

const InputSchema = z.object({
  /** Informações do prospect */
  prospect: z.object({
    name: z.string(),
    email: z.string().email(),
    company: z.string().optional(),
    title: z.string().optional(),
    industry: z.string().optional(),
    companySize: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).optional(),
    linkedinUrl: z.string().url().optional(),
    painPoints: z.array(z.string()).optional(),
    currentSolution: z.string().optional(),
  }),
  /** Produto/oferta a ser comunicada */
  offer: z.object({
    name: z.string(),
    shortDescription: z.string(),
    keyBenefits: z.array(z.string()),
    socialProof: z.string().optional(),
    pricing: z.string().optional(),
    cta: z.enum(["book_call", "download", "trial", "demo"]).default("book_call"),
  }),
  /** Vertical de mercado */
  vertical: z.enum([
    "saas",
    "ecommerce",
    "education",
    "health",
    "finance",
    "agency",
    "marketplace",
    "general",
  ]).default("general"),
  /** Tom da comunicação */
  tone: z.enum(["professional", "casual", "friendly", "aggressive"]).default("professional"),
  /** Número de emails na sequência */
  sequenceLength: z.number().min(3).max(7).default(5),
  /** Incluir LinkedIn touchpoints */
  includeLinkedIn: z.boolean().default(true),
  /** ID do kampanya (para tracking) */
  campaignId: z.string().optional(),
});

const OutputSchema = z.object({
  sequenceId: z.string(),
  createdAt: z.string(),
  campaignId: z.string().optional(),
  prospect: z.object({
    name: z.string(),
    email: z.string(),
    company: z.string().optional(),
  }),
  sequence: z.array(
    z.object({
      step: z.number(),
      delayDays: z.number(),
      channel: z.enum(["email", "linkedin"]),
      subject: z.string(),
      preview: z.string(),
      body: z.string(),
      hookType: z.enum([
        "question",
        "statistic",
        "story",
        "problem",
        "solution",
        "authority",
        "curiosity",
        "personalization",
      ]),
      cta: z.string(),
      expectedObjective: z.string(),
    })
  ),
  variants: z
    .array(
      z.object({
        step: z.number(),
        subjectVariants: z.array(z.string()),
        hookVariants: z.array(z.string()),
      })
    )
    .optional(),
  linkedInTouchpoints: z
    .array(
      z.object({
        step: z.number(),
        delayDays: z.number(),
        message: z.string(),
        actionType: z.enum(["connection", "message", "comment"]),
      })
    )
    .optional(),
  technicalSpecs: z.object({
    totalEmails: z.number(),
    totalDuration: z.string(),
    bestSendTime: z.string(),
    optimalDay: z.string(),
  }),
  spamScore: z.object({
    score: z.number(),
    risks: z.array(z.string()),
    suggestions: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
});

export type ColdEmailerInput = z.infer<typeof InputSchema>;
export type ColdEmailerOutput = z.infer<typeof OutputSchema>;

// Templates por vertical
const emailTemplates: Record<string, { hooks: string[]; valueProps: string[] }> = {
  saas: {
    hooks: [
      "Vi que vocês estão crescendo rapidamente no {industry}...",
      "Nossa solução ajudou empresas similares a {company} a reduzir {metric} em 30%...",
      "Percebi que vocês estão enfrentando desafios com {pain_point}...",
    ],
    valueProps: [
      "aumento de produtividade",
      "redução de churn",
      "escalabilidade",
      "automação de processos",
    ],
  },
  ecommerce: {
    hooks: [
      "Seu {ecommerce_type} está convertendo em {conversion_rate}?",
      "Ajudamos {company} a aumentar ticket medio em {percentage}%...",
      "Seus clientes estão abandonando carrinho em {cart_abandonment}%?",
    ],
    valueProps: [
      "aumento de conversões",
      "recovery de carrinho",
      "personalização",
      "análise de dados",
    ],
  },
  agency: {
    hooks: [
      "Como vocês estão gerenciando {specific_challenge}?",
      "Nossa metodologia ajudou agências a {outcome}...",
      "Vi que vocês trabalham com {client_types}...",
    ],
    valueProps: [
      "escalação de resultados",
      "otimização de funil",
      "relatórios automatizados",
    ],
  },
  general: {
    hooks: [
      "Vi seu perfil e fiquei impressionado com {specific_detail}...",
      "Nossa solução tem ajudado empresas como {benchmark_company}...",
      "Se você está enfrentando {common_challenge}...",
    ],
    valueProps: [
      "crescimento acelerando",
      "eficiência operacional",
      "ROI mensurável",
    ],
  },
};

const hookTypes = [
  "question",
  "statistic",
  "story",
  "problem",
  "solution",
  "authority",
  "curiosity",
  "personalization",
] as const;

function generateEmail(
  step: number,
  delayDays: number,
  prospect: InputSchema["prospect"],
  offer: InputSchema["offer"],
  vertical: string,
  tone: string,
  channel: "email" | "linkedin" = "email"
): OutputSchema["sequence"][0] {
  const templates = emailTemplates[vertical as keyof typeof emailTemplates] || emailTemplates.general;
  const hookTemplate = templates.hooks[step % templates.hooks.length];

  const hookType = hookTypes[step % hookTypes.length];
  const personalizedHook = hookTemplate
    .replace("{company}", prospect.company || "sua empresa")
    .replace("{industry}", prospect.industry || "setor")
    .replace("{pain_point}", prospect.painPoints?.[0] || "processos manuais");

  let subject = "";
  let body = "";
  let expectedObjective = "";
  const companyName = prospect.company || "sua empresa";
  const industry = prospect.industry || "tecnologia";

  switch (step) {
    case 1:
      // Email inicial - Introduce
      subject = `Ideia rápida sobre ${companyName}`;
      body = `Olá ${prospect.name},

${personalizedHook}

Trabalhamos com empresas que querem ${offer.keyBenefits[0] || "crescer de forma sustentável"}.

Você teria 15 minutos para uma conversa breve esta semana?

 abs`;
      expectedObjective = "Agendar call";
      break;
    case 2:
      // Follow-up 1 - Social Proof
      subject = `Re: Ideia rápida`;
      body = `Olá ${prospect.name},

Só queria confirmar se você teve a chance de ver minha mensagem anterior.

Recentemente, ajudamos uma empresa similar à ${companyName} a ${offer.keyBenefits[1] || "otimizar processos"}.${offer.socialProof ? `\n\n"${offer.socialProof}"` : ""}

Quer que eu compartilhe mais detalhes?

 abs`;
      expectedObjective = "Re-engajamento";
      break;
    case 3:
      // Email de valor - Case Study
      subject = `${prospect.name}, você já conhece essa abordagem?`;
      body = `Olá ${prospect.name},

Recentemente publiquei um case sobre como empresas de ${industry} conseguem ${offer.keyBenefits[2] || "resultados expressivos"}.

O resumo: empresas aumentaram em média 40% em 3 meses.

Posso enviar o material completo?

 abs`;
      expectedObjective = "Enviar conteúdo de valor";
      break;
    case 4:
      // Email de urgência/escassez
      subject = `Próximos passos - ${offer.name}`;
      body = `Olá ${prospect.name},

Não suelo enviar follow-ups assim, mas...

Temos algumas vagas abertas para nosso programa ${offer.name} este mês.

Se fizer sentido, adoraria conversar com você.

Se não for uma boa hora, me avise para eu não insistir.

 abs`;
      expectedObjective = "Criar urgência";
      break;
    default:
      // Email final - Break-up
      subject = `Último contato - promessa de não insistir`;
      body = `Olá ${prospect.name},

Entendo que ${companyName} deve estar ocupado.

Prometo não insistir depois desta mensagem.

Mas se você precisar de ajuda com ${offer.keyBenefits[0] || "crescimento"}, é só me chamar.

 abs`;
      expectedObjective = "Break-up email";
  }

  const ctaMap = {
    book_call: "Vamos agendar uma call?",
    download: "Quero receber o material",
    trial: "Quero testar",
    demo: "Quero ver uma demo",
  };

  return {
    step,
    delayDays,
    channel,
    subject,
    preview: body.slice(0, 80) + "...",
    body,
    hookType: hookType as OutputSchema["sequence"][0]["hookType"],
    cta: ctaMap[offer.cta] || "Vamos conversar?",
    expectedObjective,
  };
}

function generateLinkedInTouchpoint(
  step: number,
  delayDays: number,
  prospect: InputSchema["prospect"]
): OutputSchema["linkedInTouchpoints"][0] {
  const delay = Math.max(0, delayDays - 2); // LinkedIn 2 dias antes do email

  if (step === 1) {
    return {
      step,
      delayDays: delay,
      message: `Olá ${prospect.name}, vi seu perfil e gostaria de conectar. Trabalho com profissionais do ${prospect.industry || "setor"} e acho que poderíamos trocar uma ideia.`,
      actionType: "connection",
    };
  } else if (step === 3) {
    return {
      step,
      delayDays: delay,
      message: `Oi ${prospect.name}, publiquei recentemente sobre ${prospect.painPoints?.[0] || "desafios do setor"}. O que acha?`,
      actionType: "comment",
    };
  }

  return {
    step,
    delayDays: delay,
    message: `Olá ${prospect.name}, vi seu profile. Would love to connect and share some insights on ${prospect.industry || "your industry"}.`,
    actionType: "connection",
  };
}

const handler: SkillHandler<ColdEmailerInput, ColdEmailerOutput> = {
  slug,
  title: "E-mail Marketing Outbound",
  category: "sales",
  version: "1.0.0",
  supportsAutonomous: true,

  parseInput: (raw: unknown) => {
    return InputSchema.parse(raw);
  },

  execute: async (
    input: ColdEmailerInput,
    context: SkillExecutionContext
  ): Promise<SkillExecutionResult<ColdEmailerOutput>> => {
    const startTime = Date.now();
    const executionId = `coldemail-${nanoid(12)}`;

    try {
      const {
        prospect,
        offer,
        vertical,
        tone,
        sequenceLength,
        includeLinkedIn,
        campaignId,
      } = input;

      // Gerar sequência de emails
      const sequence: OutputSchema["sequence"] = [];
      const delays = [0, 2, 5, 7, 10, 12, 14].slice(0, sequenceLength);

      for (let i = 0; i < sequenceLength; i++) {
        sequence.push(
          generateEmail(i + 1, delays[i], prospect, offer, vertical, tone)
        );
      }

      // Gerar variants para A/B testing
      const variants: OutputSchema["variants"] = [];
      for (let i = 0; i < sequenceLength; i++) {
        const companyName = prospect.company || "seu negócio";
        variants.push({
          step: i + 1,
          subjectVariants: [
            `Ideia rápida sobre ${companyName}`,
            `${prospect.name}, você tem 2 min?`,
            `Sugestão para ${companyName}`,
          ],
          hookVariants: [
            "Questão direta",
            "Estatística impactante",
            "Social proof",
          ],
        });
      }

      // Gerar touchpoints LinkedIn
      let linkedInTouchpoints: OutputSchema["linkedInTouchpoints"] | undefined;
      if (includeLinkedIn) {
        linkedInTouchpoints = [1, 3]
          .filter((s) => s <= sequenceLength)
          .map((s) => generateLinkedInTouchpoint(s, delays[s - 1], prospect));
      }

      // Especificações técnicas de envio
      const totalDuration = delays[delays.length - 1] + 2;
      const technicalSpecs: OutputSchema["technicalSpecs"] = {
        totalEmails: sequenceLength,
        totalDuration: `${totalDuration} dias`,
        bestSendTime: "09:00 ou 14:00 (horário local do prospect)",
        optimalDay: "Terça a Quinta-feira",
      };

      // Verificar spam score
      const spamRisks: string[] = [];
      const spamSuggestions: string[] = [];

      for (const email of sequence) {
        if (email.body.includes("!!!")) {
          spamRisks.push("Excessivos de exclamação");
        }
        if (email.subject.length < 20) {
          spamRisks.push("Assunto muito curto pode parecer spam");
        }
        if (["grátis", "promoção"].some((w) => email.body.includes(w))) {
          spamRisks.push("Palavras potencialmente flagged");
        }
      }

      if (spamRisks.length === 0) {
        spamSuggestions.push("Score de spam baixo - sequência limpa");
      } else {
        spamSuggestions.push("Revisar marcadores identificados");
        spamSuggestions.push("Considerar usar mais personalização");
        spamSuggestions.push("Evitar palavras como 'grátis' ou 'promoção'");
      }

      const totalSpamScore = Math.min(100, spamRisks.length * 20);

      // Recomendações
      const recommendations: string[] = [
        `Sequência criada para ${prospect.name} (${prospect.email})`,
        `Duração total: ${totalDuration} dias`,
        includeLinkedIn
          ? "Incluir touchpoints LinkedIn para aumentar taxa de resposta"
          : "Considere adicionar touchpoints LinkedIn",
        "Testar variants de subject line na semana 1",
        "Ajustar timing baseado em open rates",
        "Manter follow-up manual para respostas positivas",
        ...(totalSpamScore > 40
          ? ["ATENÇÃO: Score de spam moderado - revisar conteúdo"]
          : []),
      ];

      const output: ColdEmailerOutput = {
        sequenceId: executionId,
        createdAt: new Date().toISOString(),
        campaignId,
        prospect: {
          name: prospect.name,
          email: prospect.email,
          company: prospect.company,
        },
        sequence,
        variants,
        linkedInTouchpoints,
        technicalSpecs,
        spamScore: {
          score: totalSpamScore,
          risks: spamRisks,
          suggestions: spamSuggestions,
        },
        recommendations,
      };

      return {
        executionId,
        skill: "cold-emailer",
        success: true,
        decision: "auto",
        latencyMs: Date.now() - startTime,
        output,
        message: `Sequência de ${sequenceLength} emails criada para ${prospect.name}. Duração: ${totalDuration} dias.`,
      };
    } catch (error) {
      return {
        executionId: `coldemail-${nanoid(12)}`,
        skill: "cold-emailer",
        success: false,
        decision: "needs_review",
        latencyMs: Date.now() - startTime,
        output: {} as ColdEmailerOutput,
        message: error instanceof Error ? `Erro: ${error.message}` : "Erro desconhecido",
      };
    }
  },
};

export const coldEmailerHandler = handler;
