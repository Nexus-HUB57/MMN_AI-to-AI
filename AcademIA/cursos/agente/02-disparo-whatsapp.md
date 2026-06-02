---
title: "02 · Disparando no WhatsApp"
level: agente
duration: 30min
prerequisites: ["agente/01-skills-essenciais"]
tags: [whatsapp, disparo, meta-api, templates, lgpd, ban, kill-switch]
last_updated: 2026-06-02
---

# 📱 02 · Disparando no WhatsApp

> **Tempo:** 30 min · **Nível:** Agente · **Pré-requisitos:** 01 - Skills essenciais

## ⚠️ Antes de tudo: LGPD e Template Approval

> **Regra de ouro do Nexus:** toda mensagem no WhatsApp passa por **template approval + opt-in verificado.**
> **Quebrar isso = ban permanente do número.**

Certifique-se:

- [ ] Cada contato tem `opted_in: true` e `opted_in_at < 12 meses`
- [ ] O template foi aprovado pelo WhatsApp Business
- [ ] Você tem base legal registrada (consentimento, contrato, legítimo interesse)

## Como funciona o dispatcher WhatsApp no Nexus

```
Skill auto-publisher
        │
        ▼
┌────────────────────┐
│ WhatsApp Dispatcher │  (backend/src/agentic/skills/dispatcher.ts)
└────────┬───────────┘
         │ fila BullMQ
         ▼
┌────────────────────┐
│  WhatsApp Business │  (API oficial Meta)
└────────┬───────────┘
         │ eventos
         ▼
   delivered / read / replied
```

## Passo a passo — primeiro disparo

### 1. Conecte o WhatsApp Business

```
Configurações → Integrações → WhatsApp
- Escaneie QR
- Autorize os templates (pode levar 24h)
```

### 2. Crie o template (se ainda não tem)

Exemplo de template aprovado:

```
Olá {{1}}, tudo bem?

Sou {{2}}, afiliado Nexus. Vi que você se interessou por {{3}}
e quero te mandar uma condição especial.

Posso te enviar? Responda SIM para receber.

— {{2}}
```

**Categorias aceitas:** `marketing` (com opt-in) ou `utility` (transacional).

### 3. Configure o agente para usar WhatsApp

```typescript
{
  skills: ["copywriter-persuasivo", "audience-segmenter", "auto-publisher"],
  dispatcher: "whatsapp",
  riskLimit: 50,        // R$ 50 máximo por batch
  confidenceThreshold: 0.75,
  template: "promo_especial_v1"  // aprovado pela Meta
}
```

### 4. Limite de volume

| Estágio | Limite |
|---|---|
| Cold start | máx **50 mensagens/dia** |
| Após 7 dias sem ban | até **500/dia** |
| Após 30 dias, CTR > 5% | até **5.000/dia** |
| Scale Elite | sem limite, mas com auto-pause se CTR cair |

### 5. Acompanhe a fila

```
Admin Runtime → Fila WhatsApp
- Pendentes
- Enviadas (últimas 24h)
- Lidas
- Respondidas
- Banidas (crítico — pause imediatamente)
```

## Métricas que importam

| Métrica | Referência saudável | Ação se pior |
|---|---|---|
| Delivery rate | > 95% | Verificar opt-in |
| Read rate | > 70% | Trocar horário de envio |
| Reply rate | > 8% | Melhorar copy / hook |
| **Block rate** | **< 1%** | **PARAR e revisar template** |
| CTR (link) | > 5% | Testar novo hook |

## 🚨 Red flags (pause e investigue)

- Block rate **> 2%** por dia
- Read rate **< 30%**
- Templates **reprovados** pela Meta
- Pico de `whatsapp.opt_out` (pessoas saindo)

**Comando de emergência:**

```
Admin Runtime → [seu agente] → "KILL SWITCH"
```

> Isso para todos os envios pendentes em **< 30s**.

## 🎯 Exercício

1. Configure o dispatcher WhatsApp
2. Crie 1 template `promo_especial_v1`
3. Envie para **20 contatos** do segmento `quentes_30d`
4. Aguarde 48h
5. Documente: delivery, read, reply, CTR

> 🎯 **Meta pessoal:** delivery > 95%, reply > 10%, CTR > 5%.

## ⏭️ Próximo passo

👉 [**03 · Lendo o Judge Revisor**](03-judge-revisor.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `backend/src/agentic/skills/dispatcher.ts` + `autoPublisher.ts`
