---
title: "Tool 03 · Orçamento Anual"
description: "Template estruturado para orçamento anual de SaaS/infoproduto/mentoria"
tags: [ferramenta, financas, orcamento, planejamento, anual]
categoria: financas
nivel: Master / Elite
autor: "Otto Cardoso (CFO/AI)"
date: 2026-07-14
---

# 📅 Tool 03 · Orçamento Anual

> Template completo para construir o orçamento anual de uma operação SaaS / infoproduto / mentoria de R$ 0 a R$ 5M ARR.

## 🎯 Quando usar

- Planejar orçamento para o próximo ano fiscal
- Apresentar para investidor / conselho
- Definir budget por departamento
- Alinhar expectativa de gasto time/C-Suite

## 📋 Inputs Necessários

```yaml
empresa: "Nome"
ano_fiscal: "2027"
receita_projetada: "R$ X total ou R$ Y MRR médio"
crescimento_desejado: "X% a.a."
margem_alvo: "Y%"
fase_empresa: "Pré-receita | Seed | Série A | Bootstrapped | Scale-up"
```

## 📋 Template Completo

### 1. RECEITA PROJETADA

#### Por Linha de Receita

| Linha | Jan | Fev | Mar | Abr | Mai | Jun | Jul | Ago | Set | Out | Nov | Dez | Total |
|-------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-------|
| **Assinaturas SaaS** | | | | | | | | | | | | | R$ X |
| **Info-produto** | | | | | | | | | | | | | R$ X |
| **Mentoria** | | | | | | | | | | | | | R$ X |
| **Licensing** | | | | | | | | | | | | | R$ X |
| **Serviços** | | | | | | | | | | | | | R$ X |
| **TOTAL** | | | | | | | | | | | | | **R$ X** |

#### Premissas (declarar todas!)

```
- Taxa de crescimento mensal: X% (com justification)
- Churn mensal esperado: X%
- Expansão esperada (upsell): R$ X/mês
- Lançamentos previstos: Q1 (X), Q2 (X), Q3 (X), Q4 (X)
- Sazonalidade: Black Friday +X%, Natal -Y%
```

### 2. CUSTOS OPERACIONAIS (OPEX)

#### 2.1 — Pessoas (Folha)

| Cargo | Qtd | Salário médio | Encargos (43%) | Benefícios | Total/funcionário | Total categoria |
|-------|-----|---------------|----------------|------------|-------------------|-----------------|
| CEO | 1 | R$ X | R$ Y | R$ Z | R$ W | R$ T |
| CTO | 1 | | | | | |
| Engenheiro Sênior | 3 | | | | | |
| Engenheiro Pleno | 5 | | | | | |
| Designer | 2 | | | | | |
| Marketing | 3 | | | | | |
| Vendas | 4 | | | | | |
| CS | 3 | | | | | |
| Operações | 2 | | | | | |
| **TOTAL FOLHA** | | | | | | **R$ X** |

**Custo total anual com 13º + férias + 1/3 constitucional:**
- Folha: R$ X
- 13º: R$ X/12 × 1
- Férias + 1/3: R$ X/12 × (1 + 1/3)
- FGTS: 8% sobre (folha + 13º + férias)
- Provisionar rescisão: 5% da folha (turnover histórico)

#### 2.2 — Ferramentas e SaaS

| Categoria | Ferramenta | Custo/mês | Justificativa |
|-----------|------------|-----------|---------------|
| **Hospedagem** | AWS/Vercel/Railway | R$ X | Tráfego e storage |
| **Banco de dados** | Postgres + Redis | R$ X | Multi-tenant |
| **Email transacional** | SendGrid/Postmark | R$ X | Volume |
| **WhatsApp API** | Meta Cloud API | R$ X | Mensagens |
| **Pagamentos** | Stripe + Asaas | % sobre receita | Taxa por transação |
| **CRM** | HubSpot/Pipedrive | R$ X | Vendas |
| **Analytics** | Mixpanel/PostHog | R$ X | Eventos |
| **Observability** | Sentry + Datadog | R$ X | Erros e métricas |
| **Comunicação** | Slack | R$ X | Time |
| **Produtividade** | Google Workspace | R$ X | Email + docs |
| **IA** | OpenAI + Anthropic | R$ X | Agentes |
| **Outros** | ... | R$ X | ... |
| **TOTAL** | | **R$ X/mês** | **R$ X/ano** |

#### 2.3 — Marketing & Vendas

| Linha | Mensal | Anual | Justificativa |
|-------|--------|-------|---------------|
| **Meta Ads** | R$ X | R$ X | Aquisição principal |
| **Google Ads** | R$ X | R$ X | Search intent |
| **TikTok Ads** | R$ X | R$ X | Awareness jovem |
| **LinkedIn Ads** | R$ X | R$ X | B2B |
| **SEO/Conteúdo** | R$ X | R$ X | Long-term |
| **Eventos** | R$ X | R$ X | Networking |
| **PR/Mídia** | R$ X | R$ X | Awareness |
| **Ferramentas de marketing** | R$ X | R$ X | Email, social, etc |
| **Agência (se houver)** | R$ X | R$ X | Outsourcing |
| **TOTAL** | **R$ X** | **R$ X** | |

**Regra de bolso:** CAC desejado × leads necessários = budget mensal

#### 2.4 — Operações

| Linha | Mensal | Anual |
|-------|--------|-------|
| Aluguel escritório | R$ X | R$ X |
| Energia + internet | R$ X | R$ X |
| Material de escritório | R$ X | R$ X |
| Viagens | R$ X | R$ X |
| Seguros (RC, D&O) | R$ X | R$ X |
| Contabilidade + jurídico | R$ X | R$ X |
| Impostos (além de folha) | R$ X | R$ X |
| Auditoria anual | R$ X | R$ X |
| Outros | R$ X | R$ X |
| **TOTAL** | **R$ X** | **R$ X** |

#### 2.5 — Custos de Venda (COGS)

| Linha | % da receita | Justificativa |
|-------|--------------|---------------|
| Processamento de pagamento | 3-5% | Stripe + Asaas |
| Royalties/afiliação | X% | Se marketplace |
| Custo de produto físico | R$ X | Se aplicável |
| Hospedagem por uso | R$ X | AWS variável |
| Suporte dedicado (CS) | R$ X | Para high-touch |
| **TOTAL** | **X% da receita** | |

### 3. INVESTIMENTOS (CAPEX)

| Item | Valor | Pago em | Justificativa |
|------|-------|---------|---------------|
| Reforma escritório | R$ X | Jan | Expansão |
| Equipamentos (laptops) | R$ X | Jan | Novos hires |
| Marca/Design | R$ X | Q1 | Refresh |
| Site novo | R$ X | Q2 | Conversão |
| Ferramenta custom | R$ X | Q3 | Diferenciação |
| M&A (se aplicável) | R$ X | Q4 | Escala |
| **TOTAL** | **R$ X** | | |

### 4. RESUMO EXECUTIVO

| Categoria | Mensal | Anual | % Receita |
|-----------|--------|-------|-----------|
| **RECEITA** | R$ X | **R$ Y** | 100% |
| (-) COGS | R$ X | R$ X | X% |
| **= Receita Bruta** | | | |
| (-) Folha | R$ X | R$ X | X% |
| (-) Ferramentas | R$ X | R$ X | X% |
| (-) Marketing | R$ X | R$ X | X% |
| (-) Operações | R$ X | R$ X | X% |
| **= EBITDA** | **R$ X** | **R$ X** | **X%** |
| (-) CAPEX | R$ X | R$ X | X% |
| (-) Impostos (lucro) | R$ X | R$ X | X% |
| **= LUCRO LÍQUIDO** | **R$ X** | **R$ X** | **X%** |

### 5. MÉTRICAS-CHAVE

| Métrica | Meta | Real (trimestral) |
|---------|------|-------------------|
| **CAC** | R$ X | |
| **LTV** | R$ X | |
| **LTV/CAC** | > 3× | |
| **Payback** | < 12 meses | |
| **Burn multiple** | < 2 | |
| **Runway** | > 18 meses | |
| **Headcount** | X pessoas | |
| **Receita/funcionário** | R$ X | |
| **Margem bruta** | > 70% | |
| **Margem EBITDA** | > 20% | |

### 6. CENÁRIOS

| | Conservador | Base | Otimista |
|---|-------------|------|----------|
| **Receita** | R$ X | R$ Y | R$ Z |
| **EBITDA** | R$ X | R$ Y | R$ Z |
| **Margem %** | X% | Y% | Z% |
| **Headcount** | N | N+2 | N+5 |
| **Investimento** | R$ X | R$ Y | R$ Z |

### 7. HITOS TRIMESTRAIS

#### Q1 (Jan-Mar)
- Receita: R$ X (meta)
- Marcos: [lançamento 1, hiring 1, etc]
- Risco principal: [risco 1]

#### Q2 (Abr-Jun)
- ...

#### Q3 (Jul-Set)
- ...

#### Q4 (Out-Dez)
- ...

### 8. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação | Custo mitigação |
|-------|---------------|---------|-----------|-----------------|
| 1 | | | | R$ X |
| 2 | | | | |

### 9. DECK EXECUTIVO (Resumo 1 página)

```
EMPRESA: Nome
ANO: 2027

RECEITA: R$ X (+Y% vs 2026)
EBITDA: R$ Z (margem W%)
HEADCOUNT: N pessoas (Δ+ΔN)
CAC: R$ X → R$ Y (-X%)
LTV/CAC: A× → B×

PRINCIPAIS INVESTIMENTOS:
- R$ X em marketing (crescer)
- R$ Y em produto (diferenciar)
- R$ Z em hiring (escalar time)

PRINCIPAIS RISCOS:
- Risco 1 (mitigação: ...)
- Risco 2 (mitigação: ...)

PRÓXIMO TRIMESTRE FOCO:
- Q1: [foco principal]
- Hiring: [X vagas]
- Lançamento: [produto Y]
```

## 📊 Acompanhamento

- **Mensal:** comparar real vs orçado (variação em R$ e %)
- **Trimestral:** revisar orçamento rolling (atualizar projeções)
- **Semestral:** re-orçar se desvio > 20%
- **Anual:** lessons learned → próximo orçamento

## 🎯 Regras de Ouro

1. **Orçamento é hipótese**, não promessa. Atualize 1x/mês.
2. **Conserve 10-15%** de buffer para imprevistos
3. **Marketing** deve ser % da receita, não valor fixo
4. **CAPEX** precisa de aprovação C-Suite
5. **Crescimento de headcount** = investimento, não despesa
6. **Margem bruta > 70%** é saudável; < 50% repensar modelo
7. **Runway > 18 meses** sempre (ou levantar capital)

## 🧮 Exemplo Real (Start SaaS Brasil)

```yaml
empresa: "Nexus Affil'IA'te"
ano: 2027
fase: "Scale-up pós-Product-Market Fit"

receita_2027: R$ 2.4M (R$ 200k MRR médio)
margem_alvo: 35% EBITDA
headcount: 25 → 32 pessoas

custos_principais:
  folha: R$ 1.4M (58% da receita)
  marketing: R$ 480k (20% — focado em escala)
  ferramentas: R$ 120k (5%)
  operações: R$ 80k (3%)

investimentos:
  capex: R$ 150k (marca, infra, equipamentos)

ebitda: R$ 720k (30% margem)
```

## 📚 Materiais Relacionados

- `tools/financas/01-business-case-template.md`
- `tools/financas/02-calculadora-payback.md`
- `playbooks/PB-FINANCEIRO-decisao-investimento.md`
- `webinars/WB-2026-08-financeiro-ia.md`
- `Lab-Nexus/prompts/analise/06-forecast-receita-trimestral.md`

---

*Lab-Nexus · Tool 03 · Finanças · 2026*