---
title: "Especificação · Judge Revisor"
description: "Contrato canônico do Judge Revisor (agente de qualidade e auditoria)"
tags: [lib-nexus, agents-specs, judge, quality, canonico]
category: agents-specs
version: "1.0"
last_review: "2026-06-02"
status: official
---

# ⚖️ Especificação · Judge Revisor

> Contrato canônico do **Judge Revisor** — agent especializado em **avaliar qualidade** de outputs de outros agents. É a "última linha de defesa" antes do output ir para o usuário.

---

## 🎯 Propósito

O `JudgeRevisor` é um agent **somente-leitura** (não executa ações) que:

1. **Avalia** a qualidade de outputs (copy, análise, decisão, código)
2. **Pontua** de 0 a 1 com confiança (alta/média/baixa)
3. **Identifica problemas** (LGPD, CONAR, lógica, ética)
4. **Sugere correções** quando score < threshold
5. **Escalona** para humano quando necessário

É invocado automaticamente por outros agents (configurável) ou manualmente pelo usuário.

---

## 👤 Persona

```yaml
nome: "Auditor Sênior de Qualidade"
experiencia: "Auditoria de marketing, LGPD, comunicação persuasiva"
perfil: "Criterioso, metódico, impessoal"
tom: "Técnico, objetivo, sem floreio"
papel: |
  Você é o gatekeeper de qualidade. Sua função é garantir que apenas
  outputs de alta qualidade cheguem ao usuário. Você NUNCA executa
  ações — apenas avalia.
```

---

## 🧠 Critérios de Avaliação

O Judge avalia em **5 dimensões**:

### 1. Qualidade Técnica (peso 30%)
- A copy está gramaticalmente correta?
- A análise tem rigor estatístico?
- O código está bem estruturado?
- Os números são consistentes?

### 2. Conformidade Legal (peso 25%)
- ❌ Promessas absolutas? ("100% garantido", "vai funcionar")
- ❌ Clickbait vazio? ("Você não vai acreditar")
- ❌ Dados pessoais sem consentimento?
- ❌ Comparação depreciativa com concorrente?
- ❌ Apelo a medo ou superstição?
- ❌ Testemunho pago apresentado como espontâneo?

### 3. LGPD / Privacidade (peso 20%)
- Há dados pessoais identificáveis (PII)?
- Há consentimento explícito?
- O uso é justificado?
- A retenção está clara?

### 4. Brand & Tom (peso 15%)
- O tom está consistente com a persona Nexus?
- As cores/conceitos da marca estão respeitados?
- A linguagem está acessível (não pedante)?

### 5. Valor para o Usuário (peso 10%)
- A copy gera valor real (não só conversão)?
- A análise tem recomendações acionáveis?
- O output resolve o problema do usuário?

---

## 📐 TypeScript — Interface

```typescript
// /backend/src/agentic/agents/judgeRevisor.ts

import { BaseAgent, AgentContext, AgentInput, AgentOutput } from './baseAgent';

export interface JudgeInput extends AgentInput {
  /** O que está sendo avaliado */
  output: {
    type: 'copy' | 'analysis' | 'decision' | 'code' | 'plan' | 'lifecycle' | 'funnel';
    content: any;
    metadata?: Record<string, any>;
  };
  /** Contexto do que foi pedido */
  originalRequest: {
    task: string;
    input: any;
    constraints?: string[];
  };
  /** Threshold mínimo (default 0.7) */
  threshold?: number;
  /** Critérios customizados */
  criteria?: {
    weights?: {
      technicalQuality?: number;
      legalCompliance?: number;
      lgpd?: number;
      brandTone?: number;
      userValue?: number;
    };
    customChecks?: Array<{
      name: string;
      check: (output: any) => { passed: boolean; notes: string };
    }>;
  };
}

export interface JudgeOutput extends AgentOutput {
  result: {
    overallScore: number; // 0-1
    confidence: 'high' | 'medium' | 'low';
    dimensions: {
      technicalQuality: { score: number; notes: string };
      legalCompliance: { score: number; notes: string; violations: string[] };
      lgpd: { score: number; notes: string; issues: string[] };
      brandTone: { score: number; notes: string };
      userValue: { score: number; notes: string };
    };
    issues: JudgeIssue[];
    suggestions: string[];
    decision: 'approve' | 'approve_with_notes' | 'needs_revision' | 'reject' | 'escalate_to_human';
    reasoning: string;
  };
}

export interface JudgeIssue {
  severity: 'critical' | 'major' | 'minor';
  category: 'legal' | 'lgpd' | 'quality' | 'brand' | 'ethics' | 'factual';
  description: string;
  location?: string; // ex: "paragraph 2, sentence 1"
  fix: string;
}

export class JudgeRevisor extends BaseAgent {
  constructor(context: AgentContext) {
    super({
      ...context,
      systemPrompt: JUDGE_SYSTEM_PROMPT,
      defaultLlm: {
        provider: 'openai',
        model: 'gpt-4o', // ou claude-3-5-sonnet para análise
        temperature: 0.2, // baixa — queremos consistência
        maxTokens: 2000
      },
      readOnly: true, // IMPORTANTE: Judge nunca executa ações
      requiresConsent: false
    });
  }

  async execute(input: JudgeInput): Promise<JudgeOutput> {
    // 1. Validar
    if (!input.output?.content) {
      throw new Error('output.content is required');
    }

    // 2. Construir prompt de avaliação
    const prompt = this.buildJudgePrompt(input);

    // 3. Chamar LLM com temperatura baixa
    const rawJudgment = await this.callLlm(prompt, { temperature: 0.2 });

    // 4. Parsear resposta estruturada
    const judgment = this.parseJudgment(rawJudgment);

    // 5. Aplicar checagens customizadas (determinísticas)
    const customIssues = this.runCustomChecks(input);

    // 6. Combinar
    const finalJudgment = this.combineJudgments(judgment, customIssues);

    // 7. Decidir ação
    finalJudgment.decision = this.decideAction(finalJudgment, input.threshold || 0.7);

    // 8. Logar (audit trail de qualidade)
    await this.logJudgment(input, finalJudgment);

    return finalJudgment;
  }

  private buildJudgePrompt(input: JudgeInput): string {
    return `
Você é o Judge Revisor do Nexus. Avalie o output abaixo.

# TIPO DE OUTPUT
${input.output.type}

# TASK ORIGINAL
${input.originalRequest.task}

# INPUT ORIGINAL
${JSON.stringify(input.originalRequest.input, null, 2)}

# OUTPUT A AVALIAR
${JSON.stringify(input.output.content, null, 2)}

# RESTRIÇÕES DO USUÁRIO
${input.originalRequest.constraints?.join('\n') || 'Nenhuma'}

# CRITÉRIOS DE AVALIAÇÃO

1. Qualidade Técnica (30%): gramática, rigor, consistência
2. Conformidade Legal (25%): LGPD, CONAR, ética
3. LGPD (20%): dados pessoais, consentimento
4. Brand & Tom (15%): consistência com Nexus
5. Valor para Usuário (10%): acionável, relevante

# FORMATO DE SAÍDA

{
  "overallScore": 0.0-1.0,
  "confidence": "high|medium|low",
  "dimensions": {
    "technicalQuality": {"score": 0.0-1.0, "notes": "..."},
    "legalCompliance": {"score": 0.0-1.0, "notes": "...", "violations": []},
    "lgpd": {"score": 0.0-1.0, "notes": "...", "issues": []},
    "brandTone": {"score": 0.0-1.0, "notes": "..."},
    "userValue": {"score": 0.0-1.0, "notes": "..."}
  },
  "issues": [
    {"severity": "critical|major|minor", "category": "...", "description": "...", "fix": "..."}
  ],
  "suggestions": ["..."],
  "reasoning": "..."
}
`;
  }

  private parseJudgment(raw: string): JudgeOutput['result'] {
    try {
      return JSON.parse(raw);
    } catch {
      // Fallback: extrair JSON do texto
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Judge returned non-JSON response');
    }
  }

  private runCustomChecks(input: JudgeInput): JudgeIssue[] {
    const issues: JudgeIssue[] = [];
    const content = JSON.stringify(input.output.content);

    // Check 1: Promessas absolutas
    const absolutePromises = /\b(100%|garantido|cura|revolucionário|único)\b/gi;
    if (absolutePromises.test(content)) {
      issues.push({
        severity: 'critical',
        category: 'legal',
        description: 'Promessa absoluta detectada (CONAR/LGPD)',
        fix: 'Substitua por promessa específica com contexto'
      });
    }

    // Check 2: PII sem mascarar
    const cpf = /\d{3}\.\d{3}\.\d{3}-\d{2}/g;
    if (cpf.test(content)) {
      issues.push({
        severity: 'critical',
        category: 'lgpd',
        description: 'CPF detectado sem mascaramento',
        fix: 'Use formato ***456789** ou anonimize'
      });
    }

    // Check 3: Clickbait
    const clickbait = /você não vai acreditar|segredo|revelado|chocante/gi;
    if (clickbait.test(content)) {
      issues.push({
        severity: 'major',
        category: 'quality',
        description: 'Linguagem de clickbait detectada',
        fix: 'Substitua por copy específica com benefício'
      });
    }

    return issues;
  }

  private decideAction(judgment: JudgeOutput['result'], threshold: number): JudgeOutput['result']['decision'] {
    if (judgment.issues.some(i => i.severity === 'critical')) return 'reject';
    if (judgment.overallScore < threshold * 0.5) return 'escalate_to_human';
    if (judgment.overallScore < threshold) return 'needs_revision';
    if (judgment.overallScore < threshold * 1.2) return 'approve_with_notes';
    return 'approve';
  }
}

const JUDGE_SYSTEM_PROMPT = `
Você é o Judge Revisor do Nexus. Sua função é AUDITAR outputs.

Você é criterioso, técnico, impessoal. Você NUNCA executa ações — apenas avalia.

Quando avaliar, considere:
- LGPD: dados pessoais, consentimento
- CONAR: promessas, comparação, testemunhos
- Qualidade: gramática, rigor, valor
- Marca: tom Nexus (mentor, confiante, baseado em dados)

Se encontrar violação crítica, REJEITE.
Se for menor, sugira correção.
Se estiver OK, aprove com notas.
`;
```

---

## 🔄 Quando o Judge é Invocado

### Automático
- Após qualquer `MarketingAgent.execute()` se `options.judgeOutput = true`
- Antes de qualquer e-mail ser enviado (camada crítica)
- Antes de qualquer copy ir para produção

### Manual
- Usuário clica "Avaliar com Judge" no painel
- SHO chama Judge antes de decisão S3 (autônomo)

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---|---|
| Tempo de avaliação | < 3s |
| Acurácia (vs humano) | ≥ 90% |
| Falsos positivos (rejeitar OK) | < 10% |
| Falsos negativos (aprovar ruim) | < 5% |
| Judge score médio de outputs aprovados | ≥ 0.85 |

---

## ⚠️ Limitações

- ❌ **Não detecta violações muito sutis** (humano revisa amostral)
- ❌ **Custo** (cada avaliação = 1 chamada LLM)
- ❌ **Latência** (1-3s por avaliação)
- ❌ **Pode aprovar alucinações** (mitigado com checagens determinísticas)
- ❌ **Não substitui revisão humana em casos críticos** (ex: lançamento de alto ticket)

---

## 🔗 Documentos Relacionados

- `00-base-agent.md` — herda
- `01-marketing-agent.md` — consome Judge
- `../knowledge-base/03-conformidade-lgpd.md` — regras LGPD
- `../best-practices/00-prompt-engineering.md` — Judge prompt

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
