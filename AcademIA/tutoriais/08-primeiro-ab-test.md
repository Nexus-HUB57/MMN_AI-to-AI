---
title: "Como rodar seu primeiro A/B test"
tutorial_code: TUT-MAS-01
level: master
duration: 15min
tags: [tutorial, ab-test, estatistica, master]
last_updated: 2026-06-02
---

# 🧪 Como rodar seu primeiro A/B test

> **Tempo:** 15 min · **Nível:** Master

## Problema

Você quer comparar 2 versões de copy mas não sabe por onde começar.

## Solução

### 1. Defina a hipótese (1 linha)

```
"SE trocar o gancho 'Em 90 dias' por 'Em 30 dias',
 ENTÃO o reply rate sobe pelo menos 20%."
```

### 2. Crie as 2 variações

```typescript
// Variação A — controle
{
  hook: "Em 90 dias, primeira renda extra",
  body: "Mesmo que você nunca tenha..."
}

// Variação B — tratamento
{
  hook: "Em 30 dias, primeira renda extra",
  body: "Mesmo que você nunca tenha..."
}
```

### 3. Use a skill `ab-test-designer`

```typescript
{
  hypothesis: "...",
  variations: [{ id: "A", ...}, { id: "B", ...}],
  audience: { segment: "quentes_30d", size: 3000 },
  successMetric: "reply_rate",
  minSampleSize: 1500,
  confidenceLevel: 0.95,
  maxDurationDays: 14,
  stopOnSignificance: true
}
```

### 4. Acompanhe em tempo real

```
Admin Runtime → A/B Tests → [seu teste]
- Coorte A: ... replies (8.27%, CI: 6.8–9.7)
- Coorte B: ... replies (11.41%, CI: 9.7–13.1)
- p-value: 0.012 → SIGNIFICANTE
```

### 5. Promova o vencedor

Botão **"Promover para 100%"** → Variação B vira padrão.

## Verificação

- [ ] n ≥ 1.500/coorte
- [ ] p < 0.05
- [ ] Vencedor promovido
- [ ] Resultado documentado

> ⚠️ **Nunca pare antes do n mínimo.** Senão você está pescando dados.

## Próximo passo

👉 [`cursos/master/02-ab-test-judge.md`](../../cursos/master/02-ab-test-judge.md)

---

**Versão 1.0** · Atualizado 2026-06-02
