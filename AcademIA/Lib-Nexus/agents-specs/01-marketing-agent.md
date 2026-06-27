---
title: "Especificação · Marketing Agent"
description: "Contrato canônico do Marketing Agent (execução de marketing: copy, segmentação, lifecycle)"
tags: [lib-nexus, agents-specs, marketing-agent, canonico]
category: agents-specs
version: "1.0"
last_review: "2026-06-02"
status: official
---

# 📊 Especificação · Marketing Agent

> Contrato canônico do **Marketing Agent** — agent que executa **operações de marketing** (copy, segmentação, lifecycle, otimização). Herda de `BaseAgent`.

---

## 🎯 Propósito

O `MarketingAgent` é especializado em **planejar e executar** operações de marketing. É o agent que afiliados e operadores usam diariamente para:

- Gerar copy (headlines, e-mails, anúncios, VSL)
- Segmentar leads
- Criar funis
- Orquestrar lifecycle
- Analisar performance
- Sugerir otimizações

---

## 👤 Persona

```yaml
nome: "Estrategista de Marketing Sênior"
experiencia: "10 anos em marketing digital"
especialidades:
  - "Copywriting de alta conversão"
  - "Funis e lifecycle"
  - "Análise de dados e otimização"
tom:
  - "Mentor, não professor"
  - "Confiante sem arrogância"
  - "Direto e prescritivo"
  - "Baseado em dados quando possível"
restricoes:
  - "NUNCA prometer resultado absoluto"
  - "NUNCA usar clickbait vazio"
  - "SEMPRE respeitar LGPD"
  - "SEMPRE validar copy com Judge"
```

---

## 🧠 Skills Habilitadas (subset)

| Skill | Categoria | Custo/uso |
|---|---|---|
| `copywriter-persuasivo` | copy | 24 créditos |
| `landing-page-writer` | copy | 60 créditos |
| `ad-copy-generator` | copy | 36 créditos |
| `vsl-script-writer` | copy | 72 créditos |
| `audience-segmenter` | marketing | 48 créditos |
| `funnel-architect` | marketing | 84 créditos |
| `persona-builder` | marketing | 30 créditos |
| `editorial-planner` | marketing | 24 créditos |
| `lifecycle-orchestrator` | automation | 72 créditos |
| `ab-test-designer` | analytics | 36 créditos |
| `roi-attributor` | analytics | 60 créditos |
| `pricing-optimizer` | pricing | 72 créditos |

---

## 📐 TypeScript — Interface Específica

```typescript
// /backend/src/agentic/agents/marketingAgent.ts

import { BaseAgent, AgentContext, AgentInput, AgentOutput } from './baseAgent';

export type MarketingTaskType =
  | 'generate_copy'
  | 'segment_audience'
  | 'design_funnel'
  | 'plan_lifecycle'
  | 'optimize_campaign'
  | 'analyze_performance'
  | 'launch_product';

export interface MarketingInput extends AgentInput {
  taskType: MarketingTaskType;
  payload: {
    product?: {
      name: string;
      description: string;
      price: number;
      targetAudience: string;
    };
    audience?: {
      size: number;
      source: 'cold' | 'warm' | 'hot' | 'mixed';
      knownSegments?: string[];
    };
    channel?: 'email' | 'whatsapp' | 'instagram' | 'facebook' | 'google' | 'tiktok' | 'mixed';
    goal?: {
      metric: 'conversion' | 'engagement' | 'retention' | 'revenue';
      target: number;
      timeframe: string;
    };
    constraints?: {
      budget?: number;
      timeline?: string;
      brand?: 'nexus' | 'client_brand' | 'custom';
    };
  };
  options?: {
    /** Quantas variantes gerar (default 3) */
    variants?: number;
    /** Chamar Judge Revisor após gerar */
    judgeOutput?: boolean;
    /** Retornar com confidence score */
    withConfidence?: boolean;
  };
}

export interface MarketingOutput extends AgentOutput {
  result: 
    | { type: 'copy'; variants: CopyVariant[] }
    | { type: 'segmentation'; segments: Segment[] }
    | { type: 'funnel'; architecture: FunnelArchitecture }
    | { type: 'lifecycle'; sequence: LifecycleStep[] }
    | { type: 'optimization'; recommendations: Recommendation[] }
    | { type: 'analysis'; insights: Insight[] }
    | { type: 'launch_plan'; plan: LaunchPlan };
}

export interface CopyVariant {
  text: string;
  format: 'headline' | 'email_subject' | 'email_body' | 'ad_primary' | 'ad_headline' | 'landing_h1' | 'cta';
  psychologicalHook: 'curiosity' | 'urgency' | 'proof' | 'fear' | 'belonging';
  judgeScore: number;
  notes: string;
}

export interface Segment {
  name: string;
  criteria: Record<string, any>;
  estimatedSize: number;
  action: string;
}

export interface FunnelArchitecture {
  stages: Array<{
    name: string;
    goal: string;
    channels: string[];
    conversionTarget: number;
  }>;
  estimatedROI: number;
  unitEconomics: {
    cac: number;
    ltv: number;
    payback: number;
  };
}

export interface LifecycleStep {
  day: number;
  channel: string;
  action: string;
  goal: string;
  exitCondition?: string;
}

export interface Recommendation {
  action: string;
  impact: number; // 1-10
  confidence: number; // 1-10
  ease: number; // 1-10
  iceScore: number;
  reasoning: string;
}

export interface Insight {
  finding: string;
  evidence: string;
  confidence: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface LaunchPlan {
  timeline: Array<{
    day: number;
    action: string;
    owner: string;
    asset: string;
  }>;
  budget: Array<{ item: string; cost: number }>;
  expectedRevenue: number;
  risks: string[];
}

export class MarketingAgent extends BaseAgent {
  constructor(context: AgentContext) {
    super({
      ...context,
      systemPrompt: MARKETING_SYSTEM_PROMPT,
      defaultLlm: {
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 4000
      }
    });
  }

  async execute(input: MarketingInput): Promise<MarketingOutput> {
    // 1. Validar input específico
    this.validateMarketingInput(input);

    // 2. Selecionar skill apropriada
    const skill = this.selectSkill(input.taskType);

    // 3. Construir prompt estruturado (CO-STAR)
    const prompt = this.buildPrompt(input, skill);

    // 4. Executar com LLM + tools
    const result = await this.callLlmWithTools(prompt);

    // 5. (Opcional) Chamar Judge
    if (input.options?.judgeOutput !== false) {
      const judgeScore = await this.callJudge(result);
      result.judgeScore = judgeScore.score;
      if (judgeScore.score < 0.7) {
        return this.retryOrEscalate(input, judgeScore);
      }
    }

    // 6. Retornar
    return result;
  }

  private selectSkill(taskType: MarketingTaskType): string {
    const map: Record<MarketingTaskType, string> = {
      'generate_copy': 'copywriter-persuasivo',
      'segment_audience': 'audience-segmenter',
      'design_funnel': 'funnel-architect',
      'plan_lifecycle': 'lifecycle-orchestrator',
      'optimize_campaign': 'roi-attributor',
      'analyze_performance': 'roi-attributor',
      'launch_product': 'funnel-architect'
    };
    return map[taskType];
  }

  private buildPrompt(input: MarketingInput, skill: string): string {
    // Usa CO-STAR framework
    return `
# Context
Você é um estrategista de marketing sênior do Nexus Affil'IA'te...

# Objective
${input.task} usando a skill ${skill}

# Style
Profissional, prescritivo, baseado em dados.

# Tone
Mentor sênior, confiante, caloroso.

# Audience
${JSON.stringify(input.payload.audience || {})}

# Response
${JSON.stringify(input.options || { variants: 3 })}
`;
  }
}

const MARKETING_SYSTEM_PROMPT = `
Você é o Marketing Agent do Nexus Affil'IA'te.

Sua missão: ajudar afiliados a terem sucesso com marketing digital de alta performance, usando dados, ética e criatividade.

Princípios:
1. SEMPRE basear em dados (não achismo)
2. NUNCA prometer resultado absoluto
3. SEMPRE respeitar LGPD
4. SEMPRE validar copy com Judge Revisor
5. SEMPRE priorizar valor sobre venda

Quando gerar copy:
- 1 ideia por peça
- Benefício concreto (não adjetivo vazio)
- Prova específica (não genérica)
- Tom da persona

Quando analisar:
- 3-5 padrões principais
- Confiança (alta/média/baixa)
- Ações priorizadas (ICE)
`;
```

---

## 🔄 Fluxo Típico

### Tarefa: "Gerar 3 headlines para o curso X"

```
Input:
{
  taskType: 'generate_copy',
  payload: {
    product: { name: 'Curso X', price: 497, ... },
    audience: { source: 'cold' },
    channel: 'facebook'
  },
  options: { variants: 3, judgeOutput: true }
}

Fluxo:
1. MarketingAgent.execute(input)
2. Valida input
3. Seleciona skill: copywriter-persuasivo
4. Constrói prompt CO-STAR
5. Chama GPT-4o
6. Recebe 3 variantes
7. Chama Judge Revisor para cada
8. Se score < 0.7, regenera (até 3x)
9. Retorna CopyVariant[]

Output:
{
  status: 'success',
  result: {
    type: 'copy',
    variants: [
      { text: '...', judgeScore: 0.85, psychologicalHook: 'curiosity' },
      { text: '...', judgeScore: 0.78, psychologicalHook: 'proof' },
      { text: '...', judgeScore: 0.82, psychologicalHook: 'urgency' }
    ]
  },
  metadata: { tokensUsed: 1850, costBRL: 0.18, durationMs: 4200, ... }
}
```

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---|---|
| CTR de copy gerado | ≥ 1.5% (Facebook) |
| Open rate de e-mail | ≥ 35% |
| Judge score médio | ≥ 0.80 |
| Custo médio por execução | < R$ 0.20 |
| Latência | < 5s |
| Taxa de escalação humana | < 5% |

---

## ⚠️ Limitações Conhecidas

- ❌ Não acessa Meta Ads/Google Ads diretamente (apenas via API)
- ❌ Não publica sem aprovação (a menos que SHO Level = S3+)
- ❌ Não envia e-mail sem passar por auditoria LGPD
- ❌ Não gera imagens (apenas prompts para designers)
- ❌ Não conhece dados pós-janela de 24 meses (limitação do LLM)

---

## 🔗 Documentos Relacionados

- `00-base-agent.md` — classe base
- `02-judge-revisor.md` — consome output deste
- `../knowledge-base/02-taxonomia-skills.md` — skills que usa
- `../best-practices/00-prompt-engineering.md` — como faz prompts

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
