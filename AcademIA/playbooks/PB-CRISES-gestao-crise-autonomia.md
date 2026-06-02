---
title: "PB-CRISES-AUTONOMIA · Crise de Autonomia SHO"
playbook_code: PB-CRISES-AUTONOMIA
category: crise
duration_execution: 60 min
tags: [playbook, crise, autonomia, sho, judge, calibracao]
last_updated: 2026-06-02
---

# 🚨 PB-CRISES-AUTONOMIA · Crise de Autonomia SHO

> **Tempo de leitura:** 10 min · **Tempo de execução:** 60 min · **Quando usar:** Autonomy Score caindo, fila do Judge explodindo, agente "travado"

## 🚨 Quando usar

Você detecta **qualquer** destes sinais:
- Autonomy Score caiu > 10 pontos em 24h
- Fila do Judge tem > 100 itens pendentes
- Latência p95 > 10s
- Agente reporta "stuck" ou "timeout" repetidamente

## ⚠️ Pré-condições

- [ ] Acesso ao painel Admin
- [ ] Pelo menos 1 Estrategista acessível para mentoria
- [ ] Audit log legível

## 📋 Passo a passo

### Passo 1 — PAUSA IMEDIATA (5 min)

```
Admin Runtime → [agente afetado] → "PAUSAR"
```

> **NÃO tente corrigir antes de pausar.** Você só vai piorar.

### Passo 2 — DIAGNÓSTICO (15 min)

Abra o **Relatório de Autonomia 24h** e responda:

| Pergunta | Diagnóstico provável |
|---|---|
| **Judge reprovação > 30%** | Prompts descalibrados |
| **Fila lotada** | confidenceThreshold muito alto |
| **Latência > 10s** | Redis frio / volume alto |
| **Falhas 5xx** | Bug em skill / deploy recente |
| **Tudo zerado** | Integração quebrada |

### Passo 3 — AÇÃO ESPECÍFICA POR DIAGNÓSTICO (30 min)

**Se Judge reprovação > 30%:**

```
- Rever prompts em Lab-Nexus/prompts/
- Re-rodar copywriter-persuasivo com 3 hooks
- Ajustar confidenceThreshold para 0.70 (temporário)
- Reativar agente em modo "review" (Judge decide tudo)
```

**Se Fila lotada:**

```
- confidenceThreshold muito alto (> 0.85) → abaixar para 0.70
- Aumentar batch size do dispatcher
- Considerar dividir agente em 2 (segmento quente + frio)
```

**Se Latência > 10s:**

```
- Verificar Redis (pode estar frio)
- Reiniciar dispatcher: Admin → Dispatchers → "Reiniciar"
- Verificar carga do banco: /admin/observability
```

**Se Falhas 5xx:**

```
- Ver logs: Admin → Audit Log → "filtrar por status=error"
- Reportar para Eng. SHO on-call
- NÃO reativar até validação
```

### Passo 4 — REATIVAÇÃO GRADUAL (10 min)

```
1. Reativar em modo "shadow" (executa mas não age)
2. Acompanhar 1h
3. Se tudo OK: reativar em modo "review"
4. Acompanhar mais 1h
5. Reativar em modo "auto" (com threshold ajustado)
```

### Passo 5 — PÓS-MORTEM (24h depois)

- [ ] Documentar causa raiz
- [ ] Documentar ação corretiva
- [ ] Atualizar prompts/thresholds
- [ ] Compartilhar com `#sho-oncall`

## 🛑 Quando escalar

- Crise afeta > 3 agentes → **C-level + Eng. SHO sênior**
- Causa é bug de código → **PR de fix imediato**
- Padrão se repete em 7 dias → **revisão arquitetural**

## 📞 Contatos de emergência

- **Eng. SHO on-call:** `#sho-oncall` (Discord, 24/7)
- **Estrategista sênior:** ver lista em `Admin → Equipe`

## ⏭️ Próximo playbook

👉 [PB-CRISES-BAN · Ban de WhatsApp](PB-CRISES-gestao-crise-ban-whatsapp.md)

---

**Versão 1.0** · Atualizado 2026-06-02
