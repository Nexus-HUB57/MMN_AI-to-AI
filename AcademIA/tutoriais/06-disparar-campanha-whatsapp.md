---
title: "Como disparar 1 campanha WhatsApp"
tutorial_code: TUT-AG-03
level: agente
duration: 12min
tags: [tutorial, whatsapp, campanha, disparo]
last_updated: 2026-06-02
---

# 📱 Como disparar 1 campanha WhatsApp

> **Tempo:** 12 min · **Nível:** Agente

## Problema

Você configurou o agente e o dispatcher, mas nunca disparou uma campanha real.

## Solução (passo a passo)

### 1. Importe a audiência

```
Admin Runtime → [seu agente] → Audiência → "Importar"
- Formato: CSV (colunas: phone, name, opt_in_at)
- Tamanho: comece com 50
```

### 2. Crie a campanha

```
Campanhas → "Nova campanha"
- Nome: "Teste 01 - WhatsApp Frios"
- Tipo: whatsapp
- Template: "promo_especial_v1" (já aprovado)
- Agente: "Meu Primeiro Agente"
```

### 3. Defina o horário de envio

```
- Janela: 9h–12h ou 19h–21h (BRT)
- Distribuição: 10 msgs/hora (evita pico)
```

### 4. Configure o kill switch

```yaml
kill_switch:
  block_rate: 2%      # pausa se passar
  opt_out_spike: 5    # pausa se 5+ opt-outs em 1h
  no_reply_24h: 80%   # alerta se < 20% reply
```

### 5. Faça um "dry run"

Botão **"Simular envio"** → mostra quantas mensagens, custo estimado, audiência.

### 6. Execute e acompanhe

```
- Status inicial: 🟡 "fila iniciada"
- Em 1h: 🟢 "rodando"
- Acompanhe no dashboard
```

## Verificação (24h depois)

- [ ] Delivery > 95%
- [ ] Read > 70%
- [ ] Reply > 8%
- [ ] Block rate < 1%
- [ ] Sem kill switch disparado

## Próximo passo

👉 [`playbooks/PB-WHATSAPP-operacao-diaria.md`](../../playbooks/PB-WHATSAPP-operacao-diaria.md)

---

**Versão 1.0** · Atualizado 2026-06-02
