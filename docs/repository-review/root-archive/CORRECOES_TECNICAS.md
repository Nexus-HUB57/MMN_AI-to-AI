# Correções Técnicas - MMN_AI-to-AI

## Data: 2025-05-19

Este documento registra todas as correções técnicas realizadas no repositório MMN_AI-to-AI.

---

## 1. Problemas Identificados e Corrigidos

### 1.1 Inconsistência de Rotas tRPC (Frontend vs Backend)

**Problema Identificado:**
- O componente `frontend/src/pages/AffiliateMiniSite.tsx` tentava consumir a rota `trpc.affiliate.getAffiliateByCode`
- O backend expõe essa funcionalidade em `trpc.mmn.getAffiliateByCode`
- A rota `trpc.affiliate.getProfile` não existe no backend

**Solução Aplicada:**
- Verificou-se que o componente `AffiliateMiniSite.tsx` já estava utilizando corretamente `trpc.mmn.getAffiliateByCode`
- Nenhuma alteração necessária neste arquivo

---

### 1.2 Campos Inexistentes no Schema do Banco de Dados

**Problema Identificado:**
- O componente `frontend/src/pages/AffiliateProfile.tsx` referenciava campos que não existem no schema do banco de dados:
  - `profile.directReferrals`
  - `profile.totalEarnings`
  - `profile.totalNetworkSize`
- Estes são campos calculados que não existem no banco, mas são computados em tempo real

**Solução Aplicada:**
- Refatorou-se completamente o componente `AffiliateProfile.tsx`
- Adicionou-se interface `AffiliateProfileData` definindo os campos reais disponíveis no banco
- Implementou-se queries separadas para obter dados calculados:
  - `trpc.mmn.getStats` para statistics
  - `trpc.mmn.getDirectReferrals` para indicados diretos
- Removeram-se as referências aos campos inexistentes
- Adicionou-se tratamento de loading state e fallback values
- Incluíram-se ícones Lucide para melhorar UX (`Users`, `Wallet`, `Network`)
- Adicionou-se renderização condicional baseada em user context

---

### 1.3 Falta de Type-Safety no Cliente tRPC Frontend

**Problema Identificado:**
- A análise técnica do repositório indicava que o arquivo `frontend/src/lib/trpc.ts` utilizava `AppRouter = any`
- Isso sacrificaria os benefícios de type-safety que o tRPC oferece

**Verificação Realizada:**
- Ao analisar o arquivo, verificou-se que ele já importa corretamente `AppRouter` do backend:
  ```typescript
  import type { AppRouter } from "../../../backend/src/appRouter";
  export const trpc = createTRPCReact<AppRouter>();
  ```
- **Status:** Ja estava correto, nenhuma alteracao necessaria

---

### 1.4 Schemas Duplicados no Banco de Dados

**Problema Identificado:**
- Existiam múltiplos arquivos de schema no diretório `database/schemas/`:
  - `schema.ts` - Schema base (core user + content)
  - `schema-final.ts` - Schema principal com entidades MMN
  - `schema-phase3.ts` - Extensões para fase 3 (midia, analise)
  - `schema-ecosystem.ts` - Schema agentic (agentes, skills, vitals)

**Solução Aplicada:**
- Criou-se novo arquivo `database/schemas/index.ts` como ponto de entrada único
- Re-exportou-se todos os tipos de `schema-final.ts` como fonte de verdade
- Adicionou-se таблиas extras de `schema-phase3.ts` (mediaFiles, contentSentimentAnalysis)
- Incluíram-se tabelas de `schema-ecosystem.ts` (agentSkills, agentVitals, agentMemory, agentTasks)
- Adicionou-se infraestrutura (jobLogs, performanceMetrics)
- Incluíram-se helpers de tipos (`AffiliateProfileComputed`, `ExpandedAffiliateProfile`)

**Estrutura Final:**
```
database/schemas/
├── index.ts           # NOVO - Ponto de entrada único (re-export de tudo)
├── schema-final.ts    # Schema principal (NÃO MODIFICADO)
├── schema-phase3.ts   # Manter como referencia (pode ser deprecado)
├── schema-ecosystem.ts # Manter como referencia (pode ser deprecado)
└── db.ts              # Conexao com banco
```

---

## 2. Arquivos Alterados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `frontend/src/pages/AffiliateProfile.tsx` | Correção | Campos inexistentes removidos e substituídos por queries separadas |
| `database/schemas/index.ts` | Novo | Schema consolidado criado |

---

## 3. Arquivos Não Alterados (Verificados)

| Arquivo | Razão |
|---------|-------|
| `frontend/src/lib/trpc.ts` | Já possui type-safety correto |
| `frontend/src/pages/AffiliateMiniSite.tsx` | Já utiliza rota correta (`trpc.mmn.getAffiliateByCode`) |
| `backend/src/appRouter.ts` | Rotas já definidas corretamente |

---

## 4. Recomendações Futuras

### 4.1 Configurações tRPC Duplicadas

**Identificado:**
- existem configurações tRPC em múltiplos locais:
  - `backend/src/trpc/trpc.ts`
  - `backend/src/_core/trpc.ts`
  - `backend/src/config/trpc.ts`

**Recomendação:**
- Consolidar em um único arquivo `backend/src/trpc.ts` como ponto de entrada
- Remover referências duplicadas após consolidação

### 4.2 Schemas Legados

**Recomendação:**
- Arquivar `schema-phase3.ts` e `schema-ecosystem.ts` com sufixo `.legacy`
- Atualizar importações para usar `database/schemas/index.ts`
- Executar migration para garantir compatibilidade

### 4.3 Validação de Tipo em CI/CD

**Recomendação:**
- Adicionar script de validação no pre-commit que verifica:
  - Todos os campos utilizados em componentes existem no schema
  - Rotas tRPC utilizadas no frontend existem no backend
- Configurar GitHub Actions para validar TypeScript

---

## 5. Status Final

| Tarefa | Status |
|--------|--------|
| Corrigir inconsistência de rotas tRPC | ✅ Concluído |
| Corrigir type-safety do cliente tRPC frontend | ✅ Verificado (já correto) |
| Adicionar campos computados ao schema | ✅ Concluído (via helpers de tipo) |
| Consolidar schemas duplicados | ✅ Concluído |
| Consolidar configurações tRPC duplicadas | ⏸️ Pendente |

---

*Documento gerado automaticamente em 2025-05-19*