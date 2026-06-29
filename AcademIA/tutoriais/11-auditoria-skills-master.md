---
title: "Auditoria de Skills do Agente"
tutorial_code: TUT-MAS-04
level: master
duration: 18min
tags: [tutorial, auditoria, skills, agente, seguranca, master]
last_updated: 2026-06-28
prerequisites: ["TUT-AG-04-criar-primeiro-agente", "TUT-MAS-10-webhook-hotmart"]
---

# 🔍 Auditoria de Skills do Agente

> **Tempo:** 18 min · **Nível:** Master · **Pré-requisitos:** Agente criado

## Problema

Você tem 18 skills configuradas no seu agente. Mas:
- Quais skills estão realmente sendo usadas?
- Quais skills têm falhas de segurança?
- Quais skills podem ser otimizadas?
- Como você garante que nenhuma skill está fazendo coisa errada em background?

A **auditoria periódica** é o que separa operação profissional de operação amadora.

## Solução

### 1. Inventário de Skills Ativas

```bash
# No diretório do seu agente
ls AcademIA/Lab-Nexus/lib/skills/
# Output: 18 arquivos .skill.yaml
```

Cada skill tem 7 campos auditáveis:
- `name`, `version`, `description`, `input_schema`, `output_schema`, `side_effects`, `risk_level`

### 2. Análise de Uso (últimos 30 dias)

```sql
-- Query no banco de audit logs
SELECT
  skill_name,
  COUNT(*) as executions,
  AVG(latency_ms) as avg_latency,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as success_rate,
  SUM(cost_usd) as total_cost
FROM skill_executions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY skill_name
ORDER BY executions DESC;
```

**Output esperado:**

| skill | exec | latency | success | cost |
|-------|------|---------|---------|------|
| query_database | 12,847 | 145ms | 99.2% | $2.40 |
| send_whatsapp | 8,234 | 890ms | 96.1% | $1.85 |
| search_web | 5,621 | 1,250ms | 98.7% | $18.40 |
| generate_image | 892 | 4,200ms | 87.3% | $45.20 |
| send_email | 412 | 380ms | 99.8% | $0.12 |
| ... | ... | ... | ... | ... |

### 3. Análise de Segurança

Para cada skill, verifique os 8 pontos de risco:

```yaml
# skills/checklist.yaml
risk_assessment:
  input_validation:
    - has_input_schema: true/false
    - validates_types: true/false
    - sanitizes_strings: true/false
    - max_input_size_enforced: true/false
  output_sanitization:
    - html_escaped: true/false
    - sql_safe: true/false
    - no_secrets_leaked: true/false
  permissions:
    - least_privilege: true/false
    - audit_logged: true/false
  side_effects:
    - reversible: true/false
    - rate_limited: true/false
    - user_approved: true/false
```

### 4. Detecção de Skills Órfãs

Skills configuradas mas nunca executadas há 60+ dias são candidatas a remoção:

```sql
SELECT name FROM skills
WHERE name NOT IN (
  SELECT DISTINCT skill_name
  FROM skill_executions
  WHERE created_at > NOW() - INTERVAL '60 days'
);
```

### 5. Score de Saúde Agregado

```python
def calculate_skill_health_score() -> float:
    """
    Score 0-100 baseado em:
    - 40% taxa de sucesso média
    - 30% latência p95 < 2s
    - 20% cobertura de auditoria (logs)
    - 10% skills com reversibilidade
    """
    success_rate = query_avg_success_rate()
    latency_p95 = query_p95_latency()
    audit_coverage = query_audit_coverage()
    reversibility = query_reversibility_rate()

    score = (
        0.40 * success_rate * 100 +
        0.30 * max(0, 100 - latency_p95 / 20) +
        0.20 * audit_coverage * 100 +
        0.10 * reversibility * 100
    )
    return score

# Benchmarks:
# 90-100: Excelente. Manter.
# 75-90: Bom. Monitorar.
# 60-75: Atenção. Plano de melhoria.
# < 60: Crítico. Ação imediata.
```

## Verificação

✅ Você consegue listar todas as skills ativas
✅ Você tem métrica de uso por skill
✅ Você sabe quais skills têm risco de segurança
✅ Você tem score de saúde agregado
✅ Você tem plano de ação para skills problemáticas

## Próximos passos

- Configurar alertas para skills com success_rate < 90%
- Automatizar auditoria mensal via cron
- Estudar Tutorial 12 (A/B Test com Judge)
