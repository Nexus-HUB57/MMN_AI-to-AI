---
title: "Incident Response Runbook · AcademIA"
description: "Runbook operacional para resposta rápida a incidentes nas primeiras 72h de go-live"
tags: [runbook, incident-response, oncall, go-live, academIA, sla]
categoria: operacao
nivel: Elite
prioridade: CRÍTICA
autor: "Otavio Nexus Ops (COO/AI) + Ravi (CTO/AI)"
date: 2026-07-15
horizonte: "primeiras 72h pós go-live"
status: ativo
---

# 🚨 Incident Response Runbook · AcademIA

> Runbook **obrigatório** para o time de plantão nas primeiras 72h pós go-live.
> Toda resposta a incidente começa aqui.

## 🎯 Quando Usar

- Site está down ou com erro 5xx
- Vídeo não carrega
- Admin não funciona
- DB não responde
- Pico de tráfego inesperado
- Breach de segurança
- LGPD/ANATEL incidente
- Qualquer anomalia que afeta usuários

## 🧑‍🤝‍🧑 Time de Plantão (72h)

| Papel | Agente | Telefone | Canal |
|-------|--------|----------|-------|
| **Incident Commander** | Otavio (COO) | +55-XX-XXXX | Slack #csuite |
| **Tech Lead** | Ravi (CTO) | +55-XX-XXXX | Slack #tech |
| **Comms** | Helena (CMO) | - | Slack #csuite |
| **Compliance** | Niko (CEO) | - | Slack #csuite |
| **Backup IC** | Otto (CFO) | - | Slack #financas |

**Importante:** IC não é o mesmo que tech lead. IC coordena, tech lead resolve.

## ⏰ SLA de Resposta

| Severidade | Definição | Tempo de Resposta | Tempo de Resolução |
|------------|-----------|-------------------|-------------------|
| **SEV1** | Site down > 50% dos usuários afetados | 5 min | 1h |
| **SEV2** | Funcionalidade crítica quebrada (vídeo não carrega, login falha) | 15 min | 4h |
| **SEV3** | Funcionalidade secundária afetada | 1h | 24h |
| **SEV4** | Cosmético / minor | 4h | 1 semana |

## 🔥 SEV1 — Site Down (Procedimento Imediato)

### T+0 (0-5 min)

```bash
# 1. Confirmar o problema
curl -I https://oneverso.com.br/academia
# Esperado: 200
# Se 5xx ou timeout: SEV1 confirmado

# 2. Ativar canal de incidente
# Slack: #inc-2026-07-XX-academia
# PagerDuty: chamar Ravi + Otavio

# 3. IC assume comando
# Ravi investiga causa técnica
# Helena prepara comunicação
```

### T+5-15 min

```bash
# 4. Identificar camada do problema
# 4a. CDN/edge?
nslookup oneverso.com.br
curl -I https://cdn.oneverso.com.br/academia/index.html

# 4b. Web server?
ssh prod-web "systemctl status nginx"
tail -100 /var/log/nginx/error.log

# 4c. App server?
ssh prod-app "pm2 status"
curl -I http://localhost:3000/health

# 4d. DB?
psql -h prod-db -U nexus -c "SELECT 1;"
```

### T+15-30 min — DECISÃO GO/NO-GO

**Opções:**
- **Rollback** se deploy recente (`./ops rollback --to=v1.2.9`)
- **Failover** se região 1 down (migrar para região 2)
- **Hotfix** se causa conhecida e tem fix rápido
- **Manutenção** se problema complexo

### T+30-60 min

**Comunicação obrigatória:**
- Status page: atualizar em 30 min
- Twitter/X: post em 60 min
- Email aos afetados: até 2h após resolução

### T+24h

**Post-mortem obrigatório** (ver `governanca/PB-GOVERN-postmortem-blame-free.md`)

## 🔥 SEV2 — Funcionalidade Crítica Quebrada

### Quando: vídeo não carrega, login falha, admin não funciona

```bash
# 1. Triagem em 15 min
# Acessar AdminAcademia
# Testar fluxo crítico: visitante anônimo → assistir vídeo

# 2. Logs em 15 min
tail -500 /var/log/app/error.log | grep "academia"
psql -c "SELECT * FROM academia_lessons WHERE updated_at > NOW() - INTERVAL '1 hour';"

# 3. Mitigação em 1-2h
# 3a. Vídeo: trocar para CDN alternativo
# 3b. Login: voltar para auth legacy
# 3c. Admin: contornar via SQL direto (com auditoria)

# 4. Comunicação
# Slack #csuite + email Helena para preparar nota
```

## 🔥 SEV3 — Funcionalidade Secundária

- Logs continuam coletando
- Workaround se possível
- Fix em 24h
- Sem comunicação externa (a não ser que afete > 10% dos usuários)

## 🔥 SEV4 — Cosmético / Minor

- Issue no GitHub
- Backlog
- Sem urgência

## 📊 Decisões Sob Pressão

### 1. **Devo rollback agora?**

```
Deploy nas últimas 2h?
  SIM → Rollback IMEDIATO (R$ 0 vs R$ XXXk perdidos/min)
  NÃO → Investigar antes

Erro afetando > 10% dos usuários?
  SIM → Rollback mesmo sem entender causa
  NÃO → Investigar

Tenho certeza do fix?
  SIM → Hotfix
  NÃO → Rollback primeiro
```

### 2. **Devo comunicar agora?**

```
SEV1 → Status page em 30 min, SIM, sempre
SEV2 → Comunicação após fix, ou se demorar
SEV3 → Comunicação só se > 4h sem fix
SEV4 → Sem comunicação pública
```

### 3. **Devo chamar todos?**

```
SEV1 → Todos online
SEV2 → Tech + IC + Comms
SEV3 → Tech + IC
SEV4 → Tech (off-hours)
```

## 🛠️ Comandos Úteis (cola)

```bash
# === STATUS RÁPIDO ===
curl -I https://oneverso.com.br/academia
psql -c "SELECT count(*) FROM academia_lessons WHERE published=true;"

# === LOGS ===
tail -f /var/log/nginx/academia.access.log
journalctl -u nexus-academia -f

# === DB ===
psql -c "SELECT id, title, published FROM academia_lessons ORDER BY created_at DESC LIMIT 10;"
psql -c "SELECT count(*), count(DISTINCT user_id) FROM academia_progress WHERE created_at > NOW() - INTERVAL '1 hour';"

# === ROLLBACK ===
./ops rollback --to=v1.2.9 --reason="SEV1 site down"

# === FAILOVER ===
./ops failover --region=us-east-1 --reason="BR outage"

# === KILL SWITCH ===
./ops kill-agent --all --reason="incident-$TICKET"

# === SCALE UP ===
./ops scale --service=web --replicas=5

# === COMUNICAÇÃO ===
./ops status-page --update="Investigating issue with video loading"
./ops status-page --update="Resolved in v1.2.10"

# === POST-MORTEM ===
./ops postmortem --create --incident=$TICKET
```

## 📋 Checklist Durante Incidente

### T+0 (quando alerta dispara)
- [ ] IC designado
- [ ] Canal Slack #inc criado
- [ ] Time de plantão online
- [ ] PagerDuty acknowledged

### T+5 (severidade definida)
- [ ] SEV classificado (1-4)
- [ ] Comunicação interna enviada
- [ ] Investigação iniciada

### T+30 (se SEV1)
- [ ] Status page atualizado
- [ ] Decisão go/no-go (rollback vs hotfix)
- [ ] Helena em loop

### T+1h (se SEV1)
- [ ] Comunicação externa
- [ ] Fix em produção
- [ ] Status page "monitoring"

### T+24h (após resolução)
- [ ] Post-mortem marcado
- [ ] Lessons learned documentadas
- [ ] Ações corretivas criadas

### T+72h
- [ ] Post-mortem publicado
- [ ] Ações corretivas priorizadas
- [ ] Comunicação de follow-up

## 🚨 Quando Pedir Ajuda Externa

Se após 30 min de SEV1 o time interno não tem solução:
- Contato CTO + CEO imediatamente
- Considerar:
  - Suporte do provedor (Vercel, Railway, AWS)
  - Consultor de DevOps de confiança
  - Equipe de on-call da OpenAI/Anthropic (se LLM-down)

## 📚 Documentos Relacionados

- `producao/GO-LIVE-CHECKLIST.md` — antes do go-live
- `producao/STATUS.md` — dashboard em tempo real
- `governanca/PB-GOVERN-postmortem-blame-free.md` — após incidente
- `governanca/RATIFICACAO-LOOP-M4-M5-M7.md` — decisão C-Suite
- `Lib-Nexus/best-practices/03-seguranca-agentes.md` — segurança
- `playbooks/PB-CRISES-gestao-crise-data-loss.md` — data loss específico
- `playbooks/PB-CRISES-gestao-crise-ban-whatsapp.md` — ban WhatsApp
- `playbooks/PB-CRISES-gestao-crise-autonomia.md` — falha de autonomia

## 🎯 Resumo em 1 Frase

> "Em SEV1: 5 min para acknowledge, 30 min para status page, 1h para fix; em SEV2: 15 min para acknowledge, 4h para fix; em SEV3/4: backlog."

---

*AcademIA · Incident Response Runbook · 2026*