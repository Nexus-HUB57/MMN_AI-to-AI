# 📊 07 · Comparador de Creators

**Categoria:** analytics
**Nível:** Master
**Tempo estimado:** 30 min
**Quando usar:** Antes de firmar parceria com creator/influencer, ou mensalmente para revisar performance da rede de creators.

---

## 🎯 O que faz

Compara até **10 creators** lado a lado em 12 métricas, ranqueando por score composto. Usa dados reais de Hotmart, Shopee Affiliates, Mercado Livre e Instagram Insights.

## 📊 Métricas Comparadas

- **Afiliados convertidos** (últimos 30d / 90d)
- **CAC médio** vs **LTV médio**
- **Taxa de retenção** D30 / D90
- **Engajamento orgânico** (likes, saves, shares)
- **Conversão por post** (CTR de link de afiliado)
- **Compliance score** (sem violações CONAR/LGPD)
- **Receita total gerada** (30d / 90d / 365d)
- **Comissão média**
- **NPS** (de pesquisas internas)

## 🚀 Como usar

```bash
# Comparar 5 creators específicos
nexus analytics compare-creators \
  --ids "cre_123,cre_456,cre_789,cre_012,cre_345" \
  --window "90d"

# Top 10 creators por receita
nexus analytics compare-creators \
  --top 10 \
  --sort "revenue_total" \
  --output table
```

## 📈 Output Esperado

```
┌─────────────┬─────────┬───────┬─────────┬──────────┬──────────┐
│ Creator     │ Conv.   │ CAC   │ Ret.D90 │ Revenue  │ Score    │
├─────────────┼─────────┼───────┼─────────┼──────────┼──────────┤
│ @ana.fit    │ 1.247   │ R$ 12 │ 78%     │ R$ 187k  │ 0.94 🏆  │
│ @pedro.tech │   892   │ R$ 18 │ 71%     │ R$ 142k  │ 0.87     │
│ @mari.life  │   654   │ R$ 22 │ 65%     │ R$  98k  │ 0.81     │
└─────────────┴─────────┴───────┴─────────┴──────────┴──────────┘
```

## ⚙️ Score Composto (0-1)

```
score = 0.30 * (revenue_normalized)
      + 0.25 * (retention_90d)
      + 0.20 * (1 - cac_normalized)
      + 0.15 * (engagement_rate)
      + 0.10 * (compliance_score)
```

## 🎯 Critérios de Decisão

| Score | Recomendação |
|-------|--------------|
| ≥ 0.90 | Parceiro A — escala de relationship |
| 0.75-0.89 | Parceiro B — manter e desenvolver |
| 0.60-0.74 | Parceiro C — revisar em 90 dias |
| < 0.60 | Avaliar descontinuidade |

## 📦 Outputs

- Tabela comparativa
- Gráfico radar (spider chart) por creator
- Relatório PDF exportável
- Endpoint API: `GET /analytics/creators/compare`

---

*Lab-Nexus · 07 · 2026 · Skill Manifest: `creator-comparator`*
