---
title: "Best Practices · Prompt Engineering"
description: "Padrões canônicos de prompt engineering para o Nexus (CO-STAR, guardrails, few-shot)"
tags: [lib-nexus, best-practices, prompt-engineering, canonico, llm]
category: best-practices
version: "1.0"
last_review: "2026-06-02"
status: canonico
---

# 🎯 Best Practices · Prompt Engineering

> Padrões canônicos de **prompt engineering** usados em todo o Nexus. Toda nova skill, agent ou tool que invoca LLM deve seguir estas convenções.

---

## 🎯 Framework CO-STAR

Todos os prompts do Nexus seguem a estrutura **CO-STAR** (Context, Objective, Style, Tone, Audience, Response).

```
C — Context    (Contexto): Quem é o modelo, em que cenário
O — Objective  (Objetivo): O que entregar, em que formato
S — Style      (Estilo): Tom, formalidade, voz
T — Tone       (Tom emocional): Empático, urgente, racional
A — Audience   (Público): Para quem é a resposta
R — Response   (Formato): Markdown, JSON, tabela, lista
+ Guardrail    (Limites): O que NUNCA fazer
```

### Template Canônico

```text
# Context (Contexto)
Você é um [papel] com [experiência] em [domínio].
Cenário atual: [situação do usuário].

# Objective (Objetivo)
Sua tarefa é [ação clara]. O sucesso é [métrica].

# Style (Estilo)
Use linguagem [formal/informal/técnica/simples].
Evite [jargão, adjetivo vazio, etc.].
Siga [brand voice, persona, tom da empresa].

# Tone (Tom Emocional)
Seja [empático, confiante, urgente, provocativo, racional].
A relação com o leitor é [mentor, amigo, vendedor, professor].

# Audience (Público)
Quem vai ler: [persona resumida].
Nível de conhecimento: [iniciante, intermediário, avançado].
Dores principais: [lista].
Desejos: [lista].

# Response Format (Formato)
Responda em [Markdown/JSON/tabela].
Estrutura: [bullet 1, bullet 2, ...].
Tamanho: [palavras, caracteres, linhas].

# Guardrail (Limites)
- NUNCA [ação 1]
- NUNCA [ação 2]
- SEMPRE [ação 3]
- EVITE [coisa 4]
- MÁXIMO [limite]
```

---

## 📋 Patterns Canônicos

### 1. One-Shot (1 exemplo)

**Quando usar**: tarefa clara mas LLM precisa entender o **formato exato**.

```text
# Exemplo
Input: "Maria, 30, afiliada em transição"
Output:
{
  "persona": {
    "name": "Maria Escala",
    "age": "28-38",
    "pain": "Faturamento instável",
    "desire": "Escalar para R$ 50k/mês"
  }
}

# Tarefa
Input: "João, 28, iniciante ambicioso"
```

### 2. Few-Shot (3-5 exemplos)

**Quando usar**: tarefa complexa com **padrão não-óbvio**.

```text
# Exemplos
1. "curso barato" → Tag: "preco", Intenção: "compra"
2. "como começar" → Tag: "onboarding", Intenção: "suporte"
3. "não funcionou" → Tag: "reclamacao", Intenção: "suporte"
4. "indicação para" → Tag: "indicacao", Intenção: "venda"
5. "cancelar" → Tag: "churn", Intenção: "retencao"

# Tarefa
"vocês têm desconto?"
```

### 3. Chain-of-Thought (CoT)

**Quando usar**: tarefa que requer **raciocínio passo a passo**.

```text
# Tarefa
Analise a tabela de coorte e identifique padrões.

# Instrução
Pense passo a passo:
1. Calcule a retenção média por mês
2. Identifique a coorte com melhor e pior performance
3. Compare com o período anterior
4. Sugira 3 hipóteses para os padrões
5. Priorize ações com ICE score

# Output
[resposta em Markdown estruturado]
```

### 4. ReAct (Reasoning + Acting)

**Quando usar**: LLM precisa **executar ações** ou **buscar informações**.

```text
# Tarefa
Calcule o ROI de uma campanha de ads.

# Tools disponíveis
- query_database(sql)
- call_ads_api(metric, period)

# Formato de resposta
Thought: o que precisa saber
Action: qual tool usar
ActionInput: parâmetros
Observation: resultado
Thought: ...
Final Answer: resposta final
```

### 5. Structured Output (JSON Schema)

**Quando usar**: output precisa ser **parseável por código**.

```text
# Schema
{
  "type": "object",
  "properties": {
    "headline": { "type": "string", "maxLength": 60 },
    "psychologicalHook": { 
      "type": "string", 
      "enum": ["curiosity", "urgency", "proof", "fear", "belonging"]
    },
    "judgeScore": { "type": "number", "minimum": 0, "maximum": 1 }
  },
  "required": ["headline", "psychologicalHook", "judgeScore"]
}

# Tarefa
Gere a headline.
```

---

## 🛡️ Guardrails (Limites)

### O que SEMPRE ter no Prompt

1. **Papel claro**: "Você é um [papel]"
2. **Objetivo específico**: "Sua tarefa é [X]"
3. **Formato de saída**: "Responda em [JSON/Markdown/...]"
4. **Limites negativos**: "NUNCA [ação]"
5. **Limites positivos**: "SEMPRE [ação]"
6. **LGPD**: "Nunca exponha PII"
7. **CONAR**: "Nunca prometa resultado absoluto"

### Template de Guardrail

```text
# Guardrail

❌ NUNCA:
- Promessas absolutas ("100% garantido", "vai funcionar")
- Clickbait vazio ("Você não vai acreditar")
- Adjetivos vazios ("revolucionário", "incrível", "único")
- Dados pessoais identificáveis (PII)
- Mais de 1 exclamação
- Mais de 12 palavras em headline

✅ SEMPRE:
- Benefício concreto (não adjetivo)
- Prova específica (número, fonte)
- Tom da persona Nexus
- Respeitar LGPD
- Validar com Judge (score ≥ 0.7)
```

---

## 🎨 Escolha de Modelo

### Por Tipo de Tarefa

| Tarefa | Modelo | Temperature | Max Tokens |
|---|---|---|---|
| Copy criativa | gpt-4o, claude-3-5-sonnet | 0.7-0.9 | 1000-2000 |
| Análise de dados | gpt-4o, claude-3-5-sonnet | 0.1-0.3 | 2000-4000 |
| Raciocínio complexo | o1-preview, claude-3-5-sonnet | 0.2-0.4 | 4000-8000 |
| Tradução | gpt-4o-mini | 0.3 | 500 |
| Sumarização | gpt-4o-mini, claude-haiku | 0.2 | 1000 |
| Geração de código | claude-3-5-sonnet, gpt-4o | 0.2 | 2000-4000 |
| Classificação | gpt-4o-mini | 0.0 | 100 |
| Brainstorming | gpt-4o, claude-3-5-sonnet | 0.9-1.0 | 2000 |

### Regra de Custo
- **Tarefa cara**: usar modelo menor quando possível
- **Tarefa crítica**: usar modelo maior + Judge
- **Tarefa volume**: usar modelo menor + batch

---

## 🔁 Iteração e Refinamento

### Loop de Melhoria
```
1. Escrever prompt v1
2. Rodar com 10-20 inputs reais
3. Avaliar outputs (Judge + humano)
4. Identificar padrões de erro
5. Refinar prompt (adicionar guardrail, exemplo, instrução)
6. Rodar novamente
7. Medir lift
8. Commit + documentar
```

### Onde o Prompt Falha (diagnóstico)

| Sintoma | Causa provável | Solução |
|---|---|---|
| Output muito genérico | Falta contexto | Adicionar persona, exemplo |
| Output fora do formato | Falta instrução de formato | Adicionar schema/exemplo |
| Output viola regra | Falta guardrail | Adicionar "NUNCA" explícito |
| Output inconsistente | Temperature alta | Reduzir para 0.0-0.3 |
| Alucinação | Sem contexto verificado | Pedir "use APENAS dados fornecidos" |
| Output truncado | maxTokens baixo | Aumentar |

---

## 🧪 Testes de Prompt

### Teste Unitário de Prompt
```typescript
const testCases = [
  {
    input: "Maria, 30, afiliada em transição",
    expectedContains: ["Maria", "afiliada"],
    expectedNotContains: ["revolucionário", "100%"],
    minJudgeScore: 0.7
  },
  // ... mais casos
];

for (const test of testCases) {
  const output = await runPrompt(test.input);
  expect(output).toContain(test.expectedContains);
  expect(output).not.toContain(test.expectedNotContains);
  expect(await judge(output)).toBeGreaterThan(test.minJudgeScore);
}
```

### Teste de Regressão
- Suite de 20-50 inputs reais
- Roda **a cada mudança** de prompt
- Falha = prompt regrediu

---

## 📊 Métricas de Qualidade de Prompt

| Métrica | Meta |
|---|---|
| Judge score médio | ≥ 0.80 |
| Taxa de formato correto | ≥ 95% |
| Taxa de violação de guardrail | < 2% |
| Latência | < 5s |
| Custo por chamada | < R$ 0.10 |
| Refinamentos por prompt | ≤ 3 (depois, refatore) |

---

## 📚 Biblioteca de Prompts

Prompts canônicos do Nexus vivem em:
- `Lab-Nexus/prompts/copywriting/`
- `Lab-Nexus/prompts/analise/`
- `Lab-Nexus/prompts/estrategia/`
- `backend/src/agentic/prompts/system/`
- `backend/src/agentic/prompts/user/`
- `backend/src/agentic/prompts/judge/`

---

## 🔗 Documentos Relacionados

- `01-error-handling.md` — o que fazer quando prompt falha
- `02-performance.md` — otimizar custo/latência
- `../agents-specs/00-base-agent.md` — onde prompt é executado
- `../agents-specs/02-judge-revisor.md` — quem avalia
- `../knowledge-base/02-taxonomia-skills.md` — skills

---

**Versão 1.0** · Atualizado 2026-06-02 · Mantido pela Equipe Nexus
