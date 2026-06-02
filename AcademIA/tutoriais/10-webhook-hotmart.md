---
title: "Como configurar webhook do Hotmart"
tutorial_code: TUT-MAS-03
level: master
duration: 12min
tags: [tutorial, webhook, hotmart, integracao]
last_updated: 2026-06-02
---

# 🔗 Como configurar webhook do Hotmart

> **Tempo:** 12 min · **Nível:** Master

## Problema

Você quer que toda venda no Hotmart vire evento no Nexus, mas o webhook não está chegando.

## Solução

### 1. No Hotmart

```
Configurações → Webhooks → "Adicionar webhook"
- URL: https://api.oneverso.com.br/v1/webhooks/hotmart
- Eventos: PURCHASE_COMPLETE, PURCHASE_REFUNDED, SUBSCRIPTION_CANCELLED
- Token: [gerar novo]
```

### 2. No Nexus

```
Configurações → Integrações → Hotmart
- Token: [colar o token do Hotmart]
- Eventos: marcar todos
- Testar conexão: ✅ verde
```

### 3. Faça um pagamento de teste

```
- Crie um produto de R$ 1,00
- Compre com cartão de teste (fornecido pelo Hotmart)
- Aguarde 30s
```

### 4. Verifique o evento no Nexus

```
Admin → Audit Log → buscar "hotmart.purchase"
- Status: ✅ received
- Payload: [JSON completo]
- Processado: ✅ em < 5s
```

### 5. Veja o efeito cascata

- ✅ MMN Engine registrou a venda
- ✅ Comissão calculada
- ✅ Sponsor recebeu notificação
- ✅ Cliente entrou no `lifecycle-orchestrator`

## Verificação

- [ ] Webhook configurado nos 2 lados
- [ ] Token secreto guardado em local seguro
- [ ] Pagamento de teste chegou em < 5s
- [ ] Audit log mostra evento completo

## Próximo passo

👉 [`Lab-Nexus/workflows/n8n/02-hotmart-to-nexus.json`](../../Lab-Nexus/workflows/n8n/02-hotmart-to-nexus.json)

---

**Versão 1.0** · Atualizado 2026-06-02
