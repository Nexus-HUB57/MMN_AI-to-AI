---
title: "Como ativar 2FA no painel"
tutorial_code: TUT-FUN-01
level: fundamental
duration: 3min
tags: [tutorial, 2fa, seguranca, fundamental]
last_updated: 2026-06-02
---

# 🔐 Como ativar 2FA no painel

> **Tempo:** 3 min · **Nível:** Fundamental

## Problema

Você não consegue usar skills com `confidenceThreshold ≥ 0.75` sem 2FA ativado.

## Solução

### 1. Acesse Configurações → Segurança

```
app.oneverso.com.br/affiliate/ → Configurações → Segurança
```

### 2. Clique em "Ativar 2FA"

### 3. Escolha o método

- **Authenticator App** (recomendado) — Google Authenticator, Authy, 1Password
- **SMS** (fallback) — menos seguro, mas funciona

### 4. Escaneie o QR Code

Abra o app authenticator → escaneie.

### 5. Confirme com o código de 6 dígitos

Digite o código gerado no campo de confirmação.

### 6. Salve os **códigos de backup**

São 10 códigos de uso único. Guarde em local seguro (cofre de senhas).

## Verificação

- [ ] 2FA ativo (ícone 🛡️ no canto superior direito)
- [ ] Códigos de backup salvos
- [ ] Logout/login testado

> ⚠️ **Sem 2FA, você não consegue ativar skills intermediárias ou avançadas.**

## Próximo passo

👉 [`Como configurar 1 dispatcher`](02-configurar-dispatcher.md)

---

**Versão 1.0** · Atualizado 2026-06-02
