---
title: "Tool 04 · Fluxo de Caixa Projetado"
description: "Planilha de projeção de fluxo de caixa 13 semanas rolling"
tags: [ferramenta, financas, fluxo-caixa, cashflow, runway, projecao, 13-semanas]
categoria: financas
nivel: Master / Elite
autor: "Otto Cardoso (CFO/AI)"
date: 2026-07-14
---

# 💰 Tool 04 · Fluxo de Caixa Projetado

> Planilha para projetar **fluxo de caixa das próximas 13 semanas** com atualização rolling. Detecta gaps de caixa antes de virarem crise.

## 🎯 Quando usar

- Para qualquer empresa com **runway < 24 meses** (sempre)
- Antes de tomar decisão de hiring / investimento
- Quando pensa em levantar capital
- Trimestralmente para C-Suite

## 📋 Conceito

O **fluxo de caixa de 13 semanas** é o padrão de mercado para gestão de caixa em startups. Funciona assim:
- Cada semana, atualiza a planilha com dados reais
- Move a janela 1 semana pra frente
- Sempre olha 13 semanas à frente
- Detecta gaps 3 meses antes

## 📋 Template Completo

### 1. SALDO INICIAL

| Item | Valor |
|------|-------|
| **Saldo em caixa (hoje)** | R$ X |
| **Aplicações financeiras** | R$ Y |
| **A receber (próx 30d)** | R$ Z |
| **A pagar (próx 30d)** | R$ W |
| **Saldo líquido disponível** | **R$ V** |

### 2. ENTRADAS (semana a semana)

| Linha | S+1 | S+2 | S+3 | S+4 | S+5 | S+6 | S+7 | S+8 | S+9 | S+10 | S+11 | S+12 | S+13 | Total |
|-------|-----|-----|-----|-----|-----|-----|-----|-----|-----|------|------|------|------|-------|
| **Assinaturas recorrentes** | | | | | | | | | | | | | | R$ X |
| **One-time (info/mentoria)** | | | | | | | | | | | | | | R$ X |
| **Reembolso / ajuste** | | | | | | | | | | | | | | R$ X |
| **Outros (licensing, etc)** | | | | | | | | | | | | | | R$ X |
| **TOTAL ENTRADAS** | | | | | | | | | | | | | | **R$ X** |

#### Premissas

```
- Receita recorrente: MRR atual ÷ 4.33 (semanas no mês)
- Sazonalidade: ajustar se Black Friday / Natal
- Cobranças atrasadas: assumir 80% recebe no prazo, 20% com delay 7-14d
- Cancelamentos: aplicar churn esperado
- Lançamentos: incluir receita projetada se aplicável
```

### 3. SAÍDAS (semana a semana)

| Linha | S+1 | S+2 | S+3 | S+4 | S+5 | S+6 | S+7 | S+8 | S+9 | S+10 | S+11 | S+12 | S+13 | Total |
|-------|-----|-----|-----|-----|-----|-----|-----|-----|-----|------|------|------|------|-------|
| **Folha (salários)** | | | | | | | | | | | | | | R$ X |
| **Encargos + benefícios** | | | | | | | | | | | | | | R$ X |
| **Fornecedores** | | | | | | | | | | | | | | R$ X |
| **Marketing (ads)** | | | | | | | | | | | | | | R$ X |
| **SaaS / ferramentas** | | | | | | | | | | | | | | R$ X |
| **Impostos** | | | | | | | | | | | | | | R$ X |
| **Aluguel + ops** | | | | | | | | | | | | | | R$ X |
| **Reembolso / chargeback** | | | | | | | | | | | | | | R$ X |
| **Investimentos (CAPEX)** | | | | | | | | | | | | | | R$ X |
| **Outros** | | | | | | | | | | | | | | R$ X |
| **TOTAL SAÍDAS** | | | | | | | | | | | | | | **R$ X** |

#### Premissas

```
- Folha: salários ÷ 4.33; encargos mensais concentrados no dia 7
- Marketing: pode variar muito (campanhas); ser conservador
- SaaS: anual → ÷ 52; mensal → ÷ 4.33
- Impostos: dia 20 (INSS), dia 25 (ISS), último dia útil (federais)
- CAPEX: incluir pagamentos únicos já aprovados
- Buffer: +10% em cada linha para imprevistos
```

### 4. FLUXO LÍQUIDO (Saldo Acumulado)

| Semana | Entradas | Saídas | Líquido | Saldo Acumulado | Runway (semanas) |
|--------|----------|--------|---------|-----------------|------------------|
| **S+0** | - | - | - | R$ X | 52 |
| **S+1** | | | | | |
| **S+2** | | | | | |
| ... | | | | | |
| **S+13** | | | | | |

**Fórmula de Runway:**
```
Runway (semanas) = Saldo Atual ÷ Saída Líquida Semanal Média
```

### 5. DETECÇÃO DE GAPS

**Se saldo acumulado em qualquer semana ficar negativo:**

```
⚠️ ALERTA VERMELHO: Saldo negativo na semana S+X
   Gap: R$ Y
   Causa provável: [folha + sazonalidade / capex inesperado / etc]
   Ação: [antecipar receita / atrasar pagamento / levantar crédito]
```

### 6. MÉTRICAS DERIVADAS

| Métrica | Valor | Status |
|---------|-------|--------|
| **Saldo mínimo em 13 sem** | R$ X | 🟢 / 🟡 / 🔴 |
| **Maior queda semanal** | R$ X na S+Y | |
| **Semana mais crítica** | S+Z | |
| **Burn médio semanal** | R$ X | |
| **Burn vs receita** | R$ Y | Receita cobriu? |
| **Semanas até zerar** | N | |

### 7. AÇÕES PROATIVAS

Se runway < 26 semanas (6 meses):

```
□ Acelerar cobranças (lembrete, desconto pontualidade)
□ Adiar pagamentos não-críticos
□ Cortar CAPEX adiado
□ Conversar com cliente sobre pré-pagamento (desconto)
□ Ativar linha de crédito (ter pré-aprovada)
□ Conversar com investidor (bridge round se aplicável)
□ Acelerar rodada de captação
□ Reduzir hiring adiado
□ Renegociar aluguel / contratos longos
```

## 📋 Exemplo Real

```yaml
empresa: "Nexus Affil'IA'te"
saldo_inicial: R$ 1.2M
mrr_atual: R$ 87k
churn_mensal: 3.8%
runway_atual: 11 meses

entradas_semana_media: R$ 22k
saidas_semana_media: R$ 35k
queimando: R$ 13k/semana

mês_1: saldo cai para R$ 1.07M
mês_2: R$ 0.95M
mês_3: R$ 0.83M
mês_4: R$ 0.71M
mês_5: R$ 0.59M
mês_6: R$ 0.47M

runway: ~36 semanas (8 meses)
ação: começar captação em 60 dias (antes de chegar a 26 semanas)
```

## 📋 Quando o Saldo Vai Negativo

**Cenário A: Negativo em < 4 semanas (emergência)**
- 🔴 CRÍTICO
- Ações imediatas (24-48h):
  - Cortar tudo que não é folha
  - Ativar linha de crédito
  - Ligar para 5 maiores clientes: "tem como adiantar?"
  - Conversar com founder/acionista sobre bridge

**Cenário B: Negativo em 4-12 semanas (atenção)**
- 🟡 ATENÇÃO
- Ações em 1-2 semanas:
  - Rever orçamento mensal
  - Cortar CAPEX não-essencial
  - Conversar com investidor sobre timing de rodada
  - Considerar hiring freeze

**Cenário C: Negativo em > 12 semanas (preventivo)**
- 🟢 PREVENTIVO
- Ações em 30-60 dias:
  - Continuar atualização rolling
  - Verificar se receita está crescendo conforme plano
  - Considerar captação preventiva (sempre mais fácil com runway)

## 📋 Atualização Rolling

**Toda semana (sexta-feira 17h):**
1. Pegar real da semana que passou
2. Inserir nas colunas reais
3. Mover projeção 1 semana à frente
4. Recalcular runway
5. Comunicar status à C-Suite (Slack #finanças)
6. Se runway < 26 semanas: alerta automático

## 📋 Ferramentas para Implementar

| Ferramenta | Tipo | Prós | Contras |
|-----------|------|------|---------|
| **Google Sheets** | Manual | Grátis, customizável | Pode errar |
| **Notion + fórmulas** | Manual | Visual | Lento |
| **Float / Cashflow** | SaaS | Automático | Pago (USD 50/mês) |
| **Fintastic** | SaaS BR | BR-friendly | Beta |
| **Planilha + automação** | Custom | Full control | Manutenção |

**Recomendação:** Google Sheets para < R$ 500k caixa. SaaS para > R$ 1M.

## 📋 Integração com Decisões

Toda decisão > R$ 50k deve consultar essa planilha:
- Contratar pessoa? → Se runway cair < 26 sem, esperar
- CAPEX grande? → Avaliar impacto em S+10 a S+13
- Antecipar receita? → Comparar com desconto oferecido
- Levantar capital? → Antes de chegar a 26 sem

## 📋 Compartilhamento

- **Quem vê:** CEO/AI, CFO/AI, Sócio humano
- **Frequência atualização:** Semanal (toda sexta)
- **Alerta:** se runway < 26 sem → Slack #csuite imediato
- **Formato:** link editável + screenshot da semana atual em dashboard

## 📚 Materiais Relacionados

- `tools/financas/01-business-case-template.md`
- `tools/financas/02-calculadora-payback.md`
- `tools/financas/03-orcamento-anual.md`
- `playbooks/PB-FINANCEIRO-decisao-investimento.md`
- `webinars/WB-2026-08-financeiro-ia.md`
- `Lab-Nexus/prompts/analise/06-forecast-receita-trimestral.md`

---

*Lab-Nexus · Tool 04 · Finanças · 2026*