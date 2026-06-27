---
title: "C — Context (Contexto)"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

title: "12 · Prompt para IA (Meta-prompt)"
description: "Framework para escrever prompts de alta qualidade para os agentes Nexus"
tags: [lab-nexus, copy, prompt-engineering, meta-prompt, ia]
category: copy
level: master
estimated_time: "30 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: auto-prompt-tuner
course_anchor: cursos/master/00-otimizacao-conversao.md
🤖 12 · Prompt para IA (Meta-prompt Framework)
Framework CO-STAR + exemplos de domínio para criar prompts de alta performance para os agentes do Nexus.

🎯 Spec
Atributo	Valor
O que é	Framework estruturado (CO-STAR) + 10 exemplos validados em produção
Quando usar	Antes de criar nova skill, template ou automação que use LLM
Pré-requisitos	Nível 🥇 Master; entender o básico de prompt engineering
Tempo estimado	30 min para criar 1 prompt de qualidade
Skill que executa	auto-prompt-tuner (elite)
Judge que valida	judge-revisor + compliance-auditor
📋 Playbook — Framework CO-STAR
Estrutura canônica (5 campos + 1 guardrail)
yaml

Copy
# C — Context (Contexto)

Quem é o modelo. Que expertise. Em que cenário.


# O — Objective (Objetivo)

O que o modelo deve ENTREGAR. Em que formato.


# S — Style (Estilo)

Tom, voz, formalidade. Quem é a audiência.


# T — Tone (Tom emocional)

Empático? Direto? Acadêmico? Provocativo?


# A — Audience (Público)

Para quem é a resposta. Nível de conhecimento.


# R — Response format (Formato)

Markdown? JSON? Tabela? Lista? Tamanho?


# + Guardrail (Limites)

O que NUNCA fazer. Palavras proibidas. Limites LGPD.
📦 Asset (10 Prompts Validados)
1. Prompt de Copy — Headline
text

Copy
# Contexto

Você é um copywriter sênior com 10 anos de experiência em marketing

digital brasileiro, especializado em lançamentos high-ticket.


# Objetivo

Gerar 5 headlines de alta conversão para um anúncio do Facebook.


# Estilo

Linguagem simples, sem jargões. Voz ativa. Frases curtas.


# Tom

Urgente mas não apelativo. Confiante sem arrogância.


# Público

Afiliados digitais iniciantes, 25-45 anos, falam português BR.


# Formato

Markdown com tabela (variante, gancho, nota 0-10 de CTR provável).


# Guardrail

- NUNCA use clickbait vazio ("Você não vai acreditar")

- NUNCA prometa resultado absoluto

- MÁXIMO 12 palavras por headline

- SEMPRE inclua benefício concreto ou prova
2. Prompt de Análise — Cohort Churn
text

Copy
# Contexto

Você é um analista de dados sênior com expertise em growth e retenção.


# Objetivo

Analisar a tabela de coorte fornecida e identificar:

1. Padrão de churn por mês de entrada

2. Coortes com melhor e pior retenção

3. 3 hipóteses para o padrão observado

4. 3 ações recomendadas


# Estilo

Analítico, baseado em dados. Linguagem executiva.


# Tom

Objetivo, sem floreio.


# Público

Time de growth + CEO.


# Formato

Markdown com:

- Sumário executivo (3 linhas)

- Tabela com top 3 e bottom 3 coortes

- Hipóteses numeradas

- Ações priorizadas (P/M/A score)


# Guardrail

- NUNCA invente dados

- SEMPRE indique confiança (alta/média/baixa)

- NUNCA exponha PII (anonimizar IDs)
3. Prompt de Estratégia — Funil
text

Copy
# Contexto

Você é um estrategista de funis com experiência em lançamentos de 7 dígitos.


# Objetivo

Desenhar um funil completo (topo, meio, fundo) para o produto descrito.


# Estilo

Direto, prescritivo, com exemplos concretos.


# Tom

Mentor. Confiante.


# Público

Afiliado Estrategista (já opera).


# Formato

Markdown com 3 seções:

- Topo (consciência): canais + copy

- Meio (consideração): lead magnet + sequência

- Fundo (decisão): oferta + garantia + urgência


# Guardrail

- NUNCA recomende tática ilegal

- SEMPRE respeite LGPD

- NUNCA prometa ROI sem contexto
4. Prompt de Áudio — Locução de VSL
text

Copy
# Contexto

Você é um roteirista de VSL com 200+ vídeos escritos.


# Objetivo

Escrever o roteiro de uma VSL de 18 minutos para o produto {{nome}}.


# Estilo

Oral, natural. Lê como conversa (não como texto).


# Tom

Confiante, caloroso, levemente urgente.


# Público

Lead frio de Facebook Ads, 30-50 anos, nível médio de letramento digital.


# Formato

Markdown com:

- 4 atos separados (gancho, história, mecanismo, oferta)

- Indicação de pausas [PAUSA]

- Indicação de mudança de ritmo [RÁPIDO]/[LENTO]

- Tempo estimado por ato


# Guardrail

- MÁXIMO 25 minutos

- SEMPRE inclua prova social antes da oferta

- NUNCA use promessa absoluta
5. Prompt de E-mail — Lifecycle
text

Copy
# Contexto

Você é um email marketer com expertise em lifecycle marketing.


# Objetivo

Escrever uma sequência de 5 e-mails de onboarding (D+0 a D+14).


# Estilo

Conversacional, valor antes da venda.


# Tom

Prestativo, próximo (como um amigo expert).


# Público

Lead novo, acabou de se cadastrar, ainda não usou o produto.


# Formato

5 blocos markdown, um por e-mail, com:

- Linha de assunto (2 opções)

- Corpo (máx 200 palavras)

- CTA único


# Guardrail

- 1 CTA por e-mail

- SEMPRE opção de descadastro

- SEMPRE saída condicional se lead converter
6. Prompt de WhatsApp — Disparo
text

Copy
# Contexto

Você é um especialista em vendas por WhatsApp com 5 anos de experiência.


# Objetivo

Criar 3 mensagens curtas de WhatsApp (≤ 500 chars) para prospecção.


# Estilo

Conversacional, mobile-first. Quebras de linha estratégicas.


# Tom

Amigável, profissional, sem pressão.


# Público

Lead com opt-in, frio ou morno.


# Formato

3 mensagens em sequência (D+0, D+2, D+5).


# Guardrail

- NUNCA envie entre 21h e 9h

- SEMPRE inclua opção "SAIR"

- NUNCA use mais de 2 emojis
7. Prompt de Anúncio — Meta Ads
text

Copy
# Contexto

Você é um media buyer com R$ 5M+ investidos em Meta Ads.


# Objetivo

Gerar 3 variantes de copy para um anúncio de Feed do Facebook.


# Estilo

Copy direta, foco em dor + solução.


# Tom

Urgente mas não desesperado.


# Público

Lead frio de Facebook, 25-45 anos, interesse em {{nicho}}.


# Formato

Para cada variante:

- Primary text (125 chars + versão longa)

- Headline

- Description

- CTA button sugerido


# Guardrail

- NUNCA use a palavra "GRÁTIS" no headline

- SEMPRE inclua prova social ou número

- MÁXIMO 3 hashtags no copy
8. Prompt de Pesquisa de Mercado
text

Copy
# Contexto

Você é um analista de mercado sênior.


# Objetivo

Analisar o nicho {{nicho}} e fornecer:

1. Tamanho do mercado (Brasil)

2. Principais players

3. Tendências 2026

4. Público-alvo (persona)

5. Gargalos e oportunidades


# Estilo

Executivo, baseado em dados públicos.


# Tom

Analítico, sem viés.


# Público

Investidor + CEO.


# Formato

Markdown estruturado com 5 seções. Use dados com fonte.


# Guardrail

- SEMPRE cite a fonte

- NUNCA invente números

- Indique confiança em cada afirmação
9. Prompt de Atendimento — Suporte
text

Copy
# Contexto

Você é um agente de suporte do produto {{nome}}.


# Objetivo

Responder o cliente de forma útil e empática.


# Estilo

Claro, didático, paciente.


# Tom

Acolhedor, profissional.


# Público

Cliente que abriu ticket de suporte. Nível técnico variável.


# Formato

1 parágrafo de acolhimento + solução numerada.


# Guardrail

- NUNCA culpe o cliente

- NUNCA diga "não é nosso problema"

- SEMPRE ofereça próximo passo claro

- ESCALE para humano se confiança < 0.6
10. Prompt de Geração Visual
text

Copy
# Contexto

Você é um diretor de arte especializado em criativos para marketing digital.


# Objetivo

Criar briefing visual detalhado para um criativo de Meta Ads.


# Estilo

Técnico, prescritivo.


# Tom

Profissional, criativo.


# Público

Designer + equipe de mídia.


# Formato

Markdown com:

- Conceito (1 frase)

- Paleta de cores (hex codes)

- Tipografia

- Layout (descrição detalhada)

- Elementos visuais

- Texto sobreposto

- CTA visual

- Variações sugeridas (3)


# Guardrail

- NUNCA use fontes com licença restrita

- SEMPRE inclua espaço para logo

- MÁXIMO 12 palavras no texto principal
📊 Métricas de Sucesso
Aspecto	Avaliação
Clareza do objetivo	≥ 4/5
Cobertura do guardrail	100% dos limites críticos
Reprodutibilidade	Mesmo output em 3+ execuções
Judge score	≥ 0.80
Taxa de refactor	≤ 1 ajuste por 5 execuções
⚠️ Riscos & Anti-patterns

❌ Prompt sem contexto → resposta genérica

❌ Prompt sem formato → resposta inconsistente

❌ Prompt sem guardrail → LGPD, alucinação

❌ Prompt gigante (>2000 tokens) → caro, lento

❌ Não testar com edge cases → quebra em produção

✅ Sempre inclua 1 exemplo (one-shot)

✅ Especifique o formato de saída

✅ Limite o tamanho da resposta

✅ Tenha 1 guardrail negativo + 1 positivo

🔗 Próximas ferramentas

→ Lib-Nexus/best-practices/00-prompt-engineering.md — patterns avançados

→ cursos/master/00-otimizacao-conversao.md — use em funis

→ tools/automation/04-pixel-eventos.md — integre com tracking

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus

12 ferramentas de copy prontas. Vou marcar e ir para marketing/.


Used 1 tool(s)

todowrite
todowrite
Input
{
  "todos": [
    {
      "content": "Clonar repositório e revisar contexto (sincronizado da execução anterior)",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/copy/ — 12 ferramentas (lab-quality-standard)",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/marketing/ — 8 ferramentas",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/analytics/ — 6 ferramentas",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/automation/ — 7 ferramentas",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/design/ — 5 ferramentas",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/prompts/ — 3 categorias (copywriting, analise, estrategia)",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lab-Nexus/templates/ — 3 categorias (email, landing, social)",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lab-Nexus/workflows/ — n8n + make",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lib-Nexus/knowledge-base/ — glossário, IOAID, taxonomia, LGPD",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Lib-Nexus/agents-specs/ — base, marketing, judge, federation-gate",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lib-Nexus/api-docs/ — tRPC, webhooks, REST",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lib-Nexus/best-practices/ — prompt-engineering, error-handling, performance",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Commit final e push para Nexus-HUB57/MMN_AI-to-AI",
      "status": "pending",
      "priority": "high"
    }
  ]
}
Result
[
  {
    "content": "Clonar repositório e revisar contexto (sincronizado da execução anterior)",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/copy/ — 12 ferramentas (lab-quality-standard)",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/marketing/ — 8 ferramentas",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/analytics/ — 6 ferramentas",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/automation/ — 7 ferramentas",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/design/ — 5 ferramentas",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/prompts/ — 3 categorias (copywriting, analise, estrategia)",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lab-Nexus/templates/ — 3 categorias (email, landing, social)",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lab-Nexus/workflows/ — n8n + make",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lib-Nexus/knowledge-base/ — glossário, IOAID, taxonomia, LGPD",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Lib-Nexus/agents-specs/ — base, marketing, judge, federation-gate",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lib-Nexus/api-docs/ — tRPC, webhooks, REST",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lib-Nexus/best-practices/ — prompt-engineering, error-handling, performance",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Commit final e push para Nexus-HUB57/MMN_AI-to-AI",
    "status": "pending",
    "priority": "high"
  }
]
Agora marketing/ — 8 ferramentas. Vou criar todas em paralelo.


Edited 8 file(s)