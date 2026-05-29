import { z } from "zod";
import { nanoid } from "nanoid";
import type {
  SkillHandler,
  SkillExecutionContext,
  SkillExecutionResult,
} from "./types";

/**
 * Skill: Compliance Auditor (Auditoria de Conformidade)
 * -----------------------------------------------------------------------------
 * Verifica claims publicitários de acordo com as diretrizes do CONAR.
 * Analisa:
 *  - Alegações de resultados
 *  - Comparações com concorrentes
 *  - Promessas de preços
 *  -Termos potencialmente enganosos
 *  - Conformidade com LGPD em comunicações
 */
const slug = "compliance-auditor" as const;

const InputSchema = z.object({
  /** Texto ou conteúdo publicitário para auditar */
  content: z.string().min(1).max(5000),
  /** Tipo de conteúdo */
  contentType: z.enum([
    "copywriting",
    "email_marketing",
    "social_post",
    "landing_page",
    "video_script",
    "whatsapp_message",
  ]),
  /** Vertical de mercado (para regras específicas) */
  vertical: z.enum([
    "health",
    "beauty",
    "finance",
    "education",
    "tech",
    "food",
    "fashion",
    "general",
  ]).default("general"),
  /** País/região para regulamentos específicos */
  region: z.enum(["BR", "US", "EU", "LATAM"]).default("BR"),
  /** Incluir verificação LGPD */
  includeLgpdCheck: z.boolean().default(true),
  /** Incluir análise de concorrência */
  includeCompetitorCheck: z.boolean().default(false),
});

const OutputSchema = z.object({
  auditId: z.string(),
  auditedAt: z.string(),
  contentType: z.string(),
  vertical: z.string(),
  region: z.string(),
  overallStatus: z.enum(["approved", "needs_revision", "rejected"]),
  complianceScore: z.number(),
  violations: z.array(
    z.object({
      id: z.string(),
      severity: z.enum(["minor", "moderate", "major", "critical"]),
      category: z.enum([
        "misleading_claim",
        "unsubstantiated_result",
        "price_promise",
        "competitor_comparison",
        "prohibited_term",
        "lgpd_violation",
        "conar_violation",
      ]),
      description: z.string(),
      term: z.string(),
      context: z.string(),
      suggestion: z.string(),
      reference: z.string().optional(),
    })
  ),
  warnings: z.array(
    z.object({
      id: z.string(),
      severity: z.enum(["info", "caution"]),
      message: z.string(),
      suggestion: z.string(),
    })
  ),
  lgpdChecks: z
    .object({
      hasConsentMention: z.boolean(),
      hasPrivacyLink: z.boolean(),
      hasDataUsageDisclosure: z.boolean(),
      hasOptOutOption: z.boolean(),
      consentIssues: z.array(z.string()),
      overallLgpdStatus: z.enum(["compliant", "needs_revision", "non_compliant"]),
    })
    .optional(),
  competitorMentions: z
    .object({
      mentionedCompetitors: z.array(z.string()),
      comparisonType: z.enum(["direct", "indirect", "implied", "none"]),
      complianceStatus: z.enum(["compliant", "needs_revision", "non_compliant"]),
      issues: z.array(z.string()),
    })
    .optional(),
  approvedClaims: z.array(z.string()),
  revisedContent: z.string().optional(),
  recommendations: z.array(z.string()),
});

export type ComplianceAuditorInput = z.infer<typeof InputSchema>;
export type ComplianceAuditorOutput = z.infer<typeof OutputSchema>;

// Regras do CONAR por vertical
const conarRules: Record<string, any> = {
  health: {
    prohibitedTerms: ["cura", "trata", "previne", "elimina", "sem efeitos colaterais"],
    resultClaims: ["resultado pode variar", "não substitui acompanhamento médico"],
    substantiationRequired: true,
  },
  beauty: {
    prohibitedTerms: ["permanente", "garantido", "definitivo", "100%", "zero"],
    resultClaims: ["resultados podem variar", "uso contínuo recomendado"],
    substantiationRequired: true,
  },
  finance: {
    prohibitedTerms: ["renda fixa", "lucro garantido", "sem risco", "enriquecimento rápido"],
    resultClaims: ["rentabilidade passada não garante resultados futuros", "consulte seu assessor"],
    substantiationRequired: true,
  },
  education: {
    prohibitedTerms: ["garantia de aprovação", "100% de aproveitamento", "sem esforço"],
    resultClaims: ["resultados individuais podem variar", "compromisso do aluno é fundamental"],
    substantiationRequired: true,
  },
  general: {
    prohibitedTerms: [],
    resultClaims: ["resultados podem variar", "veja regulamento"],
    substantiationRequired: false,
  },
};

// Termos proibidos globalmente pelo CONAR
const globallyProhibitedTerms = [
  "mentira",
  "enganoso",
  "fraude",
  "golpe",
  "quebra",
  "pirâmide",
];

function detectViolations(
  content: string,
  vertical: string,
  region: string,
  includeCompetitorCheck: boolean
): OutputSchema["violations"] {
  const violations: OutputSchema["violations"] = [];
  const contentLower = content.toLowerCase();
  const rules = conarRules[vertical] || conarRules.general;

  // Verificar termos globalmente proibidos
  for (const term of globallyProhibitedTerms) {
    if (contentLower.includes(term)) {
      violations.push({
        id: `vr-${nanoid(6)}`,
        severity: "critical",
        category: "prohibited_term",
        description: `Termo proibido pelo CONAR: "${term}"`,
        term,
        context: extractContext(content, term),
        suggestion: `Remover ou substituir o termo "${term}". Verificar se o contexto é irônico ou informativo.`,
        reference: "CONAR - Código Brasileiro de Autorregulamentação Publicitária",
      });
    }
  }

  // Verificar termos específicos da vertical
  if (rules.prohibitedTerms) {
    for (const term of rules.prohibitedTerms) {
      if (contentLower.includes(term)) {
        violations.push({
          id: `vr-${nanoid(6)}`,
          severity: "major",
          category: "misleading_claim",
          description: `Alegação potencialmente enganosa: "${term}"`,
          term,
          context: extractContext(content, term),
          suggestion: `Alegações de resultados absolutos são proibidas. Use linguagem relativizada.`,
          reference: `CONAR - Vertical ${vertical.toUpperCase()}`,
        });
      }
    }
  }

  // Verificar alegações de resultados sem qualificadores
  const resultPatterns = [
    /(\d+)%\s*(de\s*)?(perda|ganho|resultado)/gi,
    /(perca|ganhe|alcance)\s*\d+/gi,
    /(perda|ganho|resultado)\s*garantid/i,
  ];

  for (const pattern of resultPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        id: `vr-${nanoid(6)}`,
        severity: "major",
        category: "unsubstantiated_result",
        description: `Alegação numérica de resultado sem qualificadores`,
        term: matches[0],
        context: extractContext(content, matches[0]),
        suggestion: "Adicionar qualificadores como 'resultados podem variar' ou 'em média'.",
        reference: "CONAR - Artigo 27",
      });
    }
  }

  // Verificar termos comparativos
  if (includeCompetitorCheck) {
    const competitorPatterns = [
      /melhor que/gi,
      /superior a/gi,
      /mais eficiente que/gi,
      /diferente de/gi,
    ];

    for (const pattern of competitorPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({
          id: `vr-${nanoid(6)}`,
          severity: "moderate",
          category: "competitor_comparison",
          description: `Comparação com concorrência requer comprovação`,
          term: matches[0],
          context: extractContext(content, matches[0]),
          suggestion: "Comparações devem ser fundamentadas em estudos ou dados verificáveis.",
          reference: "CONAR - Artigo 23",
        });
      }
    }
  }

  // Verificar promessas de preço
  const pricePatterns = [
    /menor(preço|valor)/gi,
    /mais barato/gi,
    /preço mais baixo/gi,
  ];

  for (const pattern of pricePatterns) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        id: `vr-${nanoid(6)}`,
        severity: "moderate",
        category: "price_promise",
        description: `Promessa de preço absoluto requer comprovação`,
        term: matches[0],
        context: extractContext(content, matches[0]),
        suggestion: "Adicionar 'um dos menores preços' ou 'competitivo' em vez de absolutos.",
        reference: "PROCON - Código de Defesa do Consumidor",
      });
    }
  }

  return violations;
}

function extractContext(content: string, term: string): string {
  const index = content.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return content.slice(0, 100);

  const start = Math.max(0, index - 30);
  const end = Math.min(content.length, index + term.length + 30);
  return content.slice(start, end);
}

function checkLgpd(content: string): OutputSchema["lgpdChecks"] {
  const contentLower = content.toLowerCase();

  const hasConsentMention = contentLower.includes("consentimento") ||
    contentLower.includes("autoriza") ||
    contentLower.includes("agree");

  const hasPrivacyLink = contentLower.includes("privacidade") ||
    contentLower.includes("política de privacidade") ||
    contentLower.includes("lgpd");

  const hasDataUsageDisclosure = contentLower.includes("seus dados") ||
    contentLower.includes("dados pessoais") ||
    contentLower.includes("armazenamento");

  const hasOptOutOption = contentLower.includes("descadastrar") ||
    contentLower.includes("sair da lista") ||
    contentLower.includes("unsubscribe") ||
    contentLower.includes("opt-out");

  const consentIssues: string[] = [];

  if (!hasConsentMention) {
    consentIssues.push("Menção de consentimento ausentes");
  }
  if (!hasPrivacyLink) {
    consentIssues.push("Link para política de privacidade ausentes");
  }
  if (!hasOptOutOption) {
    consentIssues.push("Opção de descadastro ausentes");
  }

  let overallStatus: "compliant" | "needs_revision" | "non_compliant" = "compliant";
  if (consentIssues.length >= 2) {
    overallStatus = "non_compliant";
  } else if (consentIssues.length > 0) {
    overallStatus = "needs_revision";
  }

  return {
    hasConsentMention,
    hasPrivacyLink,
    hasDataUsageDisclosure,
    hasOptOutOption,
    consentIssues,
    overallLgpdStatus: overallStatus,
  };
}

const handler: SkillHandler<ComplianceAuditorInput, ComplianceAuditorOutput> = {
  slug,
  title: "Auditor de Conformidade",
  category: "governance",
  version: "1.0.0",
  supportsAutonomous: true,

  parseInput: (raw: unknown) => {
    return InputSchema.parse(raw);
  },

  execute: async (
    input: ComplianceAuditorInput,
    context: SkillExecutionContext
  ): Promise<SkillExecutionResult<ComplianceAuditorOutput>> => {
    const startTime = Date.now();
    const executionId = `compliance-${nanoid(12)}`;

    try {
      const {
        content,
        contentType,
        vertical,
        region,
        includeLgpdCheck,
        includeCompetitorCheck,
      } = input;

      // Detectar violações
      const violations = detectViolations(
        content,
        vertical,
        region,
        includeCompetitorCheck
      );

      // Calcular score de conformidade
      const severityWeights = {
        critical: 30,
        major: 20,
        moderate: 10,
        minor: 5,
      };

      let deductPoints = 0;
      for (const v of violations) {
        deductPoints += severityWeights[v.severity] || 0;
      }

      const complianceScore = Math.max(0, 100 - deductPoints);

      // Determinar status geral
      let overallStatus: "approved" | "needs_revision" | "rejected" = "approved";
      if (violations.some((v) => v.severity === "critical")) {
        overallStatus = "rejected";
      } else if (violations.some((v) => v.severity === "major")) {
        overallStatus = "needs_revision";
      } else if (violations.some((v) => v.severity === "moderate")) {
        overallStatus = "needs_revision";
      }

      // Verificações LGPD
      const lgpdChecks = includeLgpdCheck ? checkLgpd(content) : undefined;

      // Análise de menções a concorrentes
      const competitorMentions = includeCompetitorCheck
        ? {
            mentionedCompetitors: [],
            comparisonType: "none" as const,
            complianceStatus: "compliant" as const,
            issues: [],
          }
        : undefined;

      // Claims aprovados (termos seguros)
      const approvedClaims: string[] = [];
      if (content.includes("resultados podem variar")) {
        approvedClaims.push("Menção a variação de resultados");
      }
      if (content.includes("consulte um profissional") || content.includes("aconselhamento")) {
        approvedClaims.push(" Recomendação de consulta profissional");
      }
      if (lgpdChecks?.hasConsentMention) {
        approvedClaims.push("Menção de consentimento");
      }

      // Recomendações
      const recommendations: string[] = [
        ...(violations.length > 0
          ? [`Revisar ${violations.length} violação(ões) identificada(s)`]
          : ["Conteúdo dentro dos padrões de conformidade"]),
        ...(lgpdChecks?.overallLgpdStatus !== "compliant"
          ? ["Atualizar comunicações para conformidade LGPD"]
          : []),
        "Manter registro de aprovações para auditoria futura",
        ...(overallStatus === "needs_revision" || overallStatus === "rejected"
          ? ["Solicitar revisão legal antes da publicação"]
          : []),
      ];

      // Gerar versão revisada do texto
      let revisedContent: string | undefined;
      if (violations.length > 0) {
        revisedContent = content;
        for (const v of violations) {
          if (v.category === "misleading_claim") {
            // Substituir termos problemáticos por versões seguras
            revisedContent = revisedContent.replace(
              new RegExp(v.term, "gi"),
              `[REVISADO: ${v.term}]`
            );
          }
        }
      }

      const output: ComplianceAuditorOutput = {
        auditId: executionId,
        auditedAt: new Date().toISOString(),
        contentType,
        vertical,
        region,
        overallStatus,
        complianceScore,
        violations,
        warnings: violations.length === 0 ? [] : [],
        lgpdChecks,
        competitorMentions,
        approvedClaims,
        revisedContent,
        recommendations,
      };

      return {
        executionId,
        skill: "compliance-auditor",
        success: true,
        decision: overallStatus === "approved" ? "auto" : "needs_review",
        latencyMs: Date.now() - startTime,
        output,
        message: `Auditoria CONAR concluída. Score: ${complianceScore}/100 (${overallStatus}). ${violations.length} violação(ões) encontrada(s).`,
      };
    } catch (error) {
      return {
        executionId: `compliance-${nanoid(12)}`,
        skill: "compliance-auditor",
        success: false,
        decision: "needs_review",
        latencyMs: Date.now() - startTime,
        output: {
          auditId: nanoid(12),
          auditedAt: new Date().toISOString(),
          contentType: input.contentType,
          vertical: input.vertical,
          region: input.region,
          overallStatus: "needs_revision",
          complianceScore: 0,
          violations: [
            {
              id: `vr-${nanoid(6)}`,
              severity: "critical" as const,
              category: "conar_violation" as const,
              description: "Erro no processamento do conteúdo",
              term: "",
              context: error instanceof Error ? error.message : "Erro desconhecido",
              suggestion: "Verificar formato do conteúdo e tentar novamente.",
            },
          ],
          warnings: [],
          recommendations: ["Revisar erro técnicos antes de nova tentativa."],
        },
        message: error instanceof Error ? `Erro: ${error.message}` : "Erro desconhecido",
      };
    }
  },
};

export const complianceAuditorHandler = handler;
