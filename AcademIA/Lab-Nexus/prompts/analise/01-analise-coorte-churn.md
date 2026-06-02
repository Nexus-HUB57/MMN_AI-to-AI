title: "Prompt — Análise de Coorte e Churn"
description: "Analisar tabela de coorte e identificar padrões de retenção/churn"
tags: [lab-nexus, prompt, analise, coorte, churn]
category: prompts/analise
level: master
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
📊 Prompt — Análise de Coorte e Churn
Prompt para análise profunda de coorte, com identificação de padrões e ações recomendadas.

🎯 Quando usar

Mensalmente para avaliar retenção

Ao diagnosticar queda na receita

Antes de decisões de produto/pricing

Em QBR (quarterly business review)

📋 Variáveis de Entrada
yaml

Copy
tabela_coorte: "Tabela CSV ou markdown com colunas: cohort_month, cohort_size, month_offset, retention_rate"

objetivo_negocio: "Aumentar retenção M3 | Reduzir churn | Aumentar LTV | Outro"

contexto_extra: "Mudanças recentes no produto, mercado, ações de marketing"
📦 Prompt Pronto
text

Copy
# PAPEL

Você é um analista de growth sênior com 10 anos de experiência em retenção

e churn analysis para SaaS e infoprodutos brasileiros.


# OBJETIVO

Analisar a tabela de coorte fornecida e entregar:

1. Sumário executivo (3 linhas)

2. Padrões identificados (3-5 padrões)

3. Top 3 coortes com melhor e pior performance

4. 3 hipóteses para os padrões

5. 5 ações priorizadas (com ICE score)

6. Previsão de LTV por coorte


# INPUTS

Tabela de coorte:

{{tabela_coorte}}


Objetivo de negócio: {{objetivo_negocio}}


Contexto adicional: {{contexto_extra}}


# ESTRUTURA DA ANÁLISE


## 1. Sumário Executivo

- 3 bullets, máximo 1 linha cada, linguagem executiva


## 2. Padrões Identificados

Para cada padrão:

- Descrição (1-2 frases)

- Evidência (dados que sustentam)

- Confiança (alta/média/baixa)


## 3. Coortes Notáveis

- Top 3: por que performam melhor?

- Bottom 3: o que aconteceu?


## 4. Hipóteses

- 3 hipóteses principais

- Como validar cada uma (teste sugerido)


## 5. Ações Recomendadas

Tabela com: Ação | Impacto (1-10) | Confiança (1-10) | Facilidade (1-10) | ICE Score


## 6. Previsão LTV

- LTV estimado M12 por coorte

- Premissas usadas


# REGRAS

- NUNCA invente dados

- SEMPRE indique confiança (alta/média/baixa)

- CITE o número exato ao fazer afirmação

- Se dados insuficientes, indique claramente

- LGPD: anonimizar IDs de usuário em qualquer menção


# FORMATO

Markdown estruturado, com tabelas quando relevante.


# GUARDRAIL

- Se coortes têm tamanhos < 100, alertar sobre baixa significância estatística

- Se houver NaN/null, indicar tratamento

- Não fazer recomendação financeira sem LTV/CAC
💡 Exemplo de Saída
Input:

csv

Copy
cohort,size,M0,M1,M2,M3,M4,M5,M6

2026-01,500,100%,65%,48%,41%,38%,36%,35%

2026-02,520,100%,68%,52%,44%,41%,39%,

2026-03,480,100%,72%,55%,48%,45%,

2026-04,510,100%,70%,53%,47%,

2026-05,550,100%,75%,58%,

2026-06,600,100%,78%,
Output esperado:

1. Sumário Executivo

Retenção M1 subiu de 65% (jan) para 78% (jun) — +13 p.p.

Retenção M3 estabilizada em 47-48% — saudável para o modelo

LTV M12 estimado em R$ 1.2k-1.5k por usuário (margem 70%)

2. Padrões
1.
Melhoria consistente mês a mês (alta confiança)
2.
Drop-off maior entre M0 e M1 (perda 25-30%) — foco de otimização
3.
Estabilização após M3 — produto atinge "fit" do público-alvo
3. Coortes Notáveis

Top: jun/26 (M1=78%) — provavelmente novo onboarding

Bottom: jan/26 (M1=65%) — período sem otimização

4. Hipóteses
1.
Onboarding melhorado (lançado fev/26) causou +13 p.p. no M1
2.
Público mais qualificado (ads otimizados) explica +5 p.p. adicional
3.
Estabilização em 35-40% M6 é o limite do modelo (saturação)
5. Ações (ICE)
Ação	I	C	F	ICE
Reduzir drop M0→M1 com tutoria 1:1	9	8	5	360
Programa de reativação M2→M3	7	7	7	343
Pesquisa qualitativa com churned M1	8	9	9	648
6. LTV Preditivo

M12 (coorte jun): R$ 1.350 (baseado em 78% M1 e 35% M6 observado)

Premissa: ARPU R$ 97, margem 70%, churn 5%/mês após M6

📊 Métricas de Sucesso
Métrica	Meta
Retenção M1	≥ 50%
Retenção M3	≥ 30%
Retenção M6	≥ 20%
LTV/CAC	≥ 3
Análise feita/mês	1
⚠️ Erros Comuns

❌ Tratar coortes com tamanhos diferentes como comparáveis

❌ Concluir com base em 1-2 coortes

❌ Ignorar sazonalidade

❌ Não anonimizar dados (LGPD)

❌ Recomendar ações sem ICE score

🔗 Próximos Prompts

→ 02-analise-funil-conversao.md — funil completo

→ 03-analise-atribuicao.md — atribuição multi-touch

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus