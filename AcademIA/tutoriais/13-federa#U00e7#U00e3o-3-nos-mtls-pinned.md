---
title: "Como escalar federação para 3+ nós com mTLS pinned"
tutorial_code: TUT-ELI-03
level: elite
duration: 45min
prerequisites: ["12-federação-2-nos.md"]
tags: [tutorial, federacao, mtls, pinned-cert, multi-tenant, elite]
last_updated: 2026-06-02
---

# 🌐 Como escalar federação para 3+ nós com mTLS pinned

> **Tempo:** 45 min · **Nível:** Elite · **Pré-requisito:** TUT-ELI-02 (federação 2 nós)

## Problema

Você já tem 2 nós em federação (TUT-ELI-02) e precisa adicionar um terceiro nó — por exemplo, um nó de analytics isolado que só recebe dados pseudoanonimizados. Sem cuidado, você pode acidentalmente abrir PII para um nó não confiável ou cair em loops de roteamento.

## Quando usar este tutorial

- Você tem 2+ nós Nexus federados
- Vai adicionar um terceiro nó (analytics, parceiro, multi-região)
- Precisa de mTLS pinned (certificado fixado por hash) e PII gate reforçado
- Quer roteamento inteligente de tarefas baseado em capacidades (não em qualquer nó)

## Solução

### 1. Inicialize o terceiro nó (analytics isolado)

```bash
# Nó C (analytics, isolado por subnet)
npx nexus federation init --profile analytics \
  --data-residency br \
  --allowed-skills cohort-analyzer,roi-attributor,analytics-reporter
```

> 🔒 O perfil `analytics` por padrão nega skills de escrita (copy, auto-publisher). Só leitura/agregação.

### 2. Pinned certificate (mTLS reforçado)

```bash
# No Nó C: gera CSR e fixa a chave pública esperada de A e B
npx nexus federation pin \
  --peer prod.exemplo.com \
  --pubkey-sha256 $(openssl x509 -in prod-cert.pem -pubkey -noout | openssl pkey -pubin -outform DER | sha256sum | cut -d' ' -f1) \
  --peer homolog.exemplo.com \
  --pubkey-sha256 $(openssl x509 -in homolog-cert.pem -pubkey -noout | openssl pkey -pubin -outform DER | sha256sum | cut -d' ' -f1)
```

**Por que pinned?**

| Cenário | mTLS comum | mTLS pinned |
|---|---|---|
| CA confiável comprometida | ❌ aceita certificado falso | ✅ só aceita o fingerprint esperado |
| MITM com CA auto-assinada | ❌ aceita se CA for confiável | ❌ rejeita (fingerprint diferente) |
| Rotação de certificado | ✅ automática | ⚠️ precisa re-pinnar (script abaixo) |

**Script de rotação (roda a cada 90 dias):**

```bash
#!/bin/bash
# rotate-pins.sh
for peer in prod homolog; do
  npx nexus federation pin \
    --peer ${peer}.exemplo.com \
    --pubkey-sha256 $(openssl x509 -in ${peer}-cert.pem -pubkey -noout | openssl pkey -pubin -outform DER | sha256sum | cut -d' ' -f1) \
    --audit "rotation-$(date +%Y%m%d)" \
    --no-restart
done
# Só aplica o pin de fato quando TODOS os peers confirmarem
npx nexus federation pins apply
```

### 3. Conecte o terceiro nó com capacidade explícita

```bash
# No Nó C
npx nexus federation join wss://prod.exemplo.com:8443 \
  --capabilities "analytics.read,cohort.compute" \
  --max-throughput 2000 \
  --trust-at-join low
```

```bash
# No Nó A (prod)
npx nexus federation approve analytics.exemplo.com \
  --capabilities "analytics.read,cohort.compute" \
  --ttl 90d
```

> O `ttl` evita aprovações "eternas" — todo nó aprovado expira e precisa re-validar.

### 4. Roteamento por capacidade (não por ID)

```bash
# Em vez de rotear para um nó fixo, descreva o que precisa
npx nexus federation send \
  --capability "cohort.compute" \
  --payload '{"cohort":"2026-Q1-novos","metric":"churn_30d"}' \
  --fallback local
```

O router de federação vai escolher o nó que:

1. Tem a capability declarada
2. Está com trust ≥ low
3. Está mais perto (latência)
4. Tem capacidade disponível

Se nenhum nó atende → `--fallback local` (executa no nó de origem, sem federar).

### 5. Validar PII-gating no terceiro nó

```bash
# Rode o test suite oficial
npx nexus federation test --node analytics.exemplo.com \
  --cases pii.blocked,pseudo.allowed,bulk.redacted
```

Saída esperada:

```
[OK] pii.blocked: 14/14 PII types bloqueados antes do envio
[OK] pseudo.allowed: hash consistente + salt rotativo
[OK] bulk.redacted: > 10k registros → k-anonimidade k=5 aplicada
```

### 6. Monitorar com o painel

```
Admin → Federação → Nós
  ┌────────────┬──────────┬─────────────┬──────────────┬───────────┐
  │ Nó         │ Trust    │ Capacidade  │ PII Action   │ Latência  │
  ├────────────┼──────────┼─────────────┼──────────────┼───────────┤
  │ prod       │ standard │ full        │ tokenize     │ 12ms      │
  │ homolog    │ low      │ staging     │ tokenize     │ 28ms      │
  │ analytics  │ low      │ analytics.* │ block        │ 41ms      │
  └────────────┴──────────┴─────────────┴──────────────┴───────────┘
```

## Verificação

- [ ] Nó C inicializado com perfil `analytics`
- [ ] Pins de pubkey de A e B ativos no C
- [ ] Aprovação do prod com TTL de 90 dias
- [ ] Roteamento por capability testado
- [ ] PII-gating test suite 100% verde
- [ ] Painel mostra os 3 nós com trust correto

## ⚠️ LGPD & Segurança

1. **Nunca** faça pin de chave privada — só da pública
2. PII action `block` é o padrão em trust `low`. Só promova para `tokenize` com base legal registrada no `audit.log`
3. Não compartilhe IP, user-agent ou device-id com nó analytics — eles quebram pseudoanonimização
4. Rotacione pins a cada 90 dias (script acima)
5. TTL de aprovação = obrigação de reavaliar a cada ciclo

## Anti-patterns

- ❌ Aprovar nó "para sempre" (sem TTL) → permissões esquecem de ser revistas
- ❌ Compartilhar mesma chave privada entre nós → quebra o pressuposto de identidade
- ❌ Confiar em CA pública sozinha (sem pin) → MITM possível se CA for comprometida
- ❌ Mandar PII real para nó analytics "só dessa vez" → LGPD art. 46

## Próximo passo

👉 [`cursos/elite/02-federacao-agentes.md`](../../cursos/elite/02-federacao-agentes.md) — curso completo de federação
👉 [`Lib-Nexus/agents-specs/03-federation-gate.md`](../../Lib-Nexus/agents-specs/03-federation-gate.md) — spec técnica

---

**Versão 1.0** · Atualizado 2026-06-02 · Equipe Nexus
