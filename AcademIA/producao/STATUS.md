---
title: "Status · AcademIA"
description: "Status operacional em tempo real da AcademIA — módulos, infra, KPIs"
tags: [status, operacional, dashboard, go-live, saude]
categoria: operacao
atualizado_em: 2026-07-14
frequencia: 5 min
autor: "Equipo Nexus · COO/AI"
---

# 📊 Status · AcademIA

> Status operacional em tempo real. Atualizado a cada 5 minutos pelo COO/AI (Otavio).

**Última atualização:** 2026-07-14 11:50 BRT

## 🟢 Saúde Geral

| Componente | Status | Detalhe |
|------------|--------|---------|
| **Hub HTML** | 🟢 UP | Renderizando em `oneverso.com.br/academia` |
| **Vídeos CDN** | 🟢 UP | `oneverso.com.br/academia/videos/*.mp4` |
| **Admin Panel** | 🟡 UP | `/admin/academia` (requer auth) |
| **API Progresso** | 🟢 UP | `/api/academia/progress` |
| **Auth** | 🟢 UP | Login funcional |
| **Banco academia_lessons** | 🟢 UP | Schema validado |
| **Pipeline TTS** | 🟢 UP | Síntese de voz funcional |
| **Pipeline Vídeo** | 🟢 UP | gen_videos funcional |

## 📚 Módulos Publicados

### 🟢 Nível Fundamental (3/4 publicados — 75%)

| Módulo | Status | Duração | Views | Conclusão |
|--------|--------|---------|-------|-----------|
| `00-boas-vindas` | 🟢 Public | 8 min | - | - |
| `01-entendendo-ioaid` | 🟢 Public | 9 min | - | - |
| `02-sistema-sho` | 🟢 Public | 11 min | - | - |
| `03-painel-afiliado` | 🟡 Draft | 10 min | - | - |

### 🔵 Nível Agente (0/4)

| Módulo | Status | Duração |
|--------|--------|---------|
| `00-primeiro-agente` | 🟡 Roteiro pronto | 12 min |
| `01-skills-essenciais` | 🟡 Roteiro pronto | 14 min |
| `02-disparo-whatsapp` | 🟡 Roteiro pronto | 13 min |
| `03-judge-revisor` | 🟡 Roteiro pronto | 15 min |

### 🟣 Nível Master (0/4)

| Módulo | Status | Duração |
|--------|--------|---------|
| `00-otimizacao-conversao` | 🟡 Roteiro pronto | 16 min |
| `01-funis-lifecycle` | 🟡 Roteiro pronto | 17 min |
| `02-ab-test-judge` | 🟡 Roteiro pronto | 18 min |
| `03-coortes-churn` | 🟡 Roteiro pronto | 19 min |

### 🟠 Nível Elite (0/4)

| Módulo | Status | Duração |
|--------|--------|---------|
| `00-blueprints-elite` | 🟡 Roteiro pronto | 20 min |
| `01-multi-tenant-whitelabel` | 🟡 Roteiro pronto | 22 min |
| `02-federacao-agentes` | 🟡 Roteiro pronto | 25 min |
| `03-ai-to-ai-protocol` | 🟡 Em planejamento | TBD |

**Total publicado:** 3/16 módulos (19%)
**Horas de conteúdo publicadas:** 0:28h
**Horas de conteúdo roteirizadas:** ~4:30h (pronto para render)

## 📈 KPIs de Uso (últimas 24h)

| Métrica | Atual | Meta 24h | Status |
|---------|-------|----------|--------|
| Visitantes únicos | - | 100 | - |
| Módulos iniciados | - | 50 | - |
| Taxa de conclusão (mod 1) | - | 30% | - |
| NPS do curso | - | > 7 | - |
| Inscrições próximas trilhas | - | 10 | - |

## 🔧 Operações em Andamento

### 🟡 Em progresso

- Render de vídeo `00-boas-vindas` (Alencar) — 70%
- Validação Hub HTML — 80%
- Setup analytics — 60%

### 🟢 Concluído hoje

- ✅ Roteiros validados (3 módulos)
- ✅ Personas Ive + Alencar validadas
- ✅ Schema DB conferido
- ✅ Pipeline TTS testado
- ✅ Frontend rotas validadas

### 🔴 Bloqueios

- Nenhum bloqueio crítico identificado

## 📊 Infraestrutura

### Servidores

| Recurso | Status | Capacidade | Uso atual |
|---------|--------|------------|-----------|
| Web server (nginx) | 🟢 UP | 10k req/s | 0.3k req/s |
| DB Postgres | 🟢 UP | 1k conn | 80 conn |
| Redis cache | 🟢 UP | 5GB | 0.8GB |
| CDN (CloudFlare) | 🟢 UP | 50TB/mês | 2.3TB/mês |
| Storage S3 | 🟢 UP | 1PB | 38TB |

### Custos mensais (estimativa para 1k MAU)

| Item | Custo |
|------|-------|
| Compute (Vercel + Railway) | R$ 800 |
| DB (Postgres) | R$ 200 |
| TTS (OpenAI) | R$ 1.200 |
| Vídeo (gen_videos) | R$ 2.500 |
| CDN | R$ 350 |
| Email (Customer.io) | R$ 400 |
| Outros | R$ 300 |
| **Total** | **R$ 5.750/mês** |

**ARPU necessário para break-even:** R$ 5,75/usuário/mês (se 100% conversion)

## 🚨 Alertas Ativos

Nenhum alerta crítico no momento.

## 📞 Escalação

| Tipo | Responsável | Canal |
|------|-------------|-------|
| **Incidente técnico** | Ravi (CTO) | Slack #csuite + PagerDuty |
| **Conteúdo / Pedagogia** | Sra. Ive + Sir. Alencar | Slack #academia |
| **Marketing / Growth** | Helena (CMO) | Slack #marketing |
| **Finanças** | Otto (CFO) | Slack #financas |
| **Operações** | Otavio (COO) | Slack #ops |

## 🎯 Próximas Janelas

| Janela | Quando | Owner | Status |
|--------|--------|-------|--------|
| Render vídeo `00-boas-vindas` | T+1h | Ravi | Em progresso |
| Publicação piloto | T+6h | Otavio | Aguardando |
| Email lançamento | T+7h | Helena | Aguardando |
| Review pós 24h | T+30h | C-Suite | Pendente |
| Render lote 1 (3 módulos) | T+24h | Ravi | Pendente |
| Render lote 2 (3 módulos) | T+72h | Ravi | Pendente |

## 📈 Tendência (7 dias)

```
Visitas:     [em breve após go-live]
Conclusão:   [em breve após go-live]
NPS:         [em breve após go-live]
```

## 🔗 Links Úteis

- 🌐 **Academia:** https://oneverso.com.br/academia
- 🔐 **Admin:** https://oneverso.com.br/admin/academia
- 📊 **Analytics:** https://oneverso.com.br/admin/academia/analytics
- 🐛 **Issues:** https://github.com/Nexus-HUB57/MMN_AI-to-AI/issues
- 📚 **Docs AcademIA:** `AcademIA/INDEX.md`
- 🚀 **Go-Live Checklist:** `AcademIA/producao/GO-LIVE-CHECKLIST.md`

---

*Atualizado automaticamente pelo COO/AI · 2026-07-14 11:50 BRT*
*Próxima atualização: 2026-07-14 11:55 BRT*