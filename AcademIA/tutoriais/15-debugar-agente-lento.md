# 🐛 Tutorial 15 · Como Debugar um Agente Lento

**Nível:** Master
**Tempo:** 25 min
**Pré-requisito:** Tutorial 04 (criar primeiro agente)

---

## 🎯 Problema

Seu agente está demorando muito para responder (>5s) ou está travando. Como diagnosticar?

## 🔍 Checklist de Diagnóstico (5 min)

### 1. Latência do LLM
```bash
# Medir tempo de resposta médio
nexus agent benchmark --agent agt_lead_enricher --samples 10
```

Se latência do LLM > 3s:
- Reduzir `max_tokens` (ex: 1024 → 512)
- Trocar para modelo mais rápido (gpt-4 → gpt-4o-mini)
- Ativar streaming

### 2. Tamanho do Contexto
```bash
# Verificar quantos tokens estão sendo enviados
nexus agent inspect --agent agt_lead_enricher --last-call
```

Se contexto > 8k tokens:
- Truncar histórico
- Sumarizar mensagens antigas
- Usar RAG em vez de mandar tudo no prompt

### 3. Chamadas Externas
```bash
# Ver chamadas API externas no trace
nexus agent trace --agent agt_lead_enricher --last-call --include external
```

Se há chamadas HTTP lentas:
- Cache de resultados (Redis)
- Timeout agressivo (5s)
- Fallback para valor padrão

### 4. Cold Start
```bash
# Verificar se é primeira chamada
nexus agent stats --agent agt_lead_enricher
```

Solução: pre-aquecer agente com ping no startup

### 5. Concorrência
```bash
# Ver quantas chamadas simultâneas
nexus agent concurrency --agent agt_lead_enricher
```

Se > 80% do limite: aumentar limite ou adicionar queue

## 🛠️ Ações Corretivas

| Sintoma | Causa provável | Solução |
|---------|---------------|---------|
| Lento sempre | LLM pesado | Trocar modelo ou reduzir max_tokens |
| Lento às vezes | Rate limit | Implementar queue + retry |
| Timeout aleatório | API externa lenta | Cache + fallback |
| Picos de lentidão | Concorrência alta | Rate limit + throttling |

## 📊 Métricas a Monitorar

- **p50 latência** (mediana): deve ser < 2s
- **p95 latência**: deve ser < 5s
- **p99 latência**: deve ser < 10s
- **Taxa de timeout**: deve ser < 1%
- **Tokens/min**: throughput por agente

## 🎯 Comando Rápido

```bash
# Diagnóstico completo em 1 comando
nexus agent diagnose agt_lead_enricher --full
```

Output:
```
✓ LLM: gpt-4o, latência 1.2s (OK)
✓ Contexto: 2.4k tokens (OK)
✓ HTTP: 3 chamadas, p95 850ms (OK)
✓ Concorrência: 12/100 (OK)
✗ Cache: HIT rate 23% (subutilizado)

Recomendação: Aumentar TTL de cache de 1h → 6h
```

---

*Acad. Nexus · 2026*
