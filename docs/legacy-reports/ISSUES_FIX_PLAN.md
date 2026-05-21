# Plano de Correção de Issues - GitHub Repository

**Repositório:** Nexus-HUB57/MMN_AI-to-AI
**Total de Issues:** 36
**Data de Início:** 2026-05-19
**Autor:** MiniMax Agent

---

## Visão Geral das Issues

| Prioridade | Quantidade | Issues |
|------------|------------|--------|
| **P0** | 15 | #6-16, #34, #38-39 |
| **P1** | 11 | #10-11, #30-37, #41 |
| **P2** | 4 | #18, #21, #32-33 |

### Categorias de Issues

| Categoria | Issues |
|-----------|--------|
| **Agentic** | AG-18 a AG-29, EPIC-01 a EPIC-07 |
| **Backend** | #13-15 |
| **Frontend** | #13-14 |
| **Database** | #15, #31, #38 |
| **Security** | #16, #37-39, EPIC-03, EPIC-07 |
| **Observability** | #11, #34-36, AG-23-24, AG-29 |
| **Infra** | #12, #35, AG-26, AG-28 |

---

## Issues P0 - Correção Prioritária

### EPIC-01: Estabilização dos Contratos e Runtime (#6)

** Título:** Estabilização dos contratos e runtime

**Objetivo:** Garantir type-safety end-to-end entre frontend, backend e mobile

**Arquivos a Verificar:**
- `frontend/src/App.tsx` - rotas
- `frontend/src/trpc/` - client
- `backend/src/routers/` - routers tRPC
- `backend/src/trpc/` - context e setup

### EPIC-02: Fundação do Control Plane Agentic (#7)

**Título:** Fundação do Control Plane Agentic

**Objetivo:** Implementar infraestrutura base de orquestração de agentes

**Arquivos:**
- `backend/src/agentic/` - arquitetura agentic
- `backend/src/agentic/orchestrator.ts`
- `backend/src/agentic/types.ts`

### EPIC-03: Policy Engine, Judge e Human-in-the-Loop (#8)

**Título:** Policy Engine, Judge e Human-in-the-Loop

**Objetivo:** Implementar validação de outputs e interveniência humana

**Arquivos:**
- `backend/src/agentic/judge/` - LLM Judge
- `backend/src/agentic/policies/` - Policies
- `backend/src/agentic/audit.ts` - Logs de auditoria

### AG-13: Fechar type-safety tRPC (#13)

**Título:** [AG-01] Fechar type-safety tRPC no frontend e mobile

**Descrição:** Garantir que todos os endpoints tRPC estejam com types corretos

**Solução:**
1. Verificar `frontend/src/trpc-provider.tsx`
2. Verificar `backend/src/trpc/context.ts`
3. Gerar tipos do backend para o frontend

### AG-14: Corrigir rotas e payloads (#14)

**Título:** [AG-02] Corrigir divergências de rotas e payloads

**Solução:**
1. Mapear rotas frontend → endpoints tRPC
2. Verificar consistência de payloads
3. Corrigir mismatches encontrados

### AG-15: Alinhar schema e queries (#15)

**Título:** [AG-03] Alinhar schema, queries e campos

**Solução:**
1. Verificar `database/schemas/schema.ts`
2. Verificar queries nos routers
3. Corrigir divergências

### AG-16: Endurecer autenticação (#16)

**Título:** [AG-04] Endurecer autenticação e sessão

**Solução:**
1. Verificar `backend/src/routers/authRouter.ts`
2. Implementar refresh tokens
3. Adicionar validação de sessão

### AG-34: Instrumentar métricas OpenTelemetry (#34)

**Título:** [AG-22] Instrumentar métricas da camada agentic

**Solução:**
1. Adicionar instrumentação Prometheus/OpenTelemetry
2. Exportar métricas de agentes
3. Dashboard de métricas

### AG-38: Implementar consentimento (#38)

**Título:** [AG-24] Implementar consentimento, opt-in, opt-out

**Solução:**
1. Adicionar tabelas de consentimento no schema
2. Implementar endpoints de opt-in/opt-out
3. Suppress list para comunicações

### AG-39: Secrets management (#39)

**Título:** [AG-25] Endurecer secrets management

**Solução:**
1. Verificar `.env.example`
2. Implementar vault para secrets
3. MFA para operadores críticos

---

## Issues P1 - Correção Secundária

### EPIC-05: Memória e Personalização (#10)
### EPIC-06: Observabilidade (#11)
### AG-18: Memória episódica (#31)
### AG-23: Dashboards operação (#35)
### AG-24: Alertas operacionais (#36)
### AG-25: Runbooks (#37)
### AG-26: Rollout supervisionado (#40)
### AG-29: KPIs e governança (#41)

---

## Issues P2 - Correção Terciária

### AG-18: Tools Layer (#30)
### AG-21: Personalização (#33)
### AG-20: Vector store (#32)

---

## Progresso de Correção

| Issue | Título | Status | Notas |
|-------|--------|--------|-------|
| #13 | Type-safety tRPC | ⏳ Em progresso | |
| #14 | Rotas/payloads | 🔲 Pendente | |
| #15 | Schema/queries | 🔲 Pendente | |
| #16 | Autenticação | 🔲 Pendente | |
| #6 | Estabilização runtime | 🔲 Pendente | |
| #7 | Control Plane | 🔲 Pendente | |
| #8 | Policy Engine | 🔲 Pendente | |
| #34 | OpenTelemetry | 🔲 Pendente | |
| #38 | Consentimento | 🔲 Pendente | |
| #39 | Secrets | 🔲 Pendente | |

---

**Última Atualização:** 2026-05-19
**Autor:** MiniMax Agent