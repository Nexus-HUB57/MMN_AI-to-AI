---
title: "Como configurar 1 dispatcher"
tutorial_code: TUT-FUN-02
level: fundamental
duration: 7min
tags: [tutorial, dispatcher, whatsapp, email, configuracao]
last_updated: 2026-06-02
---

# 🔌 Como configurar 1 dispatcher

> **Tempo:** 7 min · **Nível:** Fundamental

## Problema

Você ativou uma skill de disparo mas nada sai. Provavelmente falta o **dispatcher** (canal de envio).

## Solução

### 1. Acesse Integrações

```
Configurações → Integrações → Dispatchers
```

### 2. Escolha 1 canal (comece por 1!)

| Canal | Tempo de setup | Quando usar |
|---|---|---|
| **WhatsApp** | 15 min (Meta review) | Maior engajamento BR |
| **E-mail** | 2 min (SMTP) | Newsletters, réguas longas |
| **Push** | 5 min (FCM/APNs) | App mobile |
| **Telegram** | 3 min (bot token) | Audiência tech |

### 3. Para WhatsApp (mais comum)

```
- Escaneie QR Code
- Telefone: conecte o número oficial
- Templates: autorize 1 template de teste
- Status: 🟢 "conectado" (pode levar 24h)
```

### 4. Para E-mail

```
- Host SMTP: smtp.seudominio.com
- Porta: 587 (TLS)
- Usuário: naoresponda@seudominio.com
- Senha: [app password]
- Remetente verificado: naoresponda@seudominio.com
```

### 5. Teste o envio

Botão **"Enviar teste"** → vai para seu e-mail/WhatsApp.

### 6. Defina limite diário

```yaml
max_daily: 50    # cold start
warmup_days: 7   # sobe automaticamente
```

## Verificação

- [ ] Dispatcher aparece com status 🟢
- [ ] Mensagem de teste chegou
- [ ] Limite diário configurado
- [ ] Audit log mostra 1 envio de teste

> ⚠️ **Nunca** dispare sem opt-in verificado. LGPD é lei.

## Próximo passo

👉 [`Como criar seu primeiro agente`](04-criar-primeiro-agente.md)

---

**Versão 1.0** · Atualizado 2026-06-02
