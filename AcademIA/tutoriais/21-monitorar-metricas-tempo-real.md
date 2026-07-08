---
title: "Tutorial 21 · Monitorar Métricas em Tempo Real"
description: "Configurar dashboards ao vivo para autonomia, SHO, conversions, com alertas automáticos"
tags: [tutorial, monitoramento, dashboards, observabilidade, tempo-real, alertas]
nivel: Intermediário
duracao: 30 min
pre_requisitos: ["Acesso ao painel admin"]
autor: Equipo Nexus
date: 2026-07-07
---

# 📊 Tutorial 21 · Monitorar Métricas em Tempo Real

> **Objetivo:** configurar 3 dashboards essenciais e alertas automáticos para detectar problemas antes que virem crise.

## 🎯 O que você vai aprender

- ✅ Dashboard "Saúde Geral" (1 tela, 30s de leitura)
- ✅ Dashboard "Operacional" (campanhas, entregas, falhas)
- ✅ Dashboard "Financeiro" (MRR, churn, LTV/CAC)
- ✅ Alertas automáticos no Slack/email/SMS
- ✅ Game day: testar se os alertas funcionam

## 📋 Pré-requisitos

- Acesso ao painel admin (`app.nexus-academy.io/admin`)
- Permissão de criar dashboards (role: `admin` ou `ops`)
- Canal Slack conectado OU email operacional

---

## 🚀 Passo 1: Acessar Painel de Métricas (3 min)

1. Abra `app.nexus-academy.io/admin/metrics`
2. Você verá 3 dashboards padrão pré-configurados:
   - **Saúde Geral** — visão macro
   - **Operacional** — campanhas e agentes
   - **Financeiro** — receita e churn
3. Cada dashboard tem **auto-refresh a cada 30 segundos**

**Dica:** clique no ícone ⚙️ para ajustar intervalo (15s, 30s, 1min, 5min).

---

## 📊 Passo 2: Dashboard "Saúde Geral" (5 min)

Esse é o **dashboard que você vê primeiro toda manhã**. Leva 30 segundos pra entender o estado.

### Os 5 KPIs principais

| KPI | Meta | Onde olhar | Se vermelho |
|---|---|---|---|
| **SHO Status** | 🟢 Operacional | Cabeçalho do dashboard | Ver `Lab-Nexus/sync/audit-log-schema.md` |
| **Autonomy Score** | > 80 | Card central | Investigar agentes com score < 70 |
| **Uptime 24h** | > 99.5% | Card direito | Verificar incidentes no painel |
| **Incidentes Abertos** | 0 | Card esquerdo | Triagem imediata |
| **MRR Hoje** | Meta do mês / dias úteis | Card inferior | Não urgente, monitorar tendência |

### Como configurar alertas

```
Menu superior direito → ⚙️ Config → Alertas
```

**Sugestão de alertas:**

| Condição | Canal | Severidade |
|---|---|---|
| SHO Status != Operacional por > 5 min | Slack + SMS + email | 🔴 Crítica |
| Autonomy Score < 70 | Slack | 🟡 Atenção |
| Uptime 24h < 99% | Slack | 🟡 Atenção |
| Incidente aberto > 30 min sem owner | Slack + email | 🟠 Alta |
| MRR do dia < 80% da meta diária | Slack | 🟢 Info |

---

## 📊 Passo 3: Dashboard "Operacional" (8 min)

Para acompanhar campanhas, agentes e skills ativas.

### Sub-views

**3.1 — Campanhas Ativas**
- Total rodando agora
- Por canal (WhatsApp, email, SMS)
- Mensagens enviadas últimas 24h
- Taxa de entrega > 95%? (se < investigar)
- Taxa de abertura > 70%?
- Taxa de conversão > 3%?

**3.2 — Agentes**
- Quantos ativos no momento
- Health score individual (gráfico radar)
- Últimas 100 ações (audit trail resumido)
- Latência média (P50, P95, P99)
- Erros por hora

**3.3 — Skills em Uso**
- Top 10 skills mais usadas
- Latência por skill
- Taxa de erro por skill
- Bloqueios de segurança (RBAC, rate limit)

### Customizando widgets

1. Clique em qualquer widget
2. Selecione "Editar"
3. Pode:
   - Mudar métrica (KPI diferente)
   - Mudar visualização (linha, barra, pizza, número)
   - Mudar agregação (soma, média, P95, max)
   - Mudar período (1h, 24h, 7d, 30d, custom)
4. Salvar como "Meu dashboard" (não substitui o padrão)

---

## 📊 Passo 4: Dashboard "Financeiro" (5 min)

Para C-Suite e/ou você como founder.

### Métricas que importam

| Métrica | Como calcular | Meta saudável |
|---|---|---|
| **MRR** | soma de assinaturas ativas × ticket | cresce ≥ 10% a.m. |
| **ARR** | MRR × 12 | projeta 12 meses |
| **Churn mensal** | cancelamentos / base início | < 5% |
| **Churn revenue** | MRR perdido / MRR início | < 3% |
| **LTV** | ARPU × (1/churn) × margem bruta | > 12 × CAC |
| **CAC** | marketing&sales / novos clientes | varia, acompanhar |
| **LTV/CAC** | LTV ÷ CAC | > 3× |
| **Payback** | CAC ÷ (ARPU × margem) | < 12 meses |
| **NRR** | (MRR início + expansion - churn) / MRR início | > 100% (expansão > churn) |
| **Magic Number** | (Δ ARR / marketing&sales) | > 0.75 |

### Como ler

```
MRR hoje: R$ 87.500
Crescimento: +12% a.m. ✓
Churn: 3.8% (saudável, abaixo de 5%)
LTV/CAC: 4.2× (saudável, acima de 3×)
Payback: 8 meses (saudável, abaixo de 12)
NRR: 108% (expansão > churn, ótimo)

✅ Estado: Saudável
```

### Quando se preocupar

```
MRR hoje: R$ 87.500 (mesma do mês passado)
Crescimento: +0.5% a.m. ⚠️
Churn: 7.2% ⚠️ (acima de 5%)
LTV/CAC: 2.1× ⚠️ (abaixo de 3×)

⚠️ Estado: Atenção - investigar causas
```

---

## 🔔 Passo 5: Configurar Alertas Robustos (5 min)

### Tipos de alerta

**1. Threshold fixo**
```
SE SHO != Operacional POR > 5min
ENTÃO Slack #csuite + email ceo@nexus
```

**2. Threshold dinâmico (anomalia)**
```
SE latência P95 > média 7 dias × 2 POR > 10min
ENTÃO Slack #ops (não precisa acordar C-Suite)
```

**3. Tendência**
```
SE MRR caiu 3 dias seguidos
ENTÃO email CFO/AI (Otto) + Slack #csuite
```

**4. Evento crítico**
```
SE tentativa cross-tenant access
ENTÃO Slack #security + kill switch automático
```

### Canais disponíveis

- **Slack** (mais comum, tempo real)
- **Email** (bom para alertas digest)
- **SMS** (só para crítico + on-call)
- **PagerDuty** (integração enterprise)
- **Webhook customizado** (integra com seu sistema)

### Runbook de alerta

Cada alerta deve ter um **runbook** (procedimento padrão) linkado:

```markdown
## Alerta: SHO Status = Degraded

**Severidade:** 🟠 Alta
**Quando dispara:** SHO detecta anomalia por > 5 min
**Quem recebe:** @ops-team

### Passos:
1. Acessar `app.nexus-academy.io/admin/incidents`
2. Verificar tipo de anomalia (latência? erro? segurança?)
3. Se for incidente, abrir ticket e seguir runbook
4. Se for falso positivo, ajustar threshold e post-mortem
5. Confirmar resolução no painel
```

---

## 🧪 Passo 6: Game Day — Testar se Alertas Funcionam (5 min)

**Fazer 1x por mês**. Sem isso, alerta não vale nada.

### Procedimento

1. **Agendar janela de teste** (avisar time)
2. **Simular incidente:**
   - Derrubar um agente de teste (`./ops kill-agent --test`)
   - Disparar volume anômalo (`./ops flood --rate=1000/min --duration=2min`)
   - Forçar erro (`./ops break-skill --skill=test-skill`)
3. **Cronometrar:**
   - Quanto tempo até alerta chegar? (meta: < 2 min)
   - Alerta foi pro canal certo?
   - Runbook estava linkado?
4. **Documentar:**
   - Tempo de detecção (TTD)
   - Tempo de resposta (TTR)
   - Falhas no fluxo
5. **Ação corretiva** se algo falhou

---

## 📈 Passo 7: Métricas Avançadas (Bônus)

Se você quer ir além do básico:

### Cohort Analysis
- Agrupa usuários por mês de ativação
- Acompanha retention por coorte
- Identifica quando churn acontece

### Funil de Conversão
```
Visitante → Lead → Trial → Pago → Expansão
1000 → 200 → 50 → 12 → 5
```
Cada etapa com taxa de conversão e tempo médio.

### Heatmap de Atividade
- Que horas/dias têm mais ação?
- Quando o agente precisa estar mais disponível?

### Forecast
- Baseado em tendência, quanto vai ser MRR em 3 meses?
- Alerta se forecast indica problema (churn > aquisição por X tempo)

---

## 🎯 Checklist Final

- [ ] Dashboard "Saúde Geral" salvo como favorito
- [ ] 5 alertas críticos configurados com canal certo
- [ ] Cada alerta tem runbook linkado
- [ ] Game day agendado (1x por mês)
- [ ] Time sabe o que fazer quando alerta chega
- [ ] Números reais anotados como baseline
- [ ] Customização pessoal feita (meus widgets)

## 📚 Materiais Complementares

- `tutoriais/03-ler-relatorio-autonomia.md` — autonomia deep dive
- `tutoriais/19-ler-metricas-sho.md` — métricas SHO
- `Lab-Nexus/tools/analytics/06-dashboard-kpis.md` — configuração avançada
- `Lab-Nexus/prompts/analise/04-diagnostico-churn-preventivo.md`
- `playbooks/PB-CRISES-gestao-crise-data-loss.md`

---

*AcademIA · Tutorial 21 · 2026*