---
title: "Como ler uma tabela de coorte"
tutorial_code: TUT-MAS-02
level: master
duration: 10min
tags: [tutorial, coorte, churn, retencao]
last_updated: 2026-06-02
---

# 📊 Como ler uma tabela de coorte

> **Tempo:** 10 min · **Nível:** Master

## Problema

Você exportou uma tabela de coorte do painel e não sabe o que cada célula significa.

## Solução

### 1. Encontre a tabela

```
Analytics → Coortes → "Tabela de Retenção"
```

### 2. Entenda as colunas

```
                  Mês 0    Mês 1    Mês 2    Mês 3
Coorte Jan/26:   100%     72%      58%      51%
Coorte Fev/26:   100%     68%      52%      44%
```

- **Linha** = coorte (mês de aquisição)
- **Coluna** = mês de vida (Mês 0 = entrada)
- **Célula** = % da coorte que ainda está ativa

### 3. Os 3 padrões para identificar

**A — Boa retenção (deve ser seu alvo):**
```
100%  80%  70%  65%  60%  ← linha caindo devagar
```

**B — Churn alto (problema):**
```
100%  50%  30%  20%  15%  ← linha caindo rápido
```

**C — Degradação (coortes novas piores):**
```
Jan: 100%  80%  70%  ...
Fev: 100%  70%  55%  ...  ← pior
Mar: 100%  60%  40%  ...  ← pior ainda
```

### 4. Tire 1 ação por padrão

| Padrão | Ação |
|---|---|
| **A** (bom) | Escalar este canal de aquisição |
| **B** (churn alto) | Ativar `lifecycle-orchestrator` D+1, D+3 |
| **C** (degradação) | Investigar mudança de targeting em Fev |

## Verificação

- [ ] Identificou o melhor mês
- [ ] Identificou o pior mês
- [ ] Tirou 1 ação documentada

## Próximo passo

👉 [`cursos/master/03-coortes-churn.md`](../../cursos/master/03-coortes-churn.md)

---

**Versão 1.0** · Atualizado 2026-06-02
