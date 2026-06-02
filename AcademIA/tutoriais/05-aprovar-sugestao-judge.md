---
title: "Como aprovar uma sugestão do Judge"
tutorial_code: TUT-AG-02
level: agente
duration: 5min
tags: [tutorial, judge, aprovacao, fila]
last_updated: 2026-06-02
---

# ⚖️ Como aprovar uma sugestão do Judge

> **Tempo:** 5 min · **Nível:** Agente

## Problema

Você tem 50 itens na fila do Judge. Não sabe por onde começar.

## Solução

### 1. Abra a Fila de Aprovações

```
Admin Runtime → Fila de Aprovações
```

### 2. Ordene por "idade" (decrescente)

Itens mais velhos primeiro (SLA: 4h).

### 3. Para cada item, leia:

- 📝 **Trecho** (1ª linha + 1ª CTA)
- ⚠️ **risk_flags** (chips coloridos)
- 💡 **suggestions** (do Judge)

### 4. Decida em < 30s por item

| Score Judge | Decisão sugerida |
|---|---|
| ≥ 0.85 (🟢 safe) | **Aprovar** (`A`) |
| 0.70–0.85 (🟡 review) | **Ler com atenção** e decidir |
| 0.55–0.70 (🟠 risk) | **Editar** ou **Rejeitar** |
| < 0.55 (🔴 block) | **Rejeitar** sempre |

### 5. Atalhos de teclado

- `A` = aprovar
- `E` = editar
- `R` = rejeitar (pede motivo)
- `B` = bloquear skill 1h (emergência)

## Verificação

- [ ] Fila esvaziada em < 2h
- [ ] Alinhamento humano-Judge ≥ 75%
- [ ] Zero itens com block rate > 2% aprovados

## Próximo passo

👉 [`Como ler o relatório de autonomia`](03-ler-relatorio-autonomia.md)

---

**Versão 1.0** · Atualizado 2026-06-02
