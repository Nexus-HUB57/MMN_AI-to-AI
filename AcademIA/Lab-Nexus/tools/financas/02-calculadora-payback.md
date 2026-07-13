---
title: "Tool 02 · Calculadora de Payback"
description: "Calculadora interativa para payback, ROI, LTV/CAC, IRR em investimentos"
tags: [ferramenta, financas, payback, roi, irr, ltv, cac, calculadora]
categoria: financas
nivel: Master
autor: "Otto Cardoso (CFO/AI)"
date: 2026-07-07
---

# 🧮 Tool 02 · Calculadora de Payback

> Calculadora rápida para avaliar viabilidade financeira de investimento.

## 📋 Inputs

```yaml
investimento_inicial: "R$ X"
custo_mensal_recorrente: "R$ Y/mês"
receita_mensal_adicional: "R$ Z/mês a partir do mês W"
margem_bruta: "X% (default 70%)"
horizonte_meses: "12-24"
```

## 📋 Cálculos (pseudocódigo)

```python
def calcular_payback(investimento, custo_mensal, receita_mensal,
                     margem, meses=12):
    """
    Calcula payback, ROI e IRR para investimento
    """
    receita_liquida = receita_mensal * margem
    custo_total_mensal = custo_mensal
    beneficio_mensal_liquido = receita_liquida - custo_total_mensal

    # Custo total em horizonte
    custo_total = investimento + (custo_mensal * meses)

    # Benefício total em horizonte
    beneficio_total = receita_liquida * meses

    # ROI
    roi = ((beneficio_total - custo_total) / custo_total) * 100

    # Payback (meses para recuperar investimento total)
    if beneficio_mensal_liquido > 0:
        payback = custo_total / beneficio_mensal_liquido
    else:
        payback = float('inf')  # Nunca recupera

    # IRR (Taxa Interna de Retorno) - simplificada
    # Assumindo benefício constante mensal
    npv = 0
    for t in range(1, meses + 1):
        npv += beneficio_mensal_liquido / ((1 + 0.01) ** t)
    npv -= investimento
    irr_mensal = npv / custo_total if custo_total > 0 else 0

    return {
        'roi_percent': round(roi, 1),
        'payback_meses': round(payback, 1),
        'irr_anual_estimado': round(irr_mensal * 12 * 100, 1),
        'beneficio_total': beneficio_total,
        'custo_total': custo_total,
    }
```

## 📋 Tabela Rápida (Para Consulta)

### ROI 12 meses (custo mensal R$ 8k = R$ 96k/ano)

| Receita adicional líquida/mês | Payback | ROI 12m |
|---|---|---|
| R$ 2k | 48 meses (não recupera) | -75% |
| R$ 5k | 19 meses | -38% |
| R$ 8k | 12 meses | 0% (empate) |
| R$ 10k | 9.6 meses | +25% |
| R$ 15k | 6.4 meses | +88% |
| R$ 20k | 4.8 meses | +150% |
| R$ 30k | 3.2 meses | +275% |
| R$ 50k | 1.9 meses | +525% |

**Lição:** receita mensal precisa ser pelo menos 1× o custo mensal para payback em 12 meses.

### ROI 12 meses (investimento único R$ 50k)

| Receita adicional líquida/mês | Payback | ROI 12m |
|---|---|---|
| R$ 1k | 50 meses | -76% |
| R$ 3k | 17 meses | -28% |
| R$ 5k | 10 meses | +20% |
| R$ 8k | 6.3 meses | +92% |
| R$ 10k | 5 meses | +140% |
| R$ 20k | 2.5 meses | +380% |
| R$ 50k | 1 mês | +1100% |

**Lição:** investimento único (sem recorrente) tem payback mais rápido.

### LTV/CAC Ratio

| Ratio | Interpretação | Ação |
|---|---|---|
| < 1 | Queimando dinheiro | Parar aquisição |
| 1-3 | Marginal | Otimizar antes de escalar |
| 3-5 | Saudável | Escalar |
| > 5 | Excelente | Escalar agressivamente |

### Churn Impact (MRR perdido em 12 meses)

| Churn mensal | MRR restante em 12m | Receita perdida |
|---|---|---|
| 2% | 78.5% | 21.5% |
| 3% | 69.5% | 30.5% |
| 5% | 54.0% | 46.0% |
| 8% | 37.0% | 63.0% |
| 10% | 28.0% | 72.0% |

**Lição:** churn de 10%/mês destrói 72% da receita em 1 ano. Crítico!

## 📋 Cenários Prontos

### Cenário 1: Contratar Vendedor (R$ 8k/mês)

```
Inputs:
- Custo mensal: R$ 8.000
- Receita esperada por vendedor: R$ 25.000/mês (após ramp-up de 3 meses)
- Margem: 70%
- Receita líquida: R$ 17.500/mês

Outputs:
- Benefício líquido mensal: R$ 17.500 - R$ 8.000 = R$ 9.500
- ROI 12m: R$ 114.000 / R$ 96.000 = +118%
- Payback: 10.1 meses
- IRR estimado: ~80% a.a.

✅ APROVAR (com plano de ramp-up claro)
```

### Cenário 2: Campanha Marketing (R$ 50k único)

```
Inputs:
- Investimento: R$ 50.000 (uma vez)
- Receita esperada: R$ 200.000 (em 60 dias)
- Margem: 80%
- Receita líquida: R$ 160.000

Outputs:
- ROI: 220%
- Payback: 19 dias (já que é uma vez)
- ROAS (Return on Ad Spend): 4×

✅ APROVAR SEM CONDIÇÃO
```

### Cenário 3: Ferramenta SaaS (R$ 2k/mês)

```
Inputs:
- Custo mensal: R$ 2.000
- Economia esperada: 10h/semana de trabalho manual
- Valor da hora: R$ 100 (dev sênior)
- Economia mensal: R$ 4.000 (10h × 4 semanas × R$ 100)

Outputs:
- Benefício líquido: R$ 4.000 - R$ 2.000 = R$ 2.000
- ROI 12m: R$ 24.000 / R$ 24.000 = 0% (empate, +intangíveis)
- Payback: 12 meses

⚠️ APROVAR SE: incluir benefícios intangíveis (ex: melhor UX dev)
ou SE: a economia estimada for maior que 10h/semana
```

### Cenário 4: Expansão Internacional (R$ 230k ano 1)

```
Inputs:
- Setup: R$ 50.000 (uma vez)
- Custo mensal: R$ 15.000
- Receita esperada mês 6+: R$ 50.000/mês
- Margem: 70%
- Receita líquida mês 6+: R$ 35.000/mês

Outputs:
- Benefício líquido mensal (após ramp-up): R$ 35.000 - R$ 15.000 = R$ 20.000
- ROI 12m: (R$ 35.000 × 6 + R$ 50.000 - R$ 50.000) / (R$ 50.000 + R$ 15.000 × 12)
  = (R$ 210.000 - R$ 50.000) / R$ 230.000 = +69%
- Payback: ~14 meses

⚠️ APROVAR COM CONDIÇÕES:
- Validação local em 90 dias (3 clientes-piloto)
- Country manager contratado em 60 dias
- Review em 6 meses com go/no-go
```

## 📋 Checklist Antes de Aprovar

```
□ ROI > 0% projetado em 12 meses?
□ Payback < 12 meses?
□ LTV/CAC > 3 (se for aquisição)?
□ Sensibilidade: funciona em cenário pessimista?
□ Riscos identificados com mitigação?
□ KPIs de sucesso definidos para 30-60-90 dias?
□ Plano de reversão se der errado?
□ Owner dedicado + comprometido?
□ Alinhamento com foco estratégico?
□ Budget provisionado?
```

## 🧪 Sandbox: Calcule o Seu

Use o template acima substituindo os valores pelo seu cenário real. Veja:
- ✅ Aprovação rápida se ROI > 100% em 12m
- ⚠️ Aprovação condicional se ROI 0-100%
- ❌ Rejeitar se ROI negativo

## 📚 Materiais Relacionados

- `tools/financas/01-business-case-template.md`
- `playbooks/PB-FINANCEIRO-decisao-investimento.md`
- `Lab-Nexus/prompts/analise/06-forecast-receita-trimestral.md`
- `webinars/WB-2026-08-financeiro-ia.md`

---

*Lab-Nexus · Tool 02 · Finanças · 2026*