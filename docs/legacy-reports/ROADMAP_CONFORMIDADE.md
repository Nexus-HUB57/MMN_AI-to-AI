# 🗺️ Roadmap de Implementação e Conformidade

Este documento detalha o plano de ação para resolver os problemas críticos identificados e garantir a conformidade técnica e legal do projeto **MMN_AI-to-AI**.

---

## 🚀 Fases do Roadmap

### 🔴 Fase 1: Estabilização e Conformidade Legal (Bloqueante)
**Objetivo**: Resolver riscos jurídicos imediatos e limpar o repositório.
- [ ] **Limpeza do Git**: Remover `node_modules` do histórico do repositório usando BFG Repo Cleaner ou `git filter-repo`.
- [ ] **Implementação de LGPD**:
    - Criar `docs/POLITICA_PRIVACIDADE.md`.
    - Adicionar checkbox de consentimento explícito no formulário de cadastro.
    - Implementar endpoint para exclusão de dados (Direito ao Esquecimento).
- [ ] **Revisão do Modelo de Negócio**:
    - Ajustar a lógica de comissões para focar em **venda de produtos/serviços** em vez de apenas recrutamento.
    - Limitar níveis de indicação para conformidade com a Lei 1.521/51.

### 🟠 Fase 2: Integridade Técnica e Type-Safety
**Objetivo**: Restaurar as vantagens da stack tecnológica (tRPC + TypeScript).
- [ ] **Correção do tRPC Frontend**: Substituir `AppRouter = any` pela importação real do tipo do backend.
- [ ] **Sincronização de Rotas**: Corrigir chamadas de `trpc.affiliate` para `trpc.mmn` em todos os componentes frontend.
- [ ] **Validação de Schemas**: Adicionar validações Zod rigorosas para campos sensíveis como CPF.

### 🔵 Fase 3: Segurança e Performance
**Objetivo**: Otimizar o banco de dados e proteger informações sensíveis.
- [ ] **Otimização de Queries**: Criar índices compostos para buscas em rede multinível.
- [ ] **Criptografia**: Garantir que dados sensíveis (CPF) sejam armazenados com criptografia em repouso.
- [ ] **Auditoria**: Implementar logs de acesso a dados pessoais para conformidade com LGPD.

### 🟢 Fase 4: Maturidade e Escala
**Objetivo**: Preparar o sistema para produção em larga escala.
- [ ] **Testes de Carga**: Validar o processamento de comissões com milhares de transações simultâneas.
- [ ] **CI/CD Avançado**: Adicionar etapas de análise estática de segurança (SAST) no GitHub Actions.

---

## ⚖️ Análise de Conformidade Legal

### 1. LGPD (Lei 13.709/2018)
| Requisito | Status | Ação Necessária |
|---|---|---|
| Base Legal para Coleta | ❌ Ausente | Definir "Execução de Contrato" ou "Consentimento". |
| Política de Privacidade | ❌ Ausente | Criar documento público e acessível. |
| Direito de Exclusão | ❌ Ausente | Implementar funcionalidade de "Deletar Conta". |
| Minimização de Dados | ⚠️ Parcial | Avaliar se a coleta de CPF é estritamente necessária em todas as fases. |

### 2. Risco de Pirâmide (Lei 1.521/51)
**Análise**: O modelo atual com 5 níveis e foco em "Packs" de recrutamento apresenta alto risco.
**Recomendação**:
1. Vincular 100% das comissões à **venda efetiva** de créditos de IA ou serviços.
2. Eliminar taxas de adesão que não resultem em produto/serviço de valor real.
3. Documentar a viabilidade matemática do modelo para evitar insustentabilidade.

---

## 🛠️ Guia de Correções Técnicas

### Limpeza do Repositório
```bash
# Adicionar ao .gitignore
node_modules/
.env
*.bak
dist/
```

### Type-Safety no Frontend
```typescript
// frontend/src/lib/trpc.ts
import type { AppRouter } from '../../../backend/src/routers/authRouter'; // Caminho correto
export type { AppRouter };
```

---
*Documento gerado em 15/05/2026 por Manus AI.*
