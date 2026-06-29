---
title: "Configurar A/B Test com Judge Revisor"
tutorial_code: TUT-MAS-05
level: master
duration: 22min
tags: [tutorial, ab-test, judge, estatistica, otimizacao, master]
last_updated: 2026-06-28
prerequisites: ["TUT-MAS-11-auditoria-skills"]
---

# 🧪 Configurar A/B Test com Judge Revisor

> **Tempo:** 22 min · **Nível:** Master · **Pré-requisitos:** Auditoria de Skills

## Problema

Você tem duas versões de copy para WhatsApp e quer saber qual converte mais. Mas:
- Não quer depender de "achismo"
- Quer significância estatística (p < 0.05)
- Quer que o Judge faça a seleção automaticamente
- Quer aprender com cada teste para os próximos

## Solução

### 1. Estrutura do Teste

Crie arquivo `tests/copy_v1_v2.yaml`:

```yaml
test_name: "whatsapp_copy_subject_v1_v2"
description: "Teste entre subject 'Última chance' vs 'Você vai perder?'"
hypothesis: "Subject com curiosidade converte mais que escassez"
metrics:
  primary: open_rate
  secondary: [click_rate, conversion_rate]
variants:
  - id: A
    name: "Última chance"
    template: |
      🔥 ÚLTIMA CHANCE: 50% OFF só até meia-noite!
      {{cta_link}}
  - id: B
    name: "Você vai perder?"
    template: |
      🤔 Você vai perder essa oportunidade?
      Spoiler: {{preview}}
      {{cta_link}}
traffic_split:
  A: 0.5
  B: 0.5
sample_size:
  per_variant: 1500  # mínimo para p<0.05
significance_level: 0.05
duration_days: 7
auto_promote:
  enabled: true
  criteria:
    min_samples_per_variant: 1500
    p_value_threshold: 0.01
    min_uplift: 0.10  # 10% mínimo para promover
```

### 2. Configurar Judge para Análise

```python
from datetime import datetime, timedelta
from typing import Dict
import asyncio
from scipy import stats

class JudgeABTestAnalyzer:
    """
    Analisa resultado de A/B test e decide automaticamente
    qual variante promover.
    """

    def __init__(self, judge_client, db):
        self.judge = judge_client
        self.db = db

    async def analyze(self, test_id: str) -> dict:
        """
        Roda análise estatística completa.
        """
        test = await self.db.get_test(test_id)
        results = await self.db.get_results(test_id)

        # Calcular métricas por variante
        metrics = {}
        for variant in test.variants:
            v_results = [r for r in results if r.variant_id == variant.id]
            n = len(v_results)
            conversions = sum(1 for r in v_results if r.converted)
            rate = conversions / n if n > 0 else 0
            metrics[variant.id] = {
                "n": n,
                "conversions": conversions,
                "rate": rate,
                "std_error": (rate * (1 - rate) / n) ** 0.5 if n > 0 else 0,
            }

        # Z-test para diferença de proporções
        a = metrics["A"]
        b = metrics["B"]
        pooled_p = (a["conversions"] + b["conversions"]) / (a["n"] + b["n"])
        se_pooled = (pooled_p * (1 - pooled_p) * (1/a["n"] + 1/b["n"])) ** 0.5
        z = (b["rate"] - a["rate"]) / se_pooled if se_pooled > 0 else 0
        p_value = 2 * (1 - stats.norm.cdf(abs(z)))  # two-tailed

        # Calcular uplift
        uplift = (b["rate"] - a["rate"]) / a["rate"] if a["rate"] > 0 else 0

        # Decisão
        decision = self._make_decision(test, metrics, p_value, uplift)

        return {
            "test_id": test_id,
            "metrics": metrics,
            "z_score": float(z),
            "p_value": float(p_value),
            "uplift": float(uplift),
            "decision": decision,
            "analyzed_at": datetime.utcnow().isoformat(),
        }

    def _make_decision(self, test, metrics, p_value, uplift):
        """Decide se promove variante B, mantém A, ou continua teste."""
        if not test.auto_promote.enabled:
            return {"action": "wait_human", "reason": "auto_promote disabled"}

        criteria = test.auto_promote.criteria
        a = metrics["A"]
        b = metrics["B"]

        if a["n"] < criteria.min_samples_per_variant:
            return {"action": "continue", "reason": "sample size not reached"}
        if b["n"] < criteria.min_samples_per_variant:
            return {"action": "continue", "reason": "sample size not reached"}

        if p_value > criteria.p_value_threshold:
            return {"action": "no_winner", "reason": f"p={p_value:.3f} > {criteria.p_value_threshold}"}

        if uplift < criteria.min_uplift:
            return {"action": "no_promote", "reason": f"uplift {uplift:.1%} < {criteria.min_uplift:.1%}"}

        if uplift > 0:
            return {
                "action": "promote_B",
                "uplift": f"{uplift:.1%}",
                "p_value": f"{p_value:.4f}",
            }
        else:
            return {
                "action": "keep_A",
                "uplift": f"{uplift:.1%}",
                "p_value": f"{p_value:.4f}",
            }
```

### 3. Configurar Trigger Automático

```bash
# Cron job para rodar análise a cada 6 horas
crontab -e
0 */6 * * * curl -X POST http://localhost:8000/api/v1/abtest/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"test_id": "whatsapp_copy_subject_v1_v2"}'
```

### 4. Interpretar Resultados

Quando o teste finalizar, você verá:

```
🧪 RESULTADO: whatsapp_copy_subject_v1_v2

📊 Métricas:
   A: 1.500 envios, 45 aberturas (3.0% open rate)
   B: 1.500 envios, 78 aberturas (5.2% open rate)

📈 Uplift: +73.3% (B é melhor que A)
📊 p-value: 0.0001 (significância alta)
✅ DECISÃO: Promote B (73.3% melhor, p=0.0001)

💡 Aprendizado para Judge:
   Subject com "curiosidade" tem +73% open rate vs "escassez".
   Judge agora pondera curiosity_score 1.73x para futuras copies.
```

## Verificação

✅ Você tem teste A/B rodando com sample size adequado
✅ Você tem significância estatística validada
✅ Judge toma decisão automática baseada em critérios
✅ Cada teste alimenta o próximo (machine learning loop)

## Próximos passos

- Configurar multivariate test (4+ variáveis)
- Implementar decision rules mais sofisticadas
- Estudar Tutorial 13 (Deploy Multi-tenant)
