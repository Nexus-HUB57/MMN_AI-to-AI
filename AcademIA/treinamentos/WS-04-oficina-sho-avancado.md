---
title: "WS-04 · Oficina SHO Avançado (2h)"
description: "Material oficial Academ'IA · academia"
tags: [academia, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

# WS-04 · Oficina SHO Avançado (2h)

**Nível:** Agente → Master
**Pré-requisitos:** Conclusão de WS-01 e curso agente 03-judge-revisor
**Formato:** Workshop hands-on (2 horas)
**Mentor:** Sir Nexus Alencar

---

## 🎯 Objetivos

Ao final deste workshop, o aluno será capaz de:

1. Configurar SHO em **modo S3 (Autônomo)** com guardrails explícitos
2. Implementar **aprovação amostral** (S2) para decisões de risco médio
3. Auditar trails de decisão e detectar drift de comportamento
4. Ajustar temperature e outros hiperparâmetros de LLM por categoria de skill
5. Operar o **rollback reversível** em cenários de falha

---

## 📋 Agenda (120 minutos)

### Bloco 1 — Teoria (30 min)
- Arquitetura SHO: 5 camadas (Runtime, Orquestração, Inteligência, Federação, Experiência)
- SHO Levels: S0 → S4 (Manual → Federado)
- Trade-off: Velocidade × Controle × Auditabilidade
- Conceito de **guardrail explícito** vs **policy implícita**

### Bloco 2 — Demo ao vivo (20 min)
- Painel `/admin/runtime` em modo S3
- Fila de aprovação vs fila autônoma
- Judge Revisor como gatekeeper
- Visualização de telemetry stream

### Bloco 3 — Hands-on #1 (30 min)
**Exercício:** Configurar SHO S2 para skill `lead-enricher`
- Definir threshold de aprovação humana
- Configurar rollback automático se confidence < 0.7
- Testar com 10 leads reais
- Auditar log de decisões

### Bloco 4 — Hands-on #2 (30 min)
**Exercício:** Promover skill `pricing-optimizer` para S3
- Definir guardrails (preço mínimo, máximo, variação %)
- Ativar execução autônoma
- Monitorar métricas por 24h
- Identificar quando rebaixar para S2

### Bloco 5 — Q&A e fechamento (10 min)
- Casos extremos
- Quando NÃO usar S3
- Próximo passo: WS-05 (Federação de Agentes)

---

## 🧪 Materiais Necessários

- Conta ativa em produção (ou sandbox `staging.oneverso.com.br`)
- Acesso ao painel `/admin/runtime`
- 2 skills ativas para experimentação
- Dataset de teste (mínimo 50 leads)

## 📦 Entregáveis

- [ ] Configuração S2 validada de 1 skill
- [ ] Configuração S3 validada de 1 skill
- [ ] Relatório de audit log (48h)
- [ ] Diagrama de guardrails implementados

## 🎓 Critério de Conclusão

- Promover pelo menos 1 skill para S3 sem regressão de qualidade
- Demonstrar rollback reversível funcional
- Score ≥ 0.85 no Judge Revisor pós-workshop

---

*Acad. Nexus Affil'IA'te · WS-04 · 2026*
