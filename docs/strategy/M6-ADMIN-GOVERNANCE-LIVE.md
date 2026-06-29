---
title: "M6 · Admin Governance Dashboard LIVE"
version: 1.0.0
status: official
last_updated: 2026-06-28
author: Niko Nexus (CEO/AI)
---

# 🛡️ M6 · Admin Governance Dashboard LIVE

**Data de GO-LIVE:** 2026-06-28
**URL pública:** https://oneverso.com.br/admin/governance
**Branch GitHub:** `feat/m4-governance-loop-20260628`
**Commit M6:** `66f5e4dc` *feat(m6): Dashboard /admin/governance LIVE*

---

## 🎯 O que é

Painel admin completo para operar o **Governance Loop** (M4) com olhos humanos.
Agora o sócio enxerga e controla, em tempo real, **cada decisão** que o Niko Nexus propõe ao quorum dos 3 nós Judge.

```
   /admin/governance
   ┌──────────────────────────────────────────────────────┐
   │  6 Cards stats   ·   Distribuição por kind           │
   │  Filtros (kind + decision) com refetch 15s           │
   │  Timeline auditável (tabela)                         │
   │     ↳ Dialog detalhes (audit digest sha256)          │
   │     ↳ Botão "Marcar executada" (approved)            │
   │     ↳ Botão "Reverter" (executed → rolled-back)      │
   │  Dialog "Propor ação" → submete ao quorum            │
   └──────────────────────────────────────────────────────┘
```

---

## 📐 Arquitetura

### Arquivos novos / alterados
- `frontend/src/pages/AdminGovernance.tsx` (**27 KB**, 27.401 caracteres)
- `frontend/src/pages/AdminDashboardLayout.tsx` (item de menu "Governance" com ícone `ShieldCheck`)
- `frontend/src/App.tsx` (rota `/admin/governance` → `AdminGovernance`)

### Componentes principais
1. **6 Cards de stats** (`Activity`, `CheckCircle2`, `Clock`, `XCircle`, `Play`, `TrendingUp`)
2. **Distribuição por kind** — badges com contagem das 9 ações governadas
3. **Filtros** — kind (10 opções) + decision (4 opções) + botão Atualizar
4. **Timeline auditável** — `Table` com colunas: Action ID · Kind · Subject · Decisão · Cons. · Quality · Risk · Execução · Ações
5. **Dialog de detalhes** — abre quando clica no ícone `Hash`, mostra rationale, payload, audit digest sha256, votos rejeitados
6. **Dialog de proposição** — formulário completo (kind, subject, rationale, initiator, policyMode, minVoters) → submete ao quorum

### tRPC integrado
- `trpc.governanceLoop.stats.useQuery` (refetch 15s)
- `trpc.governanceLoop.list.useQuery` (refetch 15s, com filtros)
- `trpc.governanceLoop.propose.useMutation`
- `trpc.governanceLoop.markExecuted.useMutation`
- `trpc.governanceLoop.markRolledBack.useMutation`

---

## ✅ Validação em produção

| Check | Resultado |
|---|---|
| `https://oneverso.com.br/admin/governance` | **HTTP 200** ✅ |
| Bundle servido | `index-CPzx5ygM.js` (1.2 MB) ✅ |
| Token `admin/governance` presente | ✅ |
| Token `governanceLoop.` presente (tRPC calls) | ✅ |
| Token `Governance Loop` presente (título) | ✅ |
| Token `Niko Nexus` presente (copy oficial) | ✅ |
| Gate de role admin funcionando | ✅ (screenshot mostra "Acesso Negado" sem login) |
| `/var/www/oneverso/public/` sincronizado com `dist/` | ✅ (rsync OK) |

---

## 🖼️ Screenshot

Sem credencial admin a página retorna corretamente "Acesso Negado":
https://www.genspark.ai/api/files/s/KOHQk1n6

Para visualizar o conteúdo completo, faça login com role=admin em https://oneverso.com.br/login.

---

## 🔁 Fluxo operacional do sócio humano

1. Login em `/login` como admin
2. Navegar para **Governance** no menu lateral
3. Ver no topo: total de ações, % aprovação, distribuição por kind
4. Clicar em **"Propor ação governada"** → preencher kind + subject + rationale → submeter
5. Em 1-2 segundos, a ação aparece na timeline com decisão final + audit digest
6. Para ações `approved` com status `pending`, clicar no botão ▶️ "Executar" quando o side-effect for aplicado
7. Para ações `executed` que deram problema, clicar em ⏸️ "Reverter"
8. Clicar no ícone `#` (hash) para ver o digest sha256 completo, votos rejeitados, payload

---

## 🛣️ Próximas frentes

**M5 — Loop CEO/AI ↔ RAG (próximo):**
Cada `GovernanceRecord` aprovado vira **contexto persistente** para o Niko Nexus aprender padrões e refinar heurísticas (approveBias por kind dinâmico, score de quality/risk calibrado por feedback).

**M7 — Judges reais via A2A:** substituir os votos heurísticos por chamadas HTTP/A2A a nós Judge externos (parceiros).

**M8 — Federação Multi-Tenant:** whitelabel votando em decisões cruzadas.

---

## 🔗 Artefatos

- Pacote de deploy M6: pendente upload pós-execução
- Branch GitHub: https://github.com/Nexus-HUB57/MMN_AI-to-AI/tree/feat/m4-governance-loop-20260628
- PR sugerido: https://github.com/Nexus-HUB57/MMN_AI-to-AI/pull/new/feat/m4-governance-loop-20260628
- Commit M6: `66f5e4dc`

---

*Documento mantido por **Niko Nexus** · CEO/AI do Nexus Affil'IA'te*
