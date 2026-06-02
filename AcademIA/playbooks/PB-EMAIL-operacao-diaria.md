---
title: "PB-EMAIL · Operação diária E-mail"
playbook_code: PB-EMAIL
category: rotina
duration_execution: 20 min/dia
tags: [playbook, email, rotina, diaria, smtp, deliverability]
last_updated: 2026-06-02
---

# 📧 PB-EMAIL · Operação diária E-mail

> **Tempo de leitura:** 8 min · **Tempo de execução:** 20 min/dia · **Quando usar:** Todo dia útil

## 🚨 Quando usar

Sua rotina diária para manter campanhas de e-mail **saudáveis** (entregáveis, sem cair em spam).

## ⚠️ Pré-condições

- [ ] Pelo menos 1 agente de e-mail ativo
- [ ] SMTP configurado e autenticado (SPF, DKIM, DMARC)
- [ ] Acesso ao painel Nexus

## 📋 Checklist diário (20 min)

### Manhã (9h–9:10)

- [ ] **Abrir Admin Runtime → Dashboard E-mail**
- [ ] Verificar **delivery 24h** > 97% (spam?)
- [ ] Verificar **open rate 24h** > 20% (assunto fraco?)
- [ ] Verificar **click rate 24h** > 3% (CTA fraco?)
- [ ] Verificar **unsubscribe 24h** < 0.3% (frequência alta?)

### Manhã (9:10–9:20)

- [ ] Olhar **campanhas em curso** (status 🟢?)
- [ ] Verificar **reputação do domínio** (Sender Score > 80)
- [ ] **Limpar bounces** (remover da lista)
- [ ] Verificar **lista de supressão** (honrar opt-outs imediatamente)

### Tarde (opcional)

- [ ] Acompanhar **A/B tests em campo**
- [ ] Responder **tickets relacionados**
- [ ] Rever **1 copy** do dia (a cada dia, uma copy diferente)

## 🛑 Red flags

| Sinal | Ação |
|---|---|
| Delivery < 90% | **Pausar** + verificar IP/domínio |
| Open rate < 10% | Rever assunto (re-rodar `copywriter-persuasivo`) |
| Click rate < 1% | Rever CTA + design do e-mail |
| Unsubscribe > 1% | **Reduzir frequência** + segmentar melhor |
| Bounce > 5% | **Limpar lista** (validação via ZeroBounce) |

## 📊 Métricas-alvo (semana saudável)

| Métrica | Meta semanal |
|---|---|
| Delivery rate | > 97% |
| Open rate | > 20% |
| Click rate | > 3% |
| Unsubscribe rate | < 0.3% |
| Bounce rate | < 2% |
| Sender Score | > 80 |

## 📊 Pós-mortem semanal (sexta 17h)

- [ ] Compilar métricas da semana
- [ ] Identificar 1 campanha de destaque
- [ ] Identificar 1 campanha para melhorar
- [ ] Planejar 1 experimento para próxima semana

## ⏭️ Próximo playbook

👉 [PB-LANCAMENTO · Lançamento 7 dias](PB-LANCAMENTO-lancamento-7-dias.md)

---

**Versão 1.0** · Atualizado 2026-06-02
