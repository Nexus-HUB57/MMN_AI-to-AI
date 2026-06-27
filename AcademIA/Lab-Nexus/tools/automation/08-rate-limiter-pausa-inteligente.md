---
title: "⚙️ 08 · Rate Limiter com Pausa Inteligente"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

# ⚙️ 08 · Rate Limiter com Pausa Inteligente

**Categoria:** automation
**Nível:** Agente → Master
**Tempo estimado:** 45 min
**Quando usar:** Em qualquer disparo automatizado (WhatsApp, Email, SMS) para evitar bloqueios e fadiga do lead.

---

## 🎯 O que faz

Aplica **rate limiting adaptativo** baseado em:
- Janela horária (anti-burst)
- Histórico do destinatário (anti-fadiga)
- Sinal externo (feriados, eventos)
- Health check do canal (anti-block)

Pausa automaticamente quando detecta risco de bloqueio.

## 🚦 Janelas de Segurança

| Canal | Limite/hora | Limite/dia | Cooldown |
|-------|-------------|------------|----------|
| WhatsApp Business | 80 msgs | 800 msgs | 5 min entre rajadas |
| Email marketing | 500 msgs | 5.000 msgs | 1 min entre rajadas |
| SMS | 100 msgs | 500 msgs | 10 min entre rajadas |
| Instagram DM | 50 msgs | 200 msgs | 30 min entre rajadas |

## 🚀 Como usar

```yaml
# config/rate-limiter.yaml
limits:
  whatsapp_business:
    per_hour: 80
    per_day: 800
    cooldown_after_burst: 300  # seconds
    pause_on_warning: true

  email:
    per_hour: 500
    per_day: 5000
    cooldown_after_burst: 60
    pause_on_warning: true

pause_triggers:
  - channel_bounce_rate > 0.05
  - unsubscription_rate > 0.02
  - spam_complaints > 0.001
  - health_check_failed

recovery_strategy: exponential_backoff
  initial_delay: 60
  max_delay: 3600
  multiplier: 2
```

## 📊 Smart Pause Logic

```
if bounce_rate(window=1h) > 0.05:
    pause_channel(duration="30m")
    alert_ops_team(severity="high")

if unsubscription_rate(window=24h) > 0.02:
    reduce_velocity(factor=0.5)
    trigger_skill("fatigue-detector")

if spam_complaint > 0.001:
    pause_channel(duration="24h")
    escalate_to_compliance_team()
```

## 🎯 Casos de Uso

1. **Lançamento Black Friday** — 50.000 leads em 6h sem tomar ban
2. **Nutrição diária** — 1.000 leads/dia respeitando fadiga individual
3. **Recuperação de carrinho** — cadência inteligente sem saturar

## 📦 Outputs

- Log estruturado de pausas (`/logs/rate-limiter/*.jsonl`)
- Dashboard em `/admin/automation/health`
- Alertas Slack/Discord quando pausa acionada
- API: `POST /automation/limits/check` para validar antes de envio

## ⚠️ Anti-patterns

❌ Não usar rate limiting fixo (sem inteligência)
❌ Ignorar sinais de fadiga para "bater meta"
❌ Reenviar mensagem que teve bounce

✅ Usar janelas deslizantes
✅ Respeitar horário comercial do destinatário
✅ Implementar circuit breaker por canal

---

*Lab-Nexus · 08 · 2026 · Skill Manifest: `adaptive-rate-limiter`*
