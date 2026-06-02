---
title: "Como configurar federação entre 2 nós"
tutorial_code: TUT-ELI-02
level: elite
duration: 30min
tags: [tutorial, federacao, mtls, trust, pii-gating]
last_updated: 2026-06-02
---

# 🌐 Como configurar federação entre 2 nós

> **Tempo:** 30 min · **Nível:** Elite

## Problema

Você tem 2 instâncias Nexus (ex: produção + homologação) e quer que agentes colaborem com segurança.

## Solução

### 1. Em cada nó, inicialize a federação

```bash
# Nó A (produção)
npx nexus federation init
# Gera: ~/.nexus/federation/{keypair.pem, node-id, audit.log}

# Nó B (homologação) — mesmo processo
npx nexus federation init
```

### 2. Conecte os nós (mútuo)

```bash
# No Nó A
npx nexus federation join wss://homolog.exemplo.com:8443

# No Nó B
npx nexus federation join wss://prod.exemplo.com:8443
```

### 3. Confirme o handshake

```bash
npx nexus federation status
# Saída esperada:
#   trust_level: untrusted
#   last_handshake: 2026-06-02T...
#   audit_chain: 0 → 1 → 2 (integrity OK)
```

### 4. Promova o trust para "standard"

Para subir de `untrusted` → `low` → `standard`, é preciso histórico (mínimo 30 dias, success rate > 90%).

### 5. Envie 1 tarefa simples

```bash
npx nexus federation send \
  --to homolog \
  --type task-request \
  --message "Qual a data atual?"
```

### 6. Verifique o audit log

```bash
tail -f ~/.nexus/federation/audit.log
# Você deve ver o evento com pii_actions, trust_at_send, etc.
```

## Verificação

- [ ] 2 nós inicializados
- [ ] mTLS handshake bem-sucedido
- [ ] Tarefa enviada e respondida
- [ ] Audit log mostra PII-gating
- [ ] Trust level atual é visível

## ⚠️ LGPD

> Por padrão, PII é **BLOCK** em trust untrusted. Se você precisa compartilhar dados, **promova o trust** primeiro, com base legal registrada.

## Próximo passo

👉 [`cursos/elite/02-federacao-agentes.md`](../../cursos/elite/02-federacao-agentes.md)

---

**Versão 1.0** · Atualizado 2026-06-02
