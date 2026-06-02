---
title: "WS-03 · Oficina de Webhook + Integração"
level: master
duration: 150min
format: workshop
tags: [workshop, webhook, hotmart, shopee, stripe, integracao, n8n]
last_updated: 2026-06-02
---

# 🎬 WS-03 · Oficina de Webhook + Integração

> **Formato:** Workshop gravado · **Duração:** 150 min · **Nível:** Master

## 🎯 Objetivo

Conectar o Nexus a **3 fontes externas** (Hotmart, Shopee, Stripe) via webhook + n8n, validar eventos ponta a ponta e construir 1 workflow de automação completo.

## 📚 Pré-requisitos

- [x] Nível Agente completo
- [x] Conta em pelo menos 1 das 3 plataformas
- [x] n8n self-hosted ou cloud (instruções no Lab-Nexus)

## 🗓️ Agenda (2.5 horas)

### Bloco 1 — Conceitos (30 min)
- O que é webhook vs polling
- Segurança: assinatura HMAC, replay protection
- Estrutura de eventos no Nexus (event bus + audit)

### Bloco 2 — Hotmart (40 min)
- Cadastrar webhook no painel Hotmart
- Configurar `webhookRouter` no Nexus
- Testar com evento `PURCHASE_COMPLETE`
- Mapear → entrada no MMN Engine

### Bloco 3 — Shopee (40 min)
- Autenticação OAuth2
- Sincronização de catálogo + pedidos
- Webhook de mudança de preço
- Reconciliação com base local

### Bloco 4 — Stripe (30 min)
- Webhook signature verification
- Eventos críticos: `payment_intent.succeeded`, `customer.subscription.deleted`
- Tratamento de idempotência
- Integração com `billing` domain

### Bloco 5 — Hands-on (30 min)
- Construir 1 workflow n8n que conecta 3 fontes
- Disparar `lifecycle-orchestrator` em resposta a evento
- Dashboard de eventos em tempo real

## 🧪 Material de Apoio

- **Workflows prontos:** [`Lab-Nexus/workflows/n8n/`](../../Lab-Nexus/workflows/n8n/)
- **Schemas de webhook:** [`Lab-Nexus/tools/automation/01-webhooks-payload.md`](../../Lab-Nexus/tools/automation/01-webhooks-payload.md)
- **API docs:** [`Lib-Nexus/api-docs/webhooks.md`](../../Lib-Nexus/api-docs/webhooks.md)

## 🏋️ Exercício Prático

1. Configure **1 webhook** real (Hotmart ou Stripe)
2. Faça um pagamento de teste (R$ 1,00)
3. Veja o evento chegar no painel Nexus
4. Construa 1 workflow n8n que reaja ao evento
5. **Entrega:** vídeo 5min mostrando o evento fluindo

## 📊 Critérios de Sucesso

- [ ] Webhook configurado e validado
- [ ] Evento aparece no painel em < 5s
- [ ] Workflow n8n funcional
- [ ] Auditoria visível no `eventBus`

## ⏭️ Próximo Passo

👉 Explore [`playbooks/`](../../playbooks/) para ver manuais de operação completos.

---

**Versão 1.0** · Atualizado 2026-06-02
