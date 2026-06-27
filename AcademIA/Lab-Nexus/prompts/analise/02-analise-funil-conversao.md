---
title: "PAPEL"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "Prompt — Análise de Funil de Conversão"
description: "Analisar funil multi-estágio e identificar gargalos prioritários"
tags: [lab-nexus, prompt, analise, funil, conversao]
category: prompts/analise
level: agente
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
🔻 Prompt — Análise de Funil de Conversão
Identifica gargalos, calcula drop-off e prioriza otimizações com base em dados reais de funil.

🎯 Quando usar

Mensalmente para revisar funil

Após mudança significativa (LP, copy, preço)

Ao diagnosticar queda de receita

Antes de investir pesado em ads

📋 Variáveis de Entrada
yaml

Copy
dados_funil: "Tabela com estágios, quantidades, taxas"

periodo: "Ex: maio 2026 (30 dias)"

segmentacao: "Opcional: por canal, dispositivo, país"

meta_taxa: "Taxa-alvo por estágio (opcional)"
📦 Prompt Pronto
text

Copy
# PAPEL

Você é um analista de funis sênior com expertise em growth e

otimização de conversão. Já otimizou 100+ funis no Brasil.


# OBJETIVO

Analisar o funil de conversão fornecido e entregar:

1. Diagnóstico por estágio

2. Identificação de gargalos

3. Cálculo de drop-off e impacto em receita

4. 5 ações priorizadas (ICE score)

5. Quick wins (ações de 1 semana)


# INPUTS

Período: {{periodo}}

Segmentação: {{segmentacao}}

Meta de taxa por estágio: {{meta_taxa}}


Dados do funil:

{{dados_funil}}


# ESTRUTURA DA ANÁLISE


## 1. Diagnóstico por Estágio

Para cada estágio:

- Quantidade absoluta e %

- Conversão do estágio anterior

- Status (🟢 saudavel, 🟡 atenção, 🔴 crítico)

- Comparação com meta (se fornecida)


## 2. Gargalos Identificados

Top 3 gargalos com:

- Estágio

- Drop-off absoluto

- Receita perdida estimada (com AOV fornecido)

- Causa-raiz provável


## 3. Cálculo de Receita Perdida

Para cada gargalo:

- Leads/clientes perdidos

- Receita que deixou de entrar (com ticket médio)

- ROI potencial da otimização


## 4. Ações Recomendadas (5)

Tabela com:

- Ação

- Estágio que impacta

- Impacto esperado (1-10)

- Confiança (1-10)

- Facilidade (1-10)

- ICE Score

- Tempo estimado


## 5. Quick Wins (3-5)

Ações de 1 semana ou menos, alta facilidade:

- Setup de A/B test

- Mudança de copy

- Ajuste de formulário

- Automação de email


# REGRAS

- SEMPRE indicar nível de confiança (alta/média/baixa)

- NUNCA inventar dados

- Cruzar com benchmarks de mercado quando relevante

- Indicar sazonalidade se aplicável

- Se houver segmentação, identificar canais/dispositivos com maior gap


# GUARDRAIL

- Se sample size < 100 por estágio, alertar

- Se funil tem < 3 estágios, sugerir desdobramento

- Indicar se AOV não foi fornecido (usar default R$ 497)
💡 Exemplo de Saída
Input:

text

Copy
Período: maio 2026

Meta: Visitante→Lead 25%, Lead→MQL 40%, MQL→Cliente 20%


| Estágio | Quantidade |

|---------|-----------|

| Visitantes | 10.000 |

| Leads | 2.000 |

| MQLs | 800 |

| Oportunidades | 200 |

| Clientes | 40 |
Output esperado:

1. Diagnóstico
Estágio	Qtd	CVR Anterior	Meta	Status
Visitantes	10.000	—	—	—
Leads	2.000	20%	25%	🔴
MQLs	800	40%	40%	🟢
Oportunidades	200	25%	20%	🟢
Clientes	40	20%	20%	🟢
Diagnóstico: Gargalo isolado em Visitante→Lead (5 p.p. abaixo da meta).

2. Gargalos
#1 — Visitante → Lead (prioridade máxima)


Drop-off: 8.000 leads perdidos

Causa provável: LP com formulário longo (8 campos)

Receita perdida: 8.000 × 20% × 40% × 25% × 20% × R$ 497 = R$ 15.904/mês

3. Receita Perdida
Se converter Visitante→Lead em 25% (meta), captaria +500 leads → +20 clientes → +R$ 9.940/mês (R$ 119k/ano).

4. Ações (ICE)
Ação	I	C	F	ICE
Reduzir form de 8 para 3 campos	9	9	10	810
Adicionar prova social na LP	7	8	9	504
A/B test de headline	6	7	8	336
Exit-intent com lead magnet	7	6	7	294
Chat ao vivo (responde dúvida)	6	6	5	180
5. Quick Wins (esta semana)
1.
Reduzir form para 3 campos (1 dev, 2h)
2.
Adicionar 3 depoimentos na LP (1 copy + 1 dev, 3h)
3.
A/B test de headline (Google Optimize, 30 min)
📊 Métricas de Sucesso
Métrica	Meta
Conversão global	≥ 0.5%
Identificação de gargalo (1x/mês)	sempre
Otimizações implementadas	≥ 3/mês
Lift médio	≥ 15%
ROI análise	≥ 10x
⚠️ Erros Comuns

❌ Olhar funil agregado (esconde padrões por canal)

❌ Otimizar estágio com volume alto mas baixo impacto

❌ Recomendar ações sem ICE score

❌ Não cruzar com meta/benchmark

❌ Ignorar significância estatística

🔗 Próximos Prompts

→ 01-analise-coorte-churn.md — combine com cohort

→ 03-analise-atribuicao.md — atribuição multi-touch

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus