# 🩺 Runbook Auto-Heal v2 · Nexus Affil'IA'te

**Owner**: Otávio Nexus Ops (COO/AI)
**Data**: 2026-07-03 · **Onda 7**

## 🎯 Cobertura Atual (8 fault classes)

| Fault Class | Severidade | Ação Padrão | Autonomia |
|---|---|---|---|
| `queue.stalled` | low | auto-remediate (BullMQ retry) | execute_low |
| `endpoint.degraded` | low | monitor-check + restart PM2 | execute_low |
| `cache.inconsistent` | low | Redis flush pattern | execute_low |
| `build.broken` | low | rollback último build | execute_low |
| `judge.offline` | low | remoteJudge reconnect | execute_low |
| `commission.divergence` | medium | escalate CFO (Otto) review | escalated |
| `payout.stuck` | medium | escalate CFO (Otto) review | escalated |
| `fraud.suspect` | high | escalate CEO (Niko) + Lucas | escalated |

## 🔒 Lacres Humanos (jamais auto-executados)

- `payout.release.real-money`
- `commissions.matrix-change`
- `agent.hire-fire`
- `custody.key-change`

## 🚨 Protocolo de Incidente (5 níveis)

1. **P0 - Crítico**: sistema fora, fraud.suspect → Niko + Lucas + Otto imediatamente
2. **P1 - Alto**: payout.stuck > 30min → Otto CFO
3. **P2 - Médio**: commission.divergence → Otto CFO review
4. **P3 - Baixo**: endpoint degraded, queue stalled → auto-remediate
5. **P4 - Info**: cache inconsistent, judge offline → observability log

## 🔄 Ciclo de Vida de uma Execução

```
1. Detecção (monitor cron a cada 5min)
2. Classificação (severity map)
3. Decisão:
   - low → tryHeal() executa
   - medium → escalate para C-level correspondente
   - high → escalate para Niko + Lucas
4. Registro em auto_heal_executions (jsonb details)
5. Se healed: fim
6. Se escalated: cria governance_actions entry
7. Se failed: alerta Slack (futuro)
```

## 📊 KPIs do Runbook

- **Total execuções**: `SELECT COUNT(*) FROM auto_heal_executions`
- **Success rate**: `SELECT COUNT(*) FILTER (WHERE outcome='healed') * 100.0 / COUNT(*) FROM auto_heal_executions`
- **Latência média**: `SELECT AVG(duration_ms) FROM auto_heal_executions WHERE outcome='healed'`
- **Escalations 7d**: `SELECT COUNT(*) FROM auto_heal_executions WHERE outcome='escalated' AND executed_at > NOW() - INTERVAL '7 days'`

## 🔧 Como Reportar/Reagir a Cada Fault

### queue.stalled
- **Sintoma**: BullMQ worker sem processar > 5min
- **Ação**: `PM2 restart mmn-worker-*`
- **Verificação**: `SELECT COUNT(*) FROM agent_queue_jobs WHERE status = 'pending'`

### endpoint.degraded
- **Sintoma**: p95 latency > 2s ou 5xx > 5% em 5min
- **Ação**: `pm2 reload mmn-api --update-env`
- **Verificação**: `curl -w "%{time_total}" /api/trpc/system.health`

### cache.inconsistent
- **Sintoma**: cache stale > TTL declarado
- **Ação**: `redis-cli DEL <pattern>`
- **Verificação**: hit rate query

### build.broken
- **Sintoma**: build backend falhou em CI
- **Ação**: `git revert HEAD && pm2 reload mmn-api`
- **Verificação**: `curl /api/trpc/system.health`

### judge.offline
- **Sintoma**: remoteJudge health check falha > 3 tentativas
- **Ação**: reconnect via `remoteJudgeRegistry.reconnect(id)`
- **Verificação**: `/api/trpc/judgeFederation.status`

### commission.divergence
- **Sintoma**: soma commissions ≠ soma orders * rate
- **Ação**: escalate Otto CFO (calcular delta, propor correção)
- **Verificação**: Otto emite governance_action

### payout.stuck
- **Sintoma**: payout status = 'pending' > 24h
- **Ação**: escalate Otto CFO (verificar MP/PIX API)
- **Verificação**: Otto revisa external_reference

### fraud.suspect
- **Sintoma**: > 10 orders mesmo IP em 60s
- **Ação**: escalate CRÍTICO Niko + Lucas
- **Verificação**: análise manual + Governance Loop
