---
title: "Como criar seu primeiro agente"
tutorial_code: TUT-AG-01
level: agente
duration: 10min
tags: [tutorial, agente, setup, rapido]
last_updated: 2026-06-02
---

# 🤖 Como criar seu primeiro agente

> **Tempo:** 10 min · **Nível:** Agente

## Problema

Você quer colocar um agente em produção em **menos de 10 minutos**, sem ler toda a trilha de cursos.

## Solução (passo a passo)

### 1. Acesse o painel

```
Admin Runtime → "Criar Agente"
```

### 2. Preencha os básicos

- **Nome:** `Meu Primeiro Agente`
- **Objetivo:** `Converter leads quentes em clientes`
- **Avatar:** escolha um

### 3. Selecione o bundle mínimo

Marque **4 skills** (ordem importa):

- [x] `audience-segmenter`
- [x] `copywriter-persuasivo`
- [x] `judge-revisor`
- [x] `auto-publisher` (whatsapp)

### 4. Configure a autonomia

```yaml
autoApprove:         true
riskLimit:           R$ 50
confidenceThreshold: 0.75
dispatcher:          whatsapp
```

### 5. Salve e ative

Botão **"Ativar"** → status vira 🟢.

### 6. Rode o primeiro ciclo

```
Admin Runtime → [seu agente] → "Executar"
- Audiência: 50 contatos do segmento "lead frio"
- Acompanhe a fila por 30 min
```

## Verificação

- [ ] Agente aparece com status 🟢
- [ ] 50 contatos foram processados
- [ ] ≥ 75% auto-aprovados
- [ ] Judge reprovou < 10%
- [ ] Latência média < 2s

## Próximo passo

👉 [`Como aprovar uma sugestão do Judge`](05-aprovar-sugestao-judge.md)

---

**Versão 1.0** · Atualizado 2026-06-02
