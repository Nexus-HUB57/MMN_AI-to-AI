---
title: "PB-WHATSAPP · Operação diária WhatsApp"
playbook_code: PB-WHATSAPP
category: rotina
duration_execution: 30 min/dia
tags: [playbook, whatsapp, rotina, diaria, monitoria]
last_updated: 2026-06-02
---

# 📱 PB-WHATSAPP · Operação diária WhatsApp

> **Tempo de leitura:** 10 min · **Tempo de execução:** 30 min/dia · **Quando usar:** Todo dia útil

## 🚨 Quando usar

Sua rotina diária para manter 1+ agentes de WhatsApp rodando de forma **saudável e lucrativa**.

## ⚠️ Pré-condições

- [ ] Pelo menos 1 agente de WhatsApp ativo
- [ ] Dispatcher WhatsApp configurado e 🟢
- [ ] Acesso ao painel Nexus

## 📋 Checklist diário (30 min)

### Manhã (9h–9:15)

- [ ] **Abrir Admin Runtime → Dashboard WhatsApp**
- [ ] Verificar **delivery 24h** > 95% (se não, investigar opt-in)
- [ ] Verificar **block rate 24h** < 1% (se não, ver PB-CRISES-BAN)
- [ ] Verificar **read rate 24h** > 70% (se não, ajustar horário)
- [ ] **Limpar fila do Judge** (resolver itens pendentes)

### Manhã (9:15–9:30)

- [ ] Olhar **campanhas em curso** (status 🟢?)
- [ ] Verificar **consumo de budget** (dentro do planejado?)
- [ ] Verificar **opt-outs do dia** (se > 5, ver PB-CRISES-BAN)
- [ ] **Sondagem rápida:** 3 contatos aleatórios (mensagem de teste)

### Tarde (14h–14:15)

- [ ] Acompanhar **A/B tests em campo** (se houver)
- [ ] Verificar **latência p95** < 3s
- [ ] Verificar **Judge alinhamento** 75–85%
- [ ] Responder **tickets relacionados** (se houver)

### Noite (21h–21:15)

- [ ] **Relatório do dia** exportado (CSV)
- [ ] **Anotar aprendizados** no caderno de campo
- [ ] Planejar **disparos de amanhã** (segmento + horário + template)
- [ ] Verificar **templates pendentes de aprovação** (Meta)

## 🛑 Red flags (ação imediata)

| Sinal | Ação |
|---|---|
| Block rate > 1% | **Pausar** + revisar template + ver PB-CRISES-BAN |
| Opt-outs > 5/dia | **Pausar** + revisar copy + considerar opt-in duplo |
| Latência > 5s | Reiniciar dispatcher + ver Redis |
| Templates reprovados | **Não usar** + ver motivos + refazer |
| Judge reprovando > 20% | Calibrar `confidenceThreshold` |

## 📊 Métricas-alvo (semana saudável)

| Métrica | Meta semanal |
|---|---|
| Delivery rate | > 95% |
| Read rate | > 70% |
| Reply rate | > 8% |
| Block rate | < 1% |
| CTR | > 5% |
| Latência p95 | < 3s |

## 📊 Pós-mortem semanal (sexta 18h)

- [ ] Compilar métricas da semana
- [ ] Identificar 1 vitória
- [ ] Identificar 1 problema
- [ ] Planejar 1 experimento para próxima semana

## ⏭️ Próximo playbook

👉 [PB-LANCAMENTO · Lançamento 7 dias](PB-LANCAMENTO-lancamento-7-dias.md)

---

**Versão 1.0** · Atualizado 2026-06-02
