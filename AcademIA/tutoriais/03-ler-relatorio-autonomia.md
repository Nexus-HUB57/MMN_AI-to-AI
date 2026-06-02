---
title: "Como ler o relatório de autonomia"
tutorial_code: TUT-FUN-03
level: fundamental
duration: 8min
tags: [tutorial, autonomia, relatorio, metricas]
last_updated: 2026-06-02
---

# 📊 Como ler o relatório de autonomia

> **Tempo:** 8 min · **Nível:** Fundamental

## Problema

O painel mostra um **relatório de autonomia 24h** e você não sabe o que cada métrica significa.

## Solução

### 1. Acesse o relatório

```
Admin Runtime → [seu agente] → "Relatório 24h"
```

### 2. As 7 métricas-chave

| Métrica | O que significa | Valor saudável |
|---|---|---|
| **Autonomy Score** | 0–100, quão autônomo o agente está | > 75 |
| **Auto-aprovação %** | % de ações que o agente fez sozinho | 75–85% |
| **Judge align** | Concordância humano-Judge | 75–85% |
| **Block rate** | % de mensagens bloqueadas pela Meta | < 1% |
| **Latência p95** | Tempo até ação final (95º percentil) | < 3s |
| **Falhas (24h)** | Total de execuções com erro | < 2% |
| **Opt-out (24h)** | Pessoas que saíram | < 0.5% |

### 3. O que fazer com cada valor

**Autonomy Score < 50:**
- Fila muito cheia? Abaixe `confidenceThreshold` para 0.70
- Judge reprovando muito? Reveja os prompts
- Veja [`playbooks/PB-CRISES-gestao-crise-autonomia.md`](../../playbooks/PB-CRISES-gestao-crise-autonomia.md)

**Block rate > 2%:**
- 🚨 **PARE** o agente
- Reveja template do WhatsApp
- Verifique opt-in da audiência

**Latência p95 > 5s:**
- Redis cache frio (espere 5 min)
- Volume muito alto (divida em 2 agentes)

### 4. Quando exportar

Botão **"Exportar CSV"** → envia para o contador ou para análise externa.

## Verificação

- [ ] Sabe ler as 7 métricas
- [ ] Sabe o que fazer em cada red flag
- [ ] Exportou pelo menos 1 relatório

## Próximo passo

👉 [`playbooks/PB-CRISES-gestao-crise-autonomia.md`](../../playbooks/PB-CRISES-gestao-crise-autonomia.md)

---

**Versão 1.0** · Atualizado 2026-06-02
